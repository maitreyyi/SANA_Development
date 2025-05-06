"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJob = exports.jobProcess = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
const child_process_1 = require("child_process");
const archiver_1 = __importDefault(require("archiver"));
const modelOptions_1 = require("../config/modelOptions");
const infoFileHandler_1 = require("../utils/infoFileHandler");
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
const jobProcess = async (jobId) => {
    var _a;
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
    let info;
    try {
        info = (0, infoFileHandler_1.readInfoFile)(jobDir);
        if ((0, infoFileHandler_1.isProcessedJob)(info) || (0, infoFileHandler_1.isFailedJob)(info)) {
            return {
                jobId: jobId,
                success: (0, infoFileHandler_1.isProcessedJob)(info),
                status: (0, infoFileHandler_1.isProcessedJob)(info) ? 'Networks already aligned.' : 'Networks alignment failed.',
                redirect: `/lookup-job/${jobId}`,
            };
        }
        else if (info.status === 'processing') {
            return { jobId, success: true, status: 'Networks are still being aligned.' };
        }
        // Step 3: Update status to 'processing' in info.json
        const updatedInfo = {
            ...info,
            status: 'processing',
        };
        (0, infoFileHandler_1.writeInfoFile)(jobDir, updatedInfo);
    }
    catch (err) {
        throw new HttpError_1.default('Could not read info.json', { status: 500 });
    }
    // Step 4: Generate the command string
    let optionString = '';
    const { id, jobLocation, extension, network1Name, network2Name, modelVersion } = info.data;
    const { options } = info;
    // console.log("shape of info", info); //TESTING
    (0, modelOptions_1.validateSanaVersion)(modelVersion);
    const sanaLocation = modelOptions_1.SANA_LOCATIONS[modelVersion];
    //EDIT SANA LOCATION HERE IF NEEDED
    optionString += `cd ${jobLocation} && ${sanaLocation} `;
    if (extension === '.el') {
        optionString += `-fg1 networks/${network1Name}/${network1Name}.el `;
        optionString += `-fg2 networks/${network2Name}/${network2Name}.el `;
    }
    else {
        optionString += `-g1 ${network1Name} `;
        optionString += `-g2 ${network2Name} `;
    }
    optionString += '-tinitial auto ';
    optionString += '-tdecay auto ';
    // Append SANA execution options
    for (const [option, value] of Object.entries((options === null || options === void 0 ? void 0 : options.standard) || {})) {
        optionString += ` -${option} ${value} `;
    }
    if (modelVersion === 'SANA2' && (0, modelOptions_1.isSana2Options)(modelVersion, options)) {
        const esim = (_a = options === null || options === void 0 ? void 0 : options.advanced) === null || _a === void 0 ? void 0 : _a.esim;
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
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`${optionString} &> run.log`, 
        // { cwd: jobLocation },
        (error, stdout, stderr) => {
            if (error) {
                // Execution failed
                const failedInfo = {
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
            }
            else {
                // Execution succeeded
                // Step 6: Create a zip for the files
                const zipName = `SANA_alignment_output_${id}.zip`;
                const zipPath = path.join(jobLocation, zipName);
                const output = fs.createWriteStream(zipPath);
                const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
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
                    }
                    else {
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
                    const successInfo = {
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
        });
    });
};
exports.jobProcess = jobProcess;
const getJob = async (jobId, protocol, host) => {
    // Step 1: Check that there is an id supplied - done in controller
    const jobDir = path.join(__dirname, '../process', jobId);
    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        throw new HttpError_1.default('Job not found.', { status: 404 });
    }
    // Step 2: Check that the job is not already processed
    const infoFilePath = path.join(jobDir, 'info.json');
    let info;
    try {
        info = (0, infoFileHandler_1.readInfoFile)(jobDir);
    }
    catch (err) {
        throw new HttpError_1.default('Could not read info.json', { status: 500 });
    }
    if ((0, infoFileHandler_1.isFailedJob)(info)) {
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
    else if ((0, infoFileHandler_1.isPreprocessingJob)(info) || (0, infoFileHandler_1.isProcessingJob)(info)) {
        const redirectResponse = {
            jobId: jobId,
            success: true,
            status: 'Job is still being processed. Redirecting...',
            redirect: `/submit-job/${jobId}`,
        };
        return redirectResponse;
    }
    else if ((0, infoFileHandler_1.isProcessedJob)(info)) {
        if (!info.zipName) {
            throw new HttpError_1.default('Invalid job data: missing zip file name.', {
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
            }
            catch (err) {
                execLogFileOutput = 'Problem opening execution log file.';
            }
        }
        else {
            execLogFileOutput = 'Job execution log file does not exist.';
        }
        // Construct base URL for download link
        // const baseUrl = `${req.protocol}://${req.get('host')}`;
        const baseUrl = `${protocol}://${host}`;
        // Return the results
        const processedJobData = {
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
    }
    else {
        const statusValue = info.status || 'unknown';
        throw new HttpError_1.default(`Job has an unexpected status: ${statusValue}`, { status: 500 });
    }
};
exports.getJob = getJob;
//# sourceMappingURL=processService.js.map