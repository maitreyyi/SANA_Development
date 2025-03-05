const path = require('path');
const fs = require('fs');
const HttpError = require('../middlewares/HttpError');
const { SANA_MODELS } = require('../config/modelOptions');
/*
type JobData = {
    // identifiers
    id: string,
    status: JobStatus,
    modelVersion: string,
    // file info
    network1Name: string,
    network2Name: string,
    extension: string,
    jobLocation: string,
    // processing details
    attempts: number,
    result?: any,
    error?: string,
    // timestamps
    createdAt: Date,
    updatedAt: Date,
}
*/
// maybe (files: Files[], jobId: string, jobData) => Promise<string>
const preprocess = async (
  files, 
  options, 
  jobData
) => {
  // const outputPath = `${CONFIG.PREPROCESSED_DIR}/${jobId}`;
  // await ensureDir(outputPath);
  
  // // Process files and save to outputPath
  // // ...
  
  // return outputPath;

        // 4. create directories for the job
        const jobLocation = jobData.jobLocation;
        const network1Dir = path.join(
            jobLocation,
            "networks",
            jobData.network1Name
        );
        const network2Dir = path.join(
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
        } catch (e) {
            throw new HttpError(
                `Error creating directories: ${e.message}`,
                500
            );
        }

        // 5. Move the network files into their respective directories
        const network1Location = path.join(
            network1Dir,
            `${jobData.network1Name}${jobData.extension}`
        );
        const network2Location = path.join(
            network2Dir,
            `${jobData.network2Name}${jobData.extension}`
        );
        // console.log("Source file path:", files.files[0].path); //TESTING
        // console.log("Destination file path:", network1Location); //TESTING
        try {
            fs.mkdirSync(path.dirname(network1Location), { recursive: true });
            fs.renameSync(files.files[0].path, network1Location);
            // fs.unlinkSync(req.files[0].path); // test if removes old file
        } catch (error) {
            throw new HttpError(
                `First file ${files.files[0].originalname} could not be moved to ${network1Location}`,
                500
            );
        }
        if (jobData.network1Name !== jobData.network2Name) {
            try {
                fs.mkdirSync(path.dirname(network2Location), {
                    recursive: true,
                });
                fs.renameSync(files.files[1].path, network2Location);
                // fs.unlinkSync(req.files[1].path); // test if removes old file
            } catch (error) {
                throw new Error(
                    `Second file ${files.files[1].originalname} could not be moved to ${network2Location}`,
                    500
                );
            }
        }

        if(jobData.modelVersion === SANA_MODELS.SANA2){
            console.log('Processing SANA2 similarity files:', files);
            // 5a. create directory for esim files
            const esimFilesDir = path.join(jobData.jobLocation, 'esim-files');
            try {
                fs.mkdirSync(esimFilesDir, { recursive: true });
            } catch (error) {
                throw new HttpError(
                    `Processing directory ${esimFilesDir} could not be created.`,
                    500
                );
            }

            if (files.similarityFiles) {
                for (let i = 0; i < files.similarityFiles.length; i++) {
                    const simFile = files.similarityFiles[i];
                    // Just use index number without extension
                    const simFilePath = path.join(esimFilesDir, `sim_${i}`);
                    
                    try {
                        fs.renameSync(simFile.path, simFilePath);
                    } catch (error) {
                        throw new HttpError(
                            `Similarity file ${simFile.originalname} could not be moved to ${simFilePath}`,
                            500
                        );
                    }
                }
            }
        }

        // 6. Write job info to a JSON file
        const statusFile = path.join(jobLocation, "info.json");
        try {
            fs.writeFileSync(
                statusFile,
                JSON.stringify({
                    status: "preprocessed",
                    data: jobData,
                    options: options,
                    version: jobData.modelVersion // <-- check if this works
                })
            );
        } catch (error) {
            throw new HttpError(`Error writing job info to JSON file`, 500);
        }


};

module.exports = {
    preprocess,
};