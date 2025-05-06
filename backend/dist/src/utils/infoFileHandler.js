"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readInfoFile = readInfoFile;
exports.writeInfoFile = writeInfoFile;
exports.isPreprocessingJob = isPreprocessingJob;
exports.isProcessingJob = isProcessingJob;
exports.isProcessedJob = isProcessedJob;
exports.isFailedJob = isFailedJob;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
function readInfoFile(jobDir) {
    const infoFilePath = path_1.default.join(jobDir, 'info.json');
    try {
        return JSON.parse(fs_1.default.readFileSync(infoFilePath, 'utf8'));
    }
    catch (err) {
        throw new HttpError_1.default('Could not read info.json', { status: 500 });
    }
}
function writeInfoFile(jobDir, info) {
    const infoFilePath = path_1.default.join(jobDir, 'info.json');
    try {
        fs_1.default.writeFileSync(infoFilePath, JSON.stringify(info, null, 2));
    }
    catch (err) {
        throw new HttpError_1.default('Could not write to info.json', { status: 500 });
    }
}
function isPreprocessingJob(info) {
    return info.status === 'preprocessing';
}
function isProcessingJob(info) {
    return info.status === 'processing';
}
function isProcessedJob(info) {
    return info.status === 'processed' && 'zipName' in info;
}
function isFailedJob(info) {
    return info.status === 'failed' && 'log' in info;
}
//# sourceMappingURL=infoFileHandler.js.map