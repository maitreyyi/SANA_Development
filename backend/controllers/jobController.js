const path = require("path");
const fs = require("fs");
const { sanitize } = require("../services/preprocessService");
const HttpError = require("../middlewares/HttpError");
const { createHash } = require("crypto");
const { getJobData } = require("../services/jobService");

const getJobStatus = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            // maybe provide explicit description later
            return res.json({ redirect: "/" });
        }

        const jobData = await getJobData(id);

        if (jobData.redirectToResults) {
            return res.json({ redirect: `/results/${id}` });
            // will display error on the frontside!
        }
        res.json(jobData);
    } catch (error) {
        console.error(error);
        throw new HttpError("Internal Server Error", 500);
    }
};

/**
 * Expected request object:
 * {
 *   files: [File, File], // Array of two files
 *   options: {
 *     t: Number,
 *     s3: Number,
 *     ec: Number
 *   }
 * }
 */
const preprocessJob = async (req, res, next) => {
    // const files = req.files; // Array of files
    // const options = JSON.parse(req.body.options); // Parsed options object

    // console.log(files); // [File, File]
    // console.log(options); // { runtimeInMinutes, s3Weight, ecWeight }
    try {
        // 1. sanitize inputs received to the options form
        const sanitizedOptions = sanitize(req.body.options);
        if (process.env.NODE_ENV === "development") {
            console.log("before sanitation:", req.body.options);
            console.log("after sanitation:", sanitizedOptions);
        }
        req.body.options = sanitizedOptions;
        // validation of files already complete

        // 2. create a job id hash
        const network1Name = req.files[0].fieldname;
        const network2Name = req.files[1].fieldname;
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
            `${jobData.network1Name}.${jobData.extension}`
        );
        const network2Location = path.join(
            network2Dir,
            `${jobData.network2Name}.${jobData.extension}`
        );
        try {
            fs.renameSync(req.files[0].path, network1Location);
        } catch (error) {
            throw new HttpError(
                `First file ${req.files[0].originalname} could not be moved to ${network1Location}`,
                500
            );
        }
        if (network1Name !== network2Name) {
            try {
                fs.renameSync(req.files[1].path, network2Location);
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
                    options: req.body.options,
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
                "options_inputs": { 
                    "t": "3", 
                    "s3": "1", 
                    "ec": "0" 
                } 
            }
        }
        */
        } catch (error) {
            throw new HttpError(`Error writing job info to JSON file`, 500);
        }

        // 7. Return the processing state
        req.status(200).json({ redirect: `/process/${jobData.id}` });
    } catch (err) {
        // throw new HttpError(`Error occured during preprocessing`, 500);
        throw err;
    }
};

const processJob = async (req, res, next) => {
    try {
        const jobId = req.body.id;
        if (!jobId) {
            throw new HttpError("No Job ID supplied.", 400);
        }
        const result = await processJob(jobId);
        return res.status(200).json({
            success: result.success !== false,
            status: result.status,
            redirect: result.url,
        });
    } catch (err) {
        throw err;
    }
};

const getJobResults = async (req, res, next) => {
    // try {
    const jobId = req.params.id;

    if (!jobId) {
        throw new HttpError("Please provide a Job ID to search for.", 400);
    }

    const jobDir = path.join(__dirname, "../process", jobId);
    const isJob = fs.existsSync(jobDir) && fs.lstatSync(jobDir).isDirectory();

    if (!isJob) {
        throw new HttpError(
            "Sorry: no such result Job ID exists. Please try another Job ID.",
            404
        );
    }

    // check if job is processed by checking if info.json exists
    const infoJsonPath = path.join(jobDir, "info.json");
    const isProcessed = fs.existsSync(infoJsonPath);

    // check if error.log exists
    // const hasError = fs.existsSync(path.join(jobDir, 'error.log'));

    let jobData = null;
    if (isProcessed) {
        const infoJsonContent = fs.readFileSync(infoJsonPath, "utf8");
        jobData = JSON.parse(infoJsonContent);
    } else {
        // Handle the case where info.json does not exist
        return res
            .status(500)
            .json({
                message:
                    "Job data not found. The job might not have been processed yet.",
            });
    }

    const status = jobData.status;

    if (status === "preprocessed" || status === "processing") {
        return res.status(200).json({ redirect: `/process/${jobId}` });
    }

    // construct zip location
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const zipLocation = `${__dirname}/process/${jobId}/${jobData.zip_name}`;

    const execLogFilePath = path.join(jobDir, "run.log");

    let execLogFileOutput = "";
    if (fs.existsSync(execLogFilePath)) {
        try {
            const execLogFileContent = fs.readFileSync(execLogFilePath, "utf8");
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
            errorContent = fs.readFileSync(errorLogPath, "utf8");
        }
        return res.status(200).json({
            message:
                "The alignment of the networks failed. The contents of the execution log are:",
            errorLog: errorContent,
        });
    } else {
        // Unhandled status
        return res.status(500).json({ message: "Unhandled job status." });
    }

    // } catch (err) {
    //     console.error(err);
    //     next(err);
    // }
};

module.exports = {
    getJobStatus,
    preprocessJob,
    processJob,
    getJobResults,
};

// const multer = require('multer');
// const path = require('path');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// // Handle job submission
// const submitJob = (req, res) => {
//   // Logic to process the job submission
//   // Access files with req.files and other form data
//   res.json({ message: 'Job submitted successfully' });
// };

// // Export controller functions
// module.exports = {
//   upload,
//   submitJob,
// };
