import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { sanitize } from '../utils/sanitize';
import HttpError from '../middlewares/HttpError';
import { isSanaModelType, SANA_MODEL_NAMES, SanaModelType, SanaOptions } from '../config/modelOptions';
import { createJob } from '../services/jobService';
import { jobProcess } from '../services/processService';
import getJobExecutionLog from '../utils/getJobExecutionLog';
import {
    DownloadZipRequest,
    GetJobResultsRequest,
    JobData,
    ProcessedJobResponse,
    ProcessJobData,
    ProcessJobRequest,
    SubmitJobRequest,
    UnifiedResponse,
    UploadedFiles,
} from '../../types/types';
import path from 'path';
import { tmpDir } from '../middlewares/upload';
import AdmZip from 'adm-zip';

// /**
//  * Downloads the zip file for a job based on the request parameters.
//  * @param req - The request object.
//  * @param res - The response object.
//  * @param next - The next middleware function.
//  * @returns A Promise that resolves when the download is complete or rejects with an error.
//  */
// const downloadZipJob = async (req: DownloadZipRequest, res: Response, next: NextFunction): Promise<void> => {
//     const jobId = req.params.id;
//     if (!jobId) {
//         throw new HttpError('no jobid', { status: 400 });
//     }
//     const infoFilePath = path.join(__dirname, `../process/${jobId}/info.json`);
//     try {
//         const infoJsonContent = fs.readFileSync(infoFilePath, 'utf8');
//         const jobData = JSON.parse(infoJsonContent);
//         const zipName = jobData.zipName;
//         const zipLocation = path.join(__dirname, `../process/${jobId}`, zipName);
//         if (!fs.existsSync(zipLocation)) {
//             throw new HttpError('Zip file not found', { status: 404 });
//         }

//         // could be error with args
//         return res.download(zipLocation, zipName, (err) => {
//             if (err) {
//                 console.error('Error sending zip file:', err);
//                 throw new HttpError('Could not send zip file', { status: 500 });
//             }
//         });
//     } catch (error) {
//         console.error('Error reading info.json:', error);
//         throw new HttpError('Could not read info.json', { status: 500 });
//     }
// };
/**
 * Downloads the zip file for a job based on the request parameters.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A Promise that resolves when the download is complete or rejects with an error.
 */
const downloadZipJob = async (req: DownloadZipRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            throw new HttpError('Job ID is required.', { status: 400 });
        }

        const jobDir = path.join(__dirname, '../process', jobId);
        const infoFilePath = path.join(jobDir, 'info.json');

        // Check if job directory exists
        if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
            throw new HttpError('Job not found.', { status: 404 });
        }

        // Check if info.json exists
        if (!fs.existsSync(infoFilePath)) {
            throw new HttpError('Job data not found. The job might not have been processed yet.', {
                status: 500,
            });
        }

        // Read job data
        try {
            const infoJsonContent = fs.readFileSync(infoFilePath, 'utf8');
            const jobData = JSON.parse(infoJsonContent);

            if (!jobData.zipName) {
                throw new HttpError('Invalid job data: missing zip file name.', {
                    status: 500,
                });
            }

            const zipLocation = path.join(jobDir, jobData.zipName);

            if (!fs.existsSync(zipLocation)) {
                throw new HttpError('Zip file not found.', { status: 404 });
            }

            // Send the zip file
            res.download(zipLocation, jobData.zipName, (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                    // log the error and let the download fail gracefully
                }
            });
        } catch (error) {
            console.error('Error reading job data:', error);
            throw new HttpError('Could not read job data.', { status: 500 });
        }
    } catch (err) {
        next(err);
    }
};

/**
 * Controller to handle job submission with file uploads.
 */
