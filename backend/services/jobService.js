const fs = require("fs");
const path = require("path");
const HttpError = require("../middlewares/HttpError");
/**
 * @typedef {Object} JobData
 * @property {string} id - The job ID.
 * @property {string} status - The job status.
 * @property {string} execLogFileOutput - The execution log file output.
 */
/**
 * @typedef {Object} RedirectToResults
 * @property {boolean} redirectToResults - Indicates if the job should redirect to results.
 */
/**
 * Gets the job data based on the job ID.
 * @param {string} id - The job ID.
 * @returns {Promise<JobData|RedirectToResults>} The job data or a redirect to results object.
 */
const getJobData = async (id) => {
    const jobDir = path.join(__dirname, "..", "process", id);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        return { redirectToResults: true };
    }

    const infoJsonPath = path.join(jobDir, "info.json");

    // If info.json doesn't exist, redirect to results
    if (!fs.existsSync(infoJsonPath)) {
        return { redirectToResults: true };
    }

    const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, "utf8"));
    const status = infoJson.status;

    if (status === "processed") {
        return { redirectToResults: true };
    } else if (status === "processing" || status === "preprocessed") {
        const execLogFilePath = path.join(jobDir, "run.log");
        let execLogFileOutput = "";

        if (fs.existsSync(execLogFilePath)) {
            try {
                const data = fs.readFileSync(execLogFilePath, "utf8");
                const lines = data.split("\n");
                execLogFileOutput = lines
                    .map((line) => `<span>${line.trim()}</span>`)
                    .join("");
            } catch (err) {
                execLogFileOutput = "Problem opening execution log file.";
            }
        } else {
            execLogFileOutput = "Job execution log file does not exist.";
        }

        return { id, status, execLogFileOutput };
    } else {
        return { id, status: "unknown", execLogFileOutput: "" };
    }
};

const getJobExecutionLog = (jobId) => {
    const jobDir = path.join(__dirname, "../process", jobId);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        throw new HttpError(
            "Sorry: no such result Job ID exists. Please try another Job ID.",
            404
        );
    }

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

    return execLogFileOutput;
};

module.exports = { getJobData, getJobExecutionLog };
