import { createHash } from 'crypto';
import { preprocess } from './preprocess';
import {  SanaOptions } from '../config/modelOptions';
import path from 'path';
import { SanaModelType } from '../config/modelOptions';
import HttpError from '../middlewares/HttpError';
import { JobData, UploadedFiles } from '../../types/types';


/**
 * Creates a new job with the provided files and options
 * @param files The uploaded network files
 * @param options The sanitized options for the SANA model
 * @param sanaVersion The SANA model version
 * @returns JobData or RedirectResponse
 */
const createJob = async (
    files: UploadedFiles,
    options: SanaOptions,
    sanaVersion: SanaModelType
): Promise<JobData> => {
    const network1FullName = files.files[0].originalname;
    const network2FullName = files.files[1].originalname;

    if (!network1FullName || !network2FullName) {
        throw new HttpError('Invalid file names: both networks must have valid names', { status: 400 });
    }

    // Extract network names
    const network1Name = network1FullName.substring(0, network1FullName.lastIndexOf('.'));
    const network2Name = network2FullName.substring(0, network2FullName.lastIndexOf('.'));

    if (!network1Name || !network2Name) {
        throw new HttpError(
            `Failed to extract network names from files: ${network1FullName}, ${network2FullName}`, 
            { status: 400 }
        );
    }

    // Generate job ID
    const timestamp = Date.now();
    const jobId = createHash('md5')
        .update(`${timestamp}-${network1Name}-${network2Name}`)
        .digest('hex');

    // Get file extension and validate
    const extension = path.extname(files.files[0].originalname).toLowerCase();
    if (!extension) {
        throw new HttpError(`Invalid file extension for network 1: ${files.files[0].originalname}`, { status: 400 });
    }

    // Create job data
    const jobData: JobData = {
        id: jobId,
        status: 'preprocessing',
        modelVersion: sanaVersion,
        jobLocation: path.join(__dirname, '../process', jobId),
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
        await preprocess(files, options, jobData);
        console.log('Preprocessing completed successfully');

        // // Determine if we should redirect or return job data
        // if (process.env.REDIRECT_AFTER_SUBMIT === 'true') {
        //     return `/submit-job/${jobData.id}`;
        // }
        
        // Otherwise return the job data
        return jobData;
    } catch (error: any) {
        // // Update job status to error
        // jobData.status = 'error';
        // jobData.error = error.message;
        // jobData.updatedAt = new Date();
        
        // // Save the error state if needed
        // // await saveJobError(jobData);
        
        throw new HttpError(
            `Error during preprocessing: ${error.message}`,
            { status: 500, errorLog: error.stack }
        );
    }
};



export { createJob };
