// const fs = require("fs");
// const path = require("path");
// const HttpError = require("../middlewares/HttpError");

// const getJobExecutionLog = (jobId) => {
//     const jobDir = path.join(__dirname, "../process", jobId);

//     if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
//         throw new HttpError(
//             "Sorry: no such result Job ID exists. Please try another Job ID.",
//             404
//         );
//     }

//     const execLogFilePath = path.join(jobDir, "run.log");
//     let execLogFileOutput = "";

//     if (fs.existsSync(execLogFilePath)) {
//         try {
//             const execLogFileContent = fs.readFileSync(execLogFilePath, "utf8");
//             const lines = execLogFileContent.split("\n");
//             execLogFileOutput = lines
//                 .map((line) => `<span>${line.trim()}</span>`)
//                 .join("");
//         } catch (err) {
//             execLogFileOutput = "Problem opening execution log file.";
//         }
//     } else {
//         execLogFileOutput = "Job execution log file does not exist.";
//     }

//     return execLogFileOutput;
// };

// module.exports = getJobExecutionLog;
import * as fs from "fs";
import * as path from "path";
import HttpError from "../middlewares/HttpError";

const getJobExecutionLog = (jobId: string): string => {
    const jobDir: string = path.join(__dirname, "../process", jobId);

    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        throw new HttpError(
            "Sorry: no such result Job ID exists. Please try another Job ID.",
            {status:404}
        );
    }

    const execLogFilePath: string = path.join(jobDir, "run.log");
    let execLogFileOutput: string = "";

    if (fs.existsSync(execLogFilePath)) {
        try {
            const execLogFileContent: string = fs.readFileSync(execLogFilePath, "utf8");
            const lines: string[] = execLogFileContent.split("\n");
            execLogFileOutput = lines
                .map((line: string) => `<span>${line.trim()}</span>`)
                .join("");
        } catch (err) {
            execLogFileOutput = "Problem opening execution log file.";
        }
    } else {
        execLogFileOutput = "Job execution log file does not exist.";
    }

    return execLogFileOutput;
};

export default getJobExecutionLog;