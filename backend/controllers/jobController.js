const path = require("path");
const fs = require("fs");
const { sanitize } = require("../utils/sanitize");
const HttpError = require("../middlewares/HttpError");
const { VALID_MODELS } = require("../config/modelOptions");
const { createJob } = require("../services/jobService");
const { jobProcess } = require('../services/processService');
const getJobExecutionLog = require('../utils/getJobExecutionLog');

// /**
//  * Gets the job status based on the request parameters.
//  * @param {Object} req - The request object.
//  * @param {Object} req.params - The request parameters.
//  * @param {string} req.params.id - The job ID.
//  * @param {Object} res - The response object.
//  * @param {Function} next - The next middleware function.
//  * @returns {Promise<void>}
//  */
// const getJobStatus = async (req, res, next) => {
//     try {
//         const id = req.params.id;

//         if (!id) {
//             // maybe provide explicit description later
//             return res.json({ redirect: "/" });
//         }

//         const jobData = await getJobData(id);

//         if (jobData.redirectToResults) {
//             return res.json({ redirect: `/submit-job/${id}` });
//             // will display error on the frontside!
//         }

//         res.json(jobData);
//     } catch (error) {
//         console.error(error);
//         throw new HttpError("Internal Server Error", 500);
//     }
// };

/**
 * Downloads the zip file for a job based on the request parameters.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The job ID.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
const downloadZipJob = async (req, res, next) => {
    const jobId = req.params.id;
    if (!jobId) {
        throw new HttpError("no jobid", 400);
    }
    const infoFilePath = path.join(__dirname, `../process/${jobId}/info.json`);
    try {
        const infoJsonContent = fs.readFileSync(infoFilePath, "utf8");
        const jobData = JSON.parse(infoJsonContent);
        const zipName = jobData.zipName;
        const zipLocation = path.join(
            __dirname,
            `../process/${jobId}`,
            zipName
        );
        if (!fs.existsSync(zipLocation)) {
            throw new HttpError("Zip file not found", 404);
        }

        // could be error with args
        return res.download(zipLocation, zipName, (err) => {
            if (err) {
                console.error("Error sending zip file:", err);
                throw new HttpError("Could not send zip file", 500);
            }
        });
    } catch (error) {
        console.error("Error reading info.json:", error);
        throw new HttpError("Could not read info.json", 500);
    }
};

// Controllers
const submitJobController = async (req, res, next) => {
    try {
        // 1. sanitize inputs received to the options form
        if (!req.body.options) {
            throw new HttpError('Options field is required.', 400);
        }
        const sanaVersion = req.body.version;
        if (!sanaVersion) {
            throw new HttpError('Version field is required.', 400);
        }
        if(!VALID_MODELS.has(sanaVersion)){
            throw new HttpError('Version must be valid version', 400);
        }
        const sanitizedOptions = await sanitize(req.body.options, sanaVersion);
        if (process.env.NODE_ENV === "development") {
            console.log("before sanitation:", req.body.options);
            console.log("after sanitation:", sanitizedOptions);
        }
        req.body.options = sanitizedOptions;
        const result = await createJob(req.files, sanitizedOptions, sanaVersion);
        res.json(result);
        // res.json({ jobId, status: "started" });
        // console.log('result:', result);//TESTING
        // res.json(result);
    } catch (err) {
        next(err);
    }
};

const processController = async(req, res, next) => {
    try {
        const jobId = req.body.id
        if(!jobId){
            throw new HttpError('id field is required in request.body', 400);
        }
        const result = await jobProcess(jobId);
        console.log('processing done');//TESTING
        const response = {
            success: result.success !== false,
            status: result.status,
            redirect: result.url,
        };
        if (result.status === "Networks are still being aligned.") {
            const execLogFileOutput = getJobExecutionLog(jobId);
            response.execLogFileOutput = execLogFileOutput;
        }
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// const getJobController = async (req, res) => {
//     try {
//         const { jobId } = req.params;
//         // const job = await getJob(jobId);
//         res.json(job);
//     } catch (error) {
//         res.status(404).json({ error: "Job not found" });
//     }
// };

// const lookupJobsController = async (req, res) => {
//     try {
//         const { query } = req.query; // Optional search parameters
//         const jobs = await findJobs(query);
//         res.json(jobs);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


/**
 * @typedef {Object} RequestParams
 * @property {string} id - The unique Job ID provided in the URL.
 */
/**
 * @typedef {Object} ErrorMessageResponse
 * @property {string} message - A descriptive error message.
 */
/**
 * @typedef {Object} ProcessedJobResponse
 * @property {string} message - A success message.
 * @property {string} jobId - The unique Job ID.
 * @property {string} note - Additional information about the job results.
 * @property {string} zipDownloadUrl - URL to download the job result ZIP file.
 * @property {string} execLogFileOutput - The processed execution log content.
 */
/**
 * @typedef {Object} FailedJobResponse
 * @property {string} message - A failure message.
 * @property {string} errorLog - The contents of the error log, if available.
 */
/**
 * Controller function to retrieve job results based on a job ID.
 *
 * @param {import('express').Request<RequestParams>} req - Express request object containing the job ID in `params`.
 * @param {import('express').Response<
 *   ErrorResponse | ProcessedJobResponse | FailedJobResponse
 * >} res - Express response object that sends back a JSON response.
 * @param {Function} next - Express next middleware function for error handling.
 * @throws {HttpError} Throws an error if the job ID is not provided or the job directory does not exist.
 * @returns {Promise<void>} Sends a JSON response with the job results or an error message.
 */