const submitJobController = async (req: SubmitJobRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {
            throw new HttpError('Two network files are required.', { status: 400 });
        }

        // 1. Validate required fields
        if (!req.body.options) {
            throw HttpError.badRequest('Options field is required.');
        }

        const sanaVersion = req.body.version;
        if (!sanaVersion) {
            throw new HttpError('Version field is required.', { status: 400 });
        }

        // Validate SANA version
        if (!isSanaModelType(sanaVersion)) {
            throw HttpError.badRequest(
                `Invalid SANA version: ${sanaVersion}. Must be one of: ${SANA_MODEL_NAMES.join(', ')}`
            );
        }

        console.log('request body.options:', req.body.options);//TESTING
        let options: SanaOptions;
        if (typeof req.body.options === 'string') {
            try {
                options = JSON.parse(req.body.options);
            } catch (e) {
                throw HttpError.badRequest('Options must be a valid JSON string');
            }
        } else {
            options = req.body.options;
        }
        console.log('request options after:', options);//TESTING

        // 2. Sanitize and validate options based on model version
        const sanitizedOptions = await sanitize(options, sanaVersion);

        if (process.env.NODE_ENV === 'development') {
            console.log('before sanitation:', options);
            console.log('after sanitation:', sanitizedOptions);
        }

        // 3. Update request body with sanitized options
        req.body.options = sanitizedOptions;

        // 4. Create job with validated inputs
        // const result = await createJob(req.files['files'], sanitizedOptions, sanaVersion);
        const uploadedFiles: UploadedFiles = {
            files: req.files['files'],
            similarityFiles:  req.files['similarityFiles'],
        };
        const result = await createJob(uploadedFiles, sanitizedOptions, sanaVersion);

        // 5. Send successful response
        const response: UnifiedResponse<JobData> = {
            status: 'success',
            message: 'Job submitted successfully',
            data: result,
        };
        if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
            const redirectResponse: UnifiedResponse = {
                status: 'redirect',
                message: 'Job submitted successfully. Redirecting...',
                redirect: `/submit-job/${result.id}`,
            };
            res.status(302).json(redirectResponse);
            return;
        }
        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
};

/**
 * Controller to process a job after submission.
 */
const processController = async (req: ProcessJobRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobId = req.body.id;
        if (!jobId) {
            throw new HttpError('id field is required in request.body', { status: 400 });
        }
        const result = await jobProcess(jobId);
        console.log('processing done'); //TESTING

        // Check if we need to include execution log
        let execLogFileOutput: string | undefined;
        if (result.status === 'Networks are still being aligned.') {
            execLogFileOutput = getJobExecutionLog(jobId);
        }

        if (result.redirect) {
            // Return redirect response
            const redirectResponse: UnifiedResponse = {
                status: 'redirect',
                message: result.status,
                redirect: result.redirect,
            };
            res.status(200).json(redirectResponse);
            return;
        } else {
            const processedJobData: ProcessJobData = {
                ...result,
                execLogFileOutput: execLogFileOutput || result.execLogFileOutput,
            };

            const successResponse: UnifiedResponse<ProcessJobData> = {
                status: 'success',
                message: result.status,
                data: processedJobData,
            };
            res.status(200).json(successResponse);
            return;
        }

    } catch (error) {
        next(error);
    }
};


/**
 * Controller function to retrieve job results based on a job ID.
 *
 * @param req - Express request object containing the job ID in `params`.
 * @param res - Express response object that sends back a JSON response.
 * @param next - Express next middleware function for error handling.
 * @returns A Promise that resolves when the response is sent.
 */
