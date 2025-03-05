import * as fs from 'fs';
import * as path from 'path';
import HttpError from '../middlewares/HttpError';
import { exec } from 'child_process';
import * as archiver from 'archiver';
import { SANA_MODELS, SANA_LOCATIONS, validateSanaVersion, isSana2Options } from '../config/modelOptions';
import { FailedJobInfoFile, JobInfoFile, ProcessJobData, SuccessJobInfoFile, UnifiedResponse } from '../../types/types';
import { readInfoFile, isProcessedJob, isFailedJob, writeInfoFile, isPreprocessingJob, isProcessingJob } from '../utils/infoFileHandler';
import { isPromise } from 'util/types';

// interface JobInfo {
//     status: string;
//     data?: {
//         id: string;
//         jobLocation: string;
//         extension: string;
//         network1Name: string;
//         network2Name: string;
//         modelVersion: string;
//     };
//     options?: {
//         standard: Record<string, string | number | boolean>;
//         advanced?: {
//             esim?: string[];
//         };
//     };
//     log?: string;
//     command?: string;
//     zipName?: string;
// }

// interface JobProcessResult {
//     success?: boolean;
//     status: string;
//     redirect?: string;
// }



// export interface ProcessJobData {
//     success: boolean;
//     status: string;
//     jobId: string;
//     execLogFileOutput?: string;
//     redirect?: string;

//     // maybe
//     note?: string;
//     zipDownloadUrl?: string;
// }
const jobProcess = async (jobId: string): Promise<ProcessJobData> => {
    // Step 1: Check that there is an id supplied - done in controller
    const jobDir = path.join(__dirname, '../process', jobId);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        return {
            jobId: jobId,
            success: false,
            status: 'Job does not exist.',
            redirect: `/lookup-job/${jobId}`,
        };
    }

    // Step 2: Check that the job is not already processed
    const infoFilePath = path.join(jobDir, 'info.json');
    let info: JobInfoFile | SuccessJobInfoFile | FailedJobInfoFile;
    try {
        info = readInfoFile(jobDir);

        if (isProcessedJob(info) || isFailedJob(info)) {
            return {
                jobId: jobId,
                success: isProcessedJob(info),
                status: isProcessedJob(info) ? 'Networks already aligned.' : 'Networks alignment failed.',
                redirect: `/lookup-job/${jobId}`,
            };
        } else if (info.status === 'processing') {
            return { jobId, success: true, status: 'Networks are still being aligned.' };
        }

       // Step 3: Update status to 'processing' in info.json
        const updatedInfo: JobInfoFile = {
            ...info,
            status: 'processing',
        };
        writeInfoFile(jobDir, updatedInfo);
    } catch (err) {
        throw new HttpError('Could not read info.json', { status: 500 });
    }

    // Step 4: Generate the command string
    let optionString = '';
    const { id, jobLocation, extension, network1Name, network2Name, modelVersion } = info.data;
    const { options } = info;
    // console.log("shape of info", info); //TESTING

    validateSanaVersion(modelVersion);
    const sanaLocation = SANA_LOCATIONS[modelVersion];

    //EDIT SANA LOCATION HERE IF NEEDED
    optionString += `cd ${jobLocation} && ${sanaLocation} `;

    if (extension === '.el') {
        optionString += `-fg1 networks/${network1Name}/${network1Name}.el `;
        optionString += `-fg2 networks/${network2Name}/${network2Name}.el `;
    } else {
        optionString += `-g1 ${network1Name} `;
        optionString += `-g2 ${network2Name} `;
    }

    optionString += '-tinitial auto ';
    optionString += '-tdecay auto ';

    // Append SANA execution options
    for (const [option, value] of Object.entries(options?.standard || {})) {
        optionString += ` -${option} ${value} `;
    }

    if (modelVersion === 'SANA2' && isSana2Options(modelVersion, options)) {
        const esim = options?.advanced?.esim;
        if (esim && esim.length > 0) {
            const numFiles = esim.length;
            // Add external similarity weights (-esim)
            optionString += `-esim ${numFiles} `;
            // Add all weights
            optionString += `${esim.join(' ')} `;
            // Add similarity filenames (-simFile)
            optionString += `-simFile ${numFiles} `;
            // Add paths to all similarity files
            for (let i = 0; i < numFiles; i++) {
                optionString += `similarityFiles/sim_${i} `;
            }
            // Add similarity formats (-simFormat)
            optionString += `-simFormat ${numFiles} `;
            // Add format '1' (node names) for each file
            optionString += `${Array(numFiles).fill('1').join(' ')} `;
        }
    }
    console.log('optionstring!:', optionString); //TESTING

    // Step 5: Run the script
    return new Promise<ProcessJobData>((resolve, reject) => {
        exec(
            `${optionString} &> run.log`,
            // { cwd: jobLocation },
            (error, stdout, stderr) => {
                if (error) {
                    // Execution failed
                    const failedInfo: FailedJobInfoFile = {
                        status: 'failed',
                        log: path.join(jobLocation, 'error.log'),
                        command: optionString,
                    };
                    fs.writeFileSync(infoFilePath, JSON.stringify(failedInfo));
                    resolve({
                        jobId,
                        success: false,
                        status: 'Networks could not be aligned.',
                        redirect: `/lookup-job/${jobId}`,
                    });
                } else {
                    // Execution succeeded
                    // Step 6: Create a zip for the files
                    const zipName = `SANA_alignment_output_${id}.zip`;
                    const zipPath = path.join(jobLocation, zipName);
                    const output = fs.createWriteStream(zipPath);
                    const archive = archiver('zip', { zlib: { level: 9 } });

                    archive.on('entry', function (entry) {
                        console.log('Adding to zip:', entry.name);
                    });

                    output.on('pipe', () => {
                        console.log('Pipe started');
                    });

                    archive.on('warning', function (err) {
                        console.warn('Warning during zip creation:', err);
                        if (err.code === 'ENOENT') {
                            console.warn('File not found while zipping');
                        } else {
                            reject(err);
                        }
                    });

                    archive.on('error', (err) => {
                        console.error('Error during zip creation:', err);
                        reject(err);
                    });

                    output.on('close', () => {
                        console.log(`Zip file created at ${zipPath}`);
                        console.log(`Zip file size: ${archive.pointer()} bytes`);
                        if (!fs.existsSync(zipPath)) {
                            console.error('Zip file was not created!');
                            reject(new Error('Zip file creation failed'));
                            return;
                        }
                        // Step 7: Update info.json with status 'processed'
                        const successInfo: SuccessJobInfoFile = {
                            status: 'processed',
                            zipName: zipName,
                            command: optionString,
                        };
                        fs.writeFileSync(infoFilePath, JSON.stringify(successInfo));
                        resolve({
                            jobId,
                            success: true,
                            status: 'Networks successfully processed.',
                            redirect: `/lookup-job/${jobId}`,
                        });
                    });

                    archive.pipe(output);
                    // archive.directory(jobLocation, false);
                    archive.glob('**/*', {
                        cwd: jobLocation,
                        ignore: [zipName],
                        dot: true,
                    });
                    archive.finalize();
                }
            },
        );
    });
};



