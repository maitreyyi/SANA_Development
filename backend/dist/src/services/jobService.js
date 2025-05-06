"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = void 0;
const crypto_1 = require("crypto");
const preprocess_1 = require("./preprocess");
const path_1 = __importDefault(require("path"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
/**
 * Creates a new job with the provided files and options
 * @param files The uploaded network files
 * @param options The sanitized options for the SANA model
 * @param sanaVersion The SANA model version
 * @returns JobData or RedirectResponse
 */
const createJob = async (files, options, sanaVersion) => {
    const network1FullName = files.files[0].originalname;
    const network2FullName = files.files[1].originalname;
    if (!network1FullName || !network2FullName) {
        throw new HttpError_1.default('Invalid file names: both networks must have valid names', { status: 400 });
    }
    // Extract network names
    const network1Name = network1FullName.substring(0, network1FullName.lastIndexOf('.'));
    const network2Name = network2FullName.substring(0, network2FullName.lastIndexOf('.'));
    if (!network1Name || !network2Name) {
        throw new HttpError_1.default(`Failed to extract network names from files: ${network1FullName}, ${network2FullName}`, { status: 400 });
    }
    // Generate job ID
    const timestamp = Date.now();
    const jobId = (0, crypto_1.createHash)('md5')
        .update(`${timestamp}-${network1Name}-${network2Name}`)
        .digest('hex');
    // Get file extension and validate
    const extension = path_1.default.extname(files.files[0].originalname).toLowerCase();
    if (!extension) {
        throw new HttpError_1.default(`Invalid file extension for network 1: ${files.files[0].originalname}`, { status: 400 });
    }
    // Create job data
    const jobData = {
        id: jobId,
        status: 'preprocessing',
        modelVersion: sanaVersion,
        jobLocation: path_1.default.join(__dirname, '../process', jobId),
        extension,
        network1Name,
        network2Name,
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    if (process.env.NODE_ENV === 'development') {
        console.log(`Created job data:`, JSON.stringify(jobData, null, 2));
    }
    try {
        // Handle preprocessing
        await (0, preprocess_1.preprocess)(files, options, jobData);
        console.log('Preprocessing completed successfully');
        // // Determine if we should redirect or return job data
        // if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
        //     return `/submit-job/${jobData.id}`;
        // }
        // Otherwise return the job data
        return jobData;
    }
    catch (error) {
        // // Update job status to error
        // jobData.status = 'error';
        // jobData.error = error.message;
        // jobData.updatedAt = new Date();
        // // Save the error state if needed
        // // await saveJobError(jobData);
        throw new HttpError_1.default(`Error during preprocessing: ${error.message}`, { status: 500, errorLog: error.stack });
    }
};
exports.createJob = createJob;
//# sourceMappingURL=jobService.js.map