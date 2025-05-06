"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitDefaultZipController = exports.processController = exports.submitJobController = exports.getJobResults = exports.downloadZipJob = void 0;
const fs_1 = __importDefault(require("fs"));
const sanitize_1 = require("../utils/sanitize");
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
const modelOptions_1 = require("../config/modelOptions");
const jobService_1 = require("../services/jobService");
const processService_1 = require("../services/processService");
const getJobExecutionLog_1 = __importDefault(require("../utils/getJobExecutionLog"));
const path_1 = __importDefault(require("path"));
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
const downloadZipJob = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            throw new HttpError_1.default('Job ID is required.', { status: 400 });
        }
        const jobDir = path_1.default.join(__dirname, '../process', jobId);
        const infoFilePath = path_1.default.join(jobDir, 'info.json');
        // Check if job directory exists
        if (!fs_1.default.existsSync(jobDir) || !fs_1.default.lstatSync(jobDir).isDirectory()) {
            throw new HttpError_1.default('Job not found.', { status: 404 });
        }
        // Check if info.json exists
        if (!fs_1.default.existsSync(infoFilePath)) {
            throw new HttpError_1.default('Job data not found. The job might not have been processed yet.', {
                status: 500,
            });
        }
        // Read job data
        try {
            const infoJsonContent = fs_1.default.readFileSync(infoFilePath, 'utf8');
            const jobData = JSON.parse(infoJsonContent);
            if (!jobData.zipName) {
                throw new HttpError_1.default('Invalid job data: missing zip file name.', {
                    status: 500,
                });
            }
            const zipLocation = path_1.default.join(jobDir, jobData.zipName);
            if (!fs_1.default.existsSync(zipLocation)) {
                throw new HttpError_1.default('Zip file not found.', { status: 404 });
            }
            // Send the zip file
            res.download(zipLocation, jobData.zipName, (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                    // log the error and let the download fail gracefully
                }
            });
        }
        catch (error) {
            console.error('Error reading job data:', error);
            throw new HttpError_1.default('Could not read job data.', { status: 500 });
        }
    }
    catch (err) {
        next(err);
    }
};
exports.downloadZipJob = downloadZipJob;
/**
 * Controller to handle job submission with file uploads.
 */
const submitJobController = async (req, res, next) => {
    try {
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {
            throw new HttpError_1.default('Two network files are required.', { status: 400 });
        }
        // 1. Validate required fields
        if (!req.body.options) {
            throw HttpError_1.default.badRequest('Options field is required.');
        }
        const sanaVersion = req.body.version;
        if (!sanaVersion) {
            throw new HttpError_1.default('Version field is required.', { status: 400 });
        }
        // Validate SANA version
        if (!(0, modelOptions_1.isSanaModelType)(sanaVersion)) {
            throw HttpError_1.default.badRequest(`Invalid SANA version: ${sanaVersion}. Must be one of: ${modelOptions_1.SANA_MODEL_NAMES.join(', ')}`);
        }
        console.log('request body.options:', req.body.options); //TESTING
        let options;
        if (typeof req.body.options === 'string') {
            try {
                options = JSON.parse(req.body.options);
            }
            catch (e) {
                throw HttpError_1.default.badRequest('Options must be a valid JSON string');
            }
        }
        else {
            options = req.body.options;
        }
        console.log('request options after:', options); //TESTING
        // 2. Sanitize and validate options based on model version
        const sanitizedOptions = await (0, sanitize_1.sanitize)(options, sanaVersion);
        if (process.env.NODE_ENV === 'development') {
            console.log('before sanitation:', options);
            console.log('after sanitation:', sanitizedOptions);
        }
        // 3. Update request body with sanitized options
        req.body.options = sanitizedOptions;
        // 4. Create job with validated inputs
        // const result = await createJob(req.files['files'], sanitizedOptions, sanaVersion);
        const uploadedFiles = {
            files: req.files['files'],
            similarityFiles: req.files['similarityFiles'],
        };
        const result = await (0, jobService_1.createJob)(uploadedFiles, sanitizedOptions, sanaVersion);
        // 5. Send successful response
        const response = {
            status: 'success',
            message: 'Job submitted successfully',
            data: result,
        };
        if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
            const redirectResponse = {
                status: 'redirect',
                message: 'Job submitted successfully. Redirecting...',
                redirect: `/submit-job/${result.id}`,
            };
            res.status(302).json(redirectResponse);
            return;
        }
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
};
exports.submitJobController = submitJobController;
/**
 * Controller to process a job after submission.
 */