const getJobResults = async (req, res, next) => {
    try {
        const jobId = req.params.id;

        if (!jobId) {
            throw new HttpError("Please provide a Job ID to search for.", 400);
        }

        const jobDir = path.join(__dirname, "../process", jobId);
        const isJob =
            fs.existsSync(jobDir) && fs.lstatSync(jobDir).isDirectory();

        if (!isJob) {
            throw new HttpError(
                "Sorry: no such result Job ID exists. Please try another Job ID.",
                404
            );
        }

        // check if job is processed by checking if info.json exists
        const infoJsonPath = path.join(jobDir, "info.json");
        const isProcessed = fs.existsSync(infoJsonPath);

        // Handle the case where info.json does not exist
        if (!isProcessed) {
            throw new HttpError(
                "Job data not found. The job might not have been processed yet.",
                500
            );
        }
        const infoJsonContent = fs.readFileSync(infoJsonPath, "utf8");
        const jobData = JSON.parse(infoJsonContent);


        const status = jobData.status;
        if (status === 'failed'){
            // Read the run.log file
            const runLogPath = path.join(__dirname, '../process', jobId, 'run.log');
            let runLogContent = '';
            
            try {
                if (fs.existsSync(runLogPath)) {
                    runLogContent = fs.readFileSync(runLogPath, 'utf8');
                    // Format the log content with line breaks
                    runLogContent = runLogContent
                        .split('\n')
                        .map(line => `<span>${line.trim()}</span>`)
                        .join('\n');
                } else {
                    runLogContent = 'Run log file not found';
                }
            } catch (err) {
                console.error('Error reading run.log:', err);
                runLogContent = 'Error reading run log file';
            }

            throw new HttpError(
                "The alignment of the networks failed. See execution log below:",
                400,
                null,
                runLogContent
            );
        }
        if (status === "preprocessed" || status === "processing") {
            return res.status(200).json({ redirect: `/submit-job/${jobId}` });
        }

        if (!jobData.zipName) {
            throw new HttpError("Invalid job data: missing zip file name.", 500);
        }

        // construct zip location
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const zipLocation = path.join(
            __dirname,
            "../process",
            jobId,
            jobData.zipName
        );

        const execLogFilePath = path.join(jobDir, "run.log");

        let execLogFileOutput = "";
        if (fs.existsSync(execLogFilePath)) {
            try {
                const execLogFileContent = fs.readFileSync(
                    execLogFilePath,
                    "utf8"
                );
                const lines = execLogFileContent.split("\n");
                execLogFileOutput = lines
                    .map((line) => `<span>${line.trim()}</span>`)
                    .join("");
            } catch (err) {
                execLogFileOutput = "Problem opening execution log file.";
            }
        } else {
            execLogFileOutput = "Job execution log file does not exist.";
        }

        if (status === "processed") {
            // console.log({
            //     message: "Job Results",
            //     jobId: jobId,
            //     note: `These results can be accessed on the results page using the Job ID ${jobId}, or directly accessed using ${baseUrl}/results?id=${jobId}.`,
            //     zipDownloadUrl: zipLocation,
            //     execLogFileOutput: `length of output is: ${execLogFileOutput.length}`,
            // }); //TESTING
            // Return the results
            return res.status(200).json({
                message: "Job Results",
                jobId: jobId,
                note: `These results can be accessed on the results page using the Job ID ${jobId}, or directly accessed using ${baseUrl}/results?id=${jobId}.`,
                zipDownloadUrl: zipLocation,
                execLogFileOutput: execLogFileOutput,
            });
        } else if (status === "failed") {
            // Display error message
            const errorLogPath = path.join(jobDir, "error.log");
            let errorContent = "";
            if (fs.existsSync(errorLogPath)) {
                try {
                    const errorLogFileContent = fs.readFileSync(
                        errorLogPath,
                        "utf8"
                    );
                    const lines = errorLogFileContent.split("\n");
                    errorContent = lines
                        .map((line) => `<span>${line.trim()}</span>`)
                        .join("");
                } catch (err) {
                    errorContent = "Problem opening error log file.";
                }
            } else {
                errorContent = "Error log file does not exist.";
            }
            throw new HttpError(
                "The alignment of the networks failed. The contents of the execution log are:",
                500,
                null,
                errorContent
            );
        } else {
            // Unhandled status
            throw new HttpError("unhalded job status", 500);
        }
    } catch (err) {
        console.error('Error in getJobResults');//TESTING
        next(err);
    }
};

// {
//     "message": "Job Results",
//     "jobId": "fba19129c987afd819be9e9352ffec60",
//     "note": "These results can be accessed on the results page using the Job ID fba19129c987afd819be9e9352ffec60, or directly accessed using http://localhost:5001/results?id=fba19129c987afd819be9e9352ffec60.",
//     "zipDownloadUrl": "/usr/src/app/process/fba19129c987afd819be9e9352ffec60/SANA_alignment_output_fba19129c987afd819be9e9352ffec60.zip",
//     "execLogFileOutput": "Job execution log file does not exist."
// }
module.exports = {
    // getJobStatus,
    downloadZipJob,
    getJobResults,
    submitJobController, 
    processController,
};
