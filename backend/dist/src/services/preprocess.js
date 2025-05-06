"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocess = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
const preprocess = async (files, options, jobData) => {
    // 4. create directories for the job
    const jobLocation = jobData.jobLocation;
    const network1Dir = path_1.default.join(jobLocation, "networks", jobData.network1Name);
    const network2Dir = path_1.default.join(jobLocation, "networks", jobData.network2Name);
    try {
        fs_1.default.mkdirSync(jobLocation, { recursive: true });
        fs_1.default.mkdirSync(path_1.default.join(jobLocation, "networks"), {
            recursive: true,
        });
        fs_1.default.mkdirSync(network1Dir, { recursive: true });
        if (jobData.network1Name !== jobData.network2Name) {
            fs_1.default.mkdirSync(network2Dir, { recursive: true });
        }
    }
    catch (e) {
        throw new HttpError_1.default(`Error creating directories: ${e.message}`, { status: 500 });
    }
    // 5. Move the network files into their respective directories
    const network1Location = path_1.default.join(network1Dir, `${jobData.network1Name}${jobData.extension}`);
    const network2Location = path_1.default.join(network2Dir, `${jobData.network2Name}${jobData.extension}`);
    try {
        fs_1.default.mkdirSync(path_1.default.dirname(network1Location), { recursive: true });
        fs_1.default.renameSync(files.files[0].path, network1Location);
    }
    catch (error) {
        throw new HttpError_1.default(`First file ${files.files[0].originalname} could not be moved to ${network1Location}`, { status: 500 });
    }
    if (jobData.network1Name !== jobData.network2Name) {
        try {
            fs_1.default.mkdirSync(path_1.default.dirname(network2Location), {
                recursive: true,
            });
            fs_1.default.renameSync(files.files[1].path, network2Location);
        }
        catch (error) {
            throw new HttpError_1.default(`Second file ${files.files[1].originalname} could not be moved to ${network2Location}`, { status: 500 });
        }
    }
    if (jobData.modelVersion === 'SANA2') {
        console.log('Processing SANA2 similarity files:', files);
        // 5a. create directory for esim files
        const esimFilesDir = path_1.default.join(jobData.jobLocation, 'esim-files');
        try {
            fs_1.default.mkdirSync(esimFilesDir, { recursive: true });
        }
        catch (error) {
            throw new HttpError_1.default(`Processing directory ${esimFilesDir} could not be created.`, { status: 500 });
        }
        if (files.similarityFiles) {
            for (let i = 0; i < files.similarityFiles.length; i++) {
                const simFile = files.similarityFiles[i];
                // Just use index number without extension
                const simFilePath = path_1.default.join(esimFilesDir, `sim_${i}`);
                try {
                    fs_1.default.renameSync(simFile.path, simFilePath);
                }
                catch (error) {
                    throw new HttpError_1.default(`Similarity file ${simFile.originalname} could not be moved to ${simFilePath}`, { status: 500 });
                }
            }
        }
    }
    // 6. Write job info to a JSON file
    const statusFile = path_1.default.join(jobLocation, "info.json");
    try {
        fs_1.default.writeFileSync(statusFile, JSON.stringify({
            status: "preprocessed",
            data: jobData,
            options: options,
            version: jobData.modelVersion
        }));
    }
    catch (error) {
        throw new HttpError_1.default(`Error writing job info to JSON file`, { status: 500 });
    }
};
exports.preprocess = preprocess;
//# sourceMappingURL=preprocess.js.map