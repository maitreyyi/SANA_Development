"use strict";
// const fs = require("fs");
// const path = require("path");
// const HttpError = require("../middlewares/HttpError");
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
const getJobExecutionLog = (jobId) => {
    const jobDir = path.join(__dirname, "../process", jobId);
    if (!fs.existsSync(jobDir) || !fs.lstatSync(jobDir).isDirectory()) {
        throw new HttpError_1.default("Sorry: no such result Job ID exists. Please try another Job ID.", { status: 404 });
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
        }
        catch (err) {
            execLogFileOutput = "Problem opening execution log file.";
        }
    }
    else {
        execLogFileOutput = "Job execution log file does not exist.";
    }
    return execLogFileOutput;
};
exports.default = getJobExecutionLog;
//# sourceMappingURL=getJobExecutionLog.js.map