const getJob = async (jobId: string, protocol: string, host: string): Promise<ProcessJobData> => {
    // Step 1: Check that there is an id supplied - done in controller
    const jobDir = path.join(__dirname, '../process', jobId);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        throw new HttpError('Job not found.', { status: 404 });
    }

    // Step 2: Check that the job is not already processed
    const infoFilePath = path.join(jobDir, 'info.json');
    let info: JobInfoFile | SuccessJobInfoFile | FailedJobInfoFile;
    try {
        info = readInfoFile(jobDir);
    } catch (err) {
        throw new HttpError('Could not read info.json', { status: 500 });
    }
    if(isFailedJob(info)){
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
    }else if(isPreprocessingJob(info) || isProcessingJob(info)){
            const redirectResponse:ProcessJobData  = {
                jobId: jobId,
                success: true,
                status: 'Job is still being processed. Redirecting...',
                redirect: `/submit-job/${jobId}`,
            };
            return redirectResponse;
    } else if(isProcessedJob(info)){
        if (!info.zipName) {
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
        // const baseUrl = `${req.protocol}://${req.get('host')}`;
        const baseUrl = `${protocol}://${host}`;

        // Return the results

        const processedJobData: ProcessJobData = {
            success: true, 
            status: 'Results succeeded',
            jobId: jobId,
            note: `These results can be accessed on the results page using the Job ID ${jobId}, or directly accessed using ${baseUrl}/results?id=${jobId}.`,
            zipDownloadUrl: `${baseUrl}/api/download/${jobId}`,
            execLogFileOutput: execLogFileOutput,
        };

        // const response: UnifiedResponse<ProcessJobData> = {
        //     status: 'success',
        //     message: 'Job Results',
        //     data: {
        //         jobId: jobId,
        //         note: `These results can be accessed on the results page using the Job ID ${jobId}, or directly accessed using ${baseUrl}/results?id=${jobId}.`,
        //         zipDownloadUrl: `${baseUrl}/api/download/${jobId}`,
        //         execLogFileOutput: execLogFileOutput,
        //     },
        // };

        // res.status(200).json(response);
        return processedJobData;
    }else{
        const statusValue = (info as { status: string }).status || 'unknown';
        throw new HttpError(`Job has an unexpected status: ${statusValue}`, { status: 500 });
    }
};

export { jobProcess, getJob };