const processController = async (req, res, next) => {
    try {
        const jobId = req.body.id;
        if (!jobId) {
            throw new HttpError_1.default('id field is required in request.body', { status: 400 });
        }
        const result = await (0, processService_1.jobProcess)(jobId);
        console.log('processing done'); //TESTING
        // Check if we need to include execution log
        let execLogFileOutput;
        if (result.status === 'Networks are still being aligned.') {
            execLogFileOutput = (0, getJobExecutionLog_1.default)(jobId);
        }
        if (result.redirect) {
            // Return redirect response
            const redirectResponse = {
                status: 'redirect',
                message: result.status,
                redirect: result.redirect,
            };
            res.status(200).json(redirectResponse);
            return;
        }
        else {
            const processedJobData = {
                ...result,
                execLogFileOutput: execLogFileOutput || result.execLogFileOutput,
            };
            const successResponse = {
                status: 'success',
                message: result.status,
                data: processedJobData,
            };
            res.status(200).json(successResponse);
            return;
        }
    }
    catch (error) {
        next(error);
    }
};
exports.processController = processController;
/**
 * Controller function to retrieve job results based on a job ID.
 *
 * @param req - Express request object containing the job ID in `params`.
 * @param res - Express response object that sends back a JSON response.
 * @param next - Express next middleware function for error handling.
 * @returns A Promise that resolves when the response is sent.
 */
const getJobResults = async (req, res, next) => {
    try {
        const jobId = req.params.id;
        if (!jobId) {
            throw new HttpError_1.default('Job ID is required.', { status: 400 });
        }
        // const result = await getJob(jobId);
        const jobDir = path_1.default.join(__dirname, '../process', jobId);
        // Check if job directory exists
        if (!fs_1.default.existsSync(jobDir) || !fs_1.default.lstatSync(jobDir).isDirectory()) {
            throw new HttpError_1.default('Job not found.', { status: 404 });
        }
        // Check if info.json exists
        const infoJsonPath = path_1.default.join(jobDir, 'info.json');
        if (!fs_1.default.existsSync(infoJsonPath)) {
            throw new HttpError_1.default('Job data not found. The job might not have been processed yet.', {
                status: 500,
            });
        }
        // Read job data
        const infoJsonContent = fs_1.default.readFileSync(infoJsonPath, 'utf8');
        const jobData = JSON.parse(infoJsonContent);
        // Handle different job statuses
        const status = jobData.status;
        if (status === 'failed') {
            // Read the run.log file for error details
            const runLogPath = path_1.default.join(jobDir, 'run.log');
            let runLogContent = '';
            try {
                if (fs_1.default.existsSync(runLogPath)) {
                    runLogContent = fs_1.default.readFileSync(runLogPath, 'utf8');
                    runLogContent = runLogContent
                        .split('\n')
                        .map((line) => `<span>${line.trim()}</span>`)
                        .join('\n');
                }
                else {
                    runLogContent = 'Run log file not found';
                }
            }
            catch (err) {
                console.error('Error reading run.log:', err);
                runLogContent = 'Error reading run log file';
            }
            throw new HttpError_1.default('The alignment of the networks failed. See execution log below:', {
                status: 400,
                errorLog: runLogContent,
            });
        }
        if (status === 'preprocessed' || status === 'processing') {
            const redirectResponse = {
                status: 'redirect',
                message: 'Job is still being processed. Redirecting...',
                redirect: `/submit-job/${jobId}`,
            };
            res.status(200).json(redirectResponse);
            return;
        }
        if (status === 'processed') {
            if (!jobData.zipName) {
                throw new HttpError_1.default('Invalid job data: missing zip file name.', {
                    status: 500,
                });
            }
            // Get execution log
            const execLogFilePath = path_1.default.join(jobDir, 'run.log');
            let execLogFileOutput = '';
            if (fs_1.default.existsSync(execLogFilePath)) {
                try {
                    const execLogFileContent = fs_1.default.readFileSync(execLogFilePath, 'utf8');
                    const lines = execLogFileContent.split('\n');
                    execLogFileOutput = lines.map((line) => `<span>${line.trim()}</span>`).join('');
                }
                catch (err) {
                    execLogFileOutput = 'Problem opening execution log file.';
                }
            }
            else {
                execLogFileOutput = 'Job execution log file does not exist.';
            }
            // Construct base URL for download link
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const response = {
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
        }
        else {
            // Unhandled status
            throw new HttpError_1.default(`Unhandled job status: ${status}`, { status: 500 });
        }
    }
    catch (err) {
        next(err);
    }
};
exports.getJobResults = getJobResults;
// Default SANA 2.0 options
const DEFAULT_SANA2_OPTIONS = {
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
const submitDefaultZipController = async (req, res, next) => {
    try {
        // Files are already processed and attached to req.files by middleware
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {
            throw new HttpError_1.default('Two network files are required.', { status: 400 });
        }
        // Create job with default SANA 2.0 options
        const uploadedFiles = {
            files: req.files['files'],
            similarityFiles: [],
        };
        const result = await (0, jobService_1.createJob)(uploadedFiles, DEFAULT_SANA2_OPTIONS, 'SANA2');
        // Send successful response
        const response = {
            status: 'success',
            message: 'Job submitted successfully with default settings',
            data: result,
        };
        if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
            const redirectResponse = {
                status: 'redirect',
                message: 'Job submitted successfully. Redirecting...',
                redirect: `/submit-job/${result.id}`,
            };
            res.status(302).json(redirectResponse);
            return;
        }
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
};
exports.submitDefaultZipController = submitDefaultZipController;
//# sourceMappingURL=jobController.js.map