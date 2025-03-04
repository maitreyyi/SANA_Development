// import { createHash } from "crypto";
// import { saveJobState, getJob } from "../repositories/jobRepository";
// import { preprocess } from "./preprocessService";
// import { process } from "./processService";
// import { cleanupFiles } from "../utils/fileSystem";
// import { CONFIG } from "../config/modelOptions";
// import path from "path";
const { createHash } = require("crypto");
//const { saveJobState, getJob } = require("../repositories/jobRepository");
const { preprocess } = require("./preprocessService");
const { jobProcess } = require("./processService");
// const { cleanupFiles } = require("../utils/fileSystem");
const { CONFIG } = require("../config/modelOptions");
const path = require("path");

//     /*
//         files: { files: Files[], similarityFiles: Files[] },
//         options: modelOptionsSchemas[sanaVersion], // backend/config/modelOptions.js
//         sanaVersion: Set<"SANA1" | "SANA1_1" | "SANA2">
//     */
const createJob = async (files, options, sanaVersion) => {
    try {
        if (!files?.files?.length) {
            throw new Error('No network files provided');
        }
        if (files.files.length < 2) {
            throw new Error('Two network files are required, but received: ' + files.files.length);
        }
    
        const network1FullName = files.files[0].originalname;
        const network2FullName = files.files[1].originalname;
    
        if (!network1FullName || !network2FullName) {
            throw new Error('Invalid file names: both networks must have valid names');
        }
    
        const network1Name = network1FullName.substring(
            0,
            network1FullName.lastIndexOf(".")
        );
        const network2Name = network2FullName.substring(
            0,
            network2FullName.lastIndexOf(".")
        );
    
        if (!network1Name || !network2Name) {
            throw new Error(`Failed to extract network names from files: ${network1FullName}, ${network2FullName}`);
        }

        const timestamp = Date.now();
        const jobId = createHash("md5")
            .update(`${timestamp}-${network1Name}-${network2Name}`)
            .digest("hex");
    
        // 3. create an object containing info about the job
        const jobData = {
            id: jobId,
            status: 'preprocessing',
            modelVersion: sanaVersion,
            jobLocation: path.join(__dirname, "../process", jobId),
            extension: path.extname(files.files[0].originalname).toLowerCase(),
            network1Name: network1Name,
            network2Name: network2Name,
        };
    
        if (!jobData.extension) {
            throw new Error(`Invalid file extension for network 1: ${files.files[0].originalname}`);
        }
    
        console.log(`Created job data:`, JSON.stringify(jobData, null, 2));


        try {
            // Store initial job state
            // await saveJobState(jobId, { status: "preprocessing", attempts: 1, createdAt: timestamp });
    
            // handle preprocessing
            await preprocess(files, options, jobData); 
            // await saveJobState(jobId, { 
            //     status: "processing",
            //     preprocessedPath,
            // });
            console.log('preprocessing done');//TESTING

            // 7. Return the processing state
            // res.status(200).json({ redirect: `/submit-job/${jobData.id}` });
            return { redirect: `/submit-job/${jobData.id}` };
    
            // // handle processing
            // const result = await jobProcess(jobId, jobData);
            // console.log('processing done');//TESTING
            // console.log('result:', result);//TESTING
            // await saveJobState(jobId, {
            //     status: "complete",
            //     result,
            //     // ...(CONFIG.CLEANUP_ON_COMPLETE && { preprocessedPath: undefined }),
            // });
    
            // if (CONFIG.CLEANUP_ON_COMPLETE) {
            //     await cleanupFiles(preprocessedPath);
            // }
        } catch (error) {
            // await saveJobState(jobId, {
            //     status: "error",
            //     error: error.message,
            //     preprocessedPath:
            //         error.stage === "processing"
            //             ? `${CONFIG.PREPROCESSED_DIR}/${jobId}`
            //             : undefined,
            // });
            throw error;
        }
    } catch (error) {
        throw new Error(`Error creating job object: ${error.message}`);
    }
};

/**
 * const retryProcessing = async (jobId) => {
    const job = await getJob(jobId);

    if (!job.preprocessedPath) {
        throw new Error(
            "No preprocessed files available. Need to start from beginning."
        );
    }

    if (job.attempts >= CONFIG.MAX_ATTEMPTS) {
        throw new Error("Maximum retry attempts reached");
    }

    try {
        await saveJobState(jobId, {
            status: "processing",
            attempts: job.attempts + 1,
        });

        const result = await jobProcess(job.preprocessedPath);
        await saveJobState(jobId, {
            status: "complete",
            result,
        });
    } catch (error) {
        await saveJobState(jobId, {
            status: "error",
            error: error.message,
        });
        throw error;
    }
};
**/

module.exports = {
    createJob, 
    //retryProcessing, 
    //getJob
};