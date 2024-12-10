const path = require("path");
const fs = require("fs");
const { sanitize } = require("../services/preprocessService");
const HttpError = require("../middlewares/HttpError");
const { createHash } = require("crypto");
const { getJobData, getJobExecutionLog } = require("../services/jobService");
const { jobProcessingService } = require("../services/processService");

/**
 * Gets the job status based on the request parameters.
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The job ID.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>}
 */
const getJobStatus = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            // maybe provide explicit description later
            return res.json({ redirect: "/" });
        }

        const jobData = await getJobData(id);

        if (jobData.redirectToResults) {
            return res.json({ redirect: `/submit-job/${id}` });
            // will display error on the frontside!
        }

        res.json(jobData);
    } catch (error) {
        console.error(error);
        throw new HttpError("Internal Server Error", 500);
    }
};

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
        const zipName = jobData.zip_name;
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

/**
 * Expected request object for SANA1:
 * {
 *   files: [File, File], // Array of two files
 *   options: {
 *     t: Number,
 *     s3: Number,
 *     ec: Number
 *   },
 *   version: "SANA1", "SANA1_1", OR "SANA2
 * }
 */
const preprocessJob = async (req, res, next) => {
    try {
        // 1. sanitize inputs received to the options form
        if (!req.body.options) {
            throw new HttpError('Options field is required.', 400);
        }
        const sanaVersion = req.body.version;
        if (!sanaVersion) {
            throw new HttpError('Version field is required.', 400);
        }
        const sanitizedOptions = await sanitize(req.body.options, sanaVersion);
        if (process.env.NODE_ENV === "development") {
            console.log("before sanitation:", req.body.options);
            console.log("after sanitation:", sanitizedOptions);
        }
        req.body.options = sanitizedOptions;
        // MAPPING TO SANA MODEL NAME HERE
        const versionMap = {
            "SANA1": "SANA1.0",
            "SANA1_1": "SANA1.1",
            "SANA2": "SANA2.0"
        };
        const mappedSanaVersion = versionMap[sanaVersion] || sanaVersion;

        // validation of files already complete

        // 2. create a job id hash
        const network1FullName = req.files[0].originalname;
        const network2FullName = req.files[1].originalname;

        const network1Name = network1FullName.substring(
            0,
            network1FullName.lastIndexOf(".")
        );
        const network2Name = network2FullName.substring(
            0,
            network2FullName.lastIndexOf(".")
        );

        const jobId = createHash("md5")
            .update(Date.now() + network1Name + network2Name)
            .digest("hex");

        // 3. create an object containing info about the job
        const jobData = {
            id: jobId,
            jobLocation: path.join(__dirname, "../process", jobId),
            extension: path.extname(req.files[0].originalname).toLowerCase(),
            network1Name: network1Name,
            network2Name: network2Name,
        };
        console.log(`Created jobData preprocess: `, jobData); //TESTING

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
            if (network1Name !== network2Name) {
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
        console.log("Source file path:", req.files[0].path);
        console.log("Destination file path:", network1Location);
        try {
            fs.mkdirSync(path.dirname(network1Location), { recursive: true });
            fs.renameSync(req.files[0].path, network1Location);
            // fs.unlinkSync(req.files[0].path); // test if removes old file
        } catch (error) {
            throw new HttpError(
                `First file ${req.files[0].originalname} could not be moved to ${network1Location}`,
                500
            );
        }
        if (network1Name !== network2Name) {
            try {
                fs.mkdirSync(path.dirname(network2Location), {
                    recursive: true,
                });
                fs.renameSync(req.files[1].path, network2Location);
                // fs.unlinkSync(req.files[1].path); // test if removes old file
            } catch (error) {
                throw new Error(
                    `Second file ${req.files[1].originalname} could not be moved to ${network2Location}`,
                    500
                );
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
                    options: sanitizedOptions,
                    version: mappedSanaVersion
                })
            );
            /* EXAMPLE FILE
        {
            "status": "preprocessed",
            "data": {
                "id": "fc28a1d8599304dcb89ac27929fca823",
                "job_location": "../process/fc28a1d8599304dcb89ac27929fca823",
                "extension": "el",
                "network_1_name": "RNorvegicus",
                "network_2_name": "SPombe"
            },
            "options": { 
                "t": "3", 
                "s3": "1", 
                "ec": "0" 
            }, 
            "version": "SANA1.0", "SANA1.1", or "SANA2.0"
        }
        */
        } catch (error) {
            throw new HttpError(`Error writing job info to JSON file`, 500);
        }

        // 7. Return the processing state
        res.status(200).json({ redirect: `/submit-job/${jobData.id}` });
    } catch (err) {
        next(err);
    }
};

const processJob = async (req, res, next) => {
    try {
        const jobId = req.body.id;
        if (!jobId) {
            throw new HttpError("No Job ID supplied.", 400);
        }
        const result = await jobProcessingService(jobId);
        const response = {
            success: result.success !== false,
            status: result.status,
            redirect: result.url,
        };
        if (result.status === "Networks are still being aligned.") {
            const execLogFileOutput = getJobExecutionLog(jobId)
            response.execLogFileOutput = execLogFileOutput;
        }
        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};

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
        if (status === "preprocessed" || status === "processing") {
            return res.status(200).json({ redirect: `/submit-job/${jobId}` });
        }

        // construct zip location
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const zipLocation = path.join(
            __dirname,
            "../process",
            jobId,
            jobData.zip_name
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
    getJobStatus,
    downloadZipJob,
    preprocessJob,
    processJob,
    getJobResults,
};
