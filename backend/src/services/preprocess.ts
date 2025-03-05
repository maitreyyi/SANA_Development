import path from 'path';
import fs from 'fs';
import HttpError from '../middlewares/HttpError';
import { SanaOptions } from '../config/modelOptions';
import { JobData, UploadedFiles } from '../../types/types';


const preprocess = async (
  files: UploadedFiles, 
  options: SanaOptions, 
  jobData: JobData
): Promise<void> => {
    // 4. create directories for the job
    const jobLocation: string = jobData.jobLocation;
    const network1Dir: string = path.join(
        jobLocation,
        "networks",
        jobData.network1Name
    );
    const network2Dir: string = path.join(
        jobLocation,
        "networks",
        jobData.network2Name
    );

    try {
        fs.mkdirSync(jobLocation, { recursive: true });
        fs.mkdirSync(path.join(jobLocation, "networks"), {
            recursive: true,
        });

        fs.mkdirSync(network1Dir, { recursive: true });
        if (jobData.network1Name !== jobData.network2Name) {
            fs.mkdirSync(network2Dir, { recursive: true });
        }
    } catch (e: any) {
        throw new HttpError(
            `Error creating directories: ${e.message}`,
            {status: 500}
        );
    }

    // 5. Move the network files into their respective directories
    const network1Location: string = path.join(
        network1Dir,
        `${jobData.network1Name}${jobData.extension}`
    );
    const network2Location: string = path.join(
        network2Dir,
        `${jobData.network2Name}${jobData.extension}`
    );
    
    try {
        fs.mkdirSync(path.dirname(network1Location), { recursive: true });
        fs.renameSync(files.files[0].path, network1Location);
    } catch (error: any) {
        throw new HttpError(
            `First file ${files.files[0].originalname} could not be moved to ${network1Location}`,
            {status: 500}
        );
    }
    
    if (jobData.network1Name !== jobData.network2Name) {
        try {
            fs.mkdirSync(path.dirname(network2Location), {
                recursive: true,
            });
            fs.renameSync(files.files[1].path, network2Location);
        } catch (error: any) {
            throw new HttpError(
                `Second file ${files.files[1].originalname} could not be moved to ${network2Location}`,
                {status: 500}
            );
        }
    }
    if(jobData.modelVersion === 'SANA2'){
        console.log('Processing SANA2 similarity files:', files);
        // 5a. create directory for esim files
        const esimFilesDir: string = path.join(jobData.jobLocation, 'esim-files');
        try {
            fs.mkdirSync(esimFilesDir, { recursive: true });
        } catch (error: any) {
            throw new HttpError(
                `Processing directory ${esimFilesDir} could not be created.`,
                {status: 500}
            );
        }

        if (files.similarityFiles) {
            for (let i = 0; i < files.similarityFiles.length; i++) {
                const simFile = files.similarityFiles[i];
                // Just use index number without extension
                const simFilePath: string = path.join(esimFilesDir, `sim_${i}`);
                
                try {
                    fs.renameSync(simFile.path, simFilePath);
                } catch (error: any) {
                    throw new HttpError(
                        `Similarity file ${simFile.originalname} could not be moved to ${simFilePath}`,
                        {status: 500}
                    );
                }
            }
        }
    }

    // 6. Write job info to a JSON file
    const statusFile: string = path.join(jobLocation, "info.json");
    try {
        fs.writeFileSync(
            statusFile,
            JSON.stringify({
                status: "preprocessed",
                data: jobData,
                options: options,
                version: jobData.modelVersion
            })
        );
    } catch (error: any) {
        throw new HttpError(`Error writing job info to JSON file`, {status: 500});
    }
};

export {
    preprocess,
    JobData,
};