const getJobResults = async (req: GetJobResultsRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobId = req.params.id;

        if (!jobId) {
            throw new HttpError('Job ID is required.', { status: 400 });
        }

        // const result = await getJob(jobId);

        const jobDir = path.join(__dirname, '../process', jobId);

        // Check if job directory exists
        if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
            throw new HttpError('Job not found.', { status: 404 });
        }

        // Check if info.json exists
        const infoJsonPath = path.join(jobDir, 'info.json');
        if (!fs.existsSync(infoJsonPath)) {
            throw new HttpError('Job data not found. The job might not have been processed yet.', {
                status: 500,
            });
        }

        // Read job data
        const infoJsonContent = fs.readFileSync(infoJsonPath, 'utf8');
        const jobData = JSON.parse(infoJsonContent);

        // Handle different job statuses
        const status = jobData.status;

        if (status === 'failed') {
            // Read the run.log file for error details
            const runLogPath = path.join(jobDir, 'run.log');
            let runLogContent = '';

            try {
                if (fs.existsSync(runLogPath)) {
                    runLogContent = fs.readFileSync(runLogPath, 'utf8');
                    runLogContent = runLogContent
                        .split('\n')
                        .map((line) => `<span>${line.trim()}</span>`)
                        .join('\n');
                } else {
                    runLogContent = 'Run log file not found';
                }
            } catch (err) {
                console.error('Error reading run.log:', err);
                runLogContent = 'Error reading run log file';
            }

            throw new HttpError('The alignment of the networks failed. See execution log below:', {
                status: 400,
                errorLog: runLogContent,
            });
        }

        if (status === 'preprocessed' || status === 'processing') {
            const redirectResponse: UnifiedResponse = {
                status: 'redirect',
                message: 'Job is still being processed. Redirecting...',
                redirect: `/submit-job/${jobId}`,
            };
            res.status(200).json(redirectResponse);
            return;
        }

        if (status === 'processed') {
            if (!jobData.zipName) {
                throw new HttpError('Invalid job data: missing zip file name.', {
                    status: 500,
                });
            }

            // Get execution log
            const execLogFilePath = path.join(jobDir, 'run.log');
            let execLogFileOutput = '';

            if (fs.existsSync(execLogFilePath)) {
                try {
                    const execLogFileContent = fs.readFileSync(execLogFilePath, 'utf8');
                    const lines = execLogFileContent.split('\n');
                    execLogFileOutput = lines.map((line) => `<span>${line.trim()}</span>`).join('');
                } catch (err) {
                    execLogFileOutput = 'Problem opening execution log file.';
                }
            } else {
                execLogFileOutput = 'Job execution log file does not exist.';
            }

            // Construct base URL for download link
            const baseUrl = `${req.protocol}://${req.get('host')}`;


            const response: UnifiedResponse<ProcessedJobResponse> = {
                status: 'success',
                message: 'Job Results',
                data: {
                    jobId: jobId,
                    note: `These results can be accessed on the results page using the Job ID ${jobId}, or directly accessed using ${baseUrl}/results?id=${jobId}.`,
                    zipDownloadUrl: `${baseUrl}/api/download/${jobId}`,
                    execLogFileOutput: execLogFileOutput,
                },
            };

            res.status(200).json(response);
            return;
        } else {
            // Unhandled status
            throw new HttpError(`Unhandled job status: ${status}`, { status: 500 });
        }
    } catch (err) {
        next(err);
    }
};

// Default SANA 2.0 options
const DEFAULT_SANA2_OPTIONS: SanaOptions = {
    standard: {
        s3: 0,
        ec: 1,
        ics: 0,
        tolerance: 0.1
    },
};
/**
 * Controller to handle job submission with zipped files using default settings
 */
const submitDefaultZipController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Files are already processed and attached to req.files by middleware
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {
            throw new HttpError('Two network files are required.', { status: 400 });
        }

        // Create job with default SANA 2.0 options
        const uploadedFiles: UploadedFiles = {
            files: req.files['files'],
            similarityFiles:  [],
        };
        const result = await createJob(uploadedFiles, DEFAULT_SANA2_OPTIONS, 'SANA2');
        
        // Send successful response
        const response: UnifiedResponse<JobData> = {
            status: 'success',
            message: 'Job submitted successfully with default settings',
            data: result,
        };
        
        if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
            const redirectResponse: UnifiedResponse = {
                status: 'redirect',
                message: 'Job submitted successfully. Redirecting...',
                redirect: `/submit-job/${result.id}`,
            };
            res.status(302).json(redirectResponse);
            return;
        }
        
        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
};

export { 
    downloadZipJob, 
    getJobResults, 
    submitJobController, 
    processController,
    submitDefaultZipController 
};
