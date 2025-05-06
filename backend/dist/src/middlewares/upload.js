"use strict";
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
exports.tmpDir = exports.cleanupZipMiddleware = exports.extractZipMiddleware = exports.zipUploadMiddleware = exports.cleanupFilesErrorHandler = exports.cleanupFiles = exports.validateAllFilesMiddleware = exports.uploadMiddleware = void 0;
// FILE: middlewares/upload.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const HttpError_1 = __importDefault(require("./HttpError"));
const modelOptions_1 = require("../config/modelOptions");
const Papa = __importStar(require("papaparse"));
// Constants
const networkFileExtensions = ['gw', 'el'];
const similarityFileExtensions = ['txt', 'csv', 'tsv'];
const tmpDir = path_1.default.join(__dirname, '../tmp');
exports.tmpDir = tmpDir;
const sana2OptionsSchema = modelOptions_1.modelOptionsSchemas.SANA2;
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: tmpDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    // limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        // Validate file extension
        const fileExt = path_1.default.extname(file.originalname).toLowerCase().slice(1);
        if (file.fieldname === 'files') {
            if (!networkFileExtensions.includes(fileExt)) {
                return cb(new HttpError_1.default(`Invalid network file extension: ${fileExt}. Accepted extensions are ${networkFileExtensions.join(', ')}.`, { status: 400 }));
            }
        }
        else if (file.fieldname === 'similarityFiles') {
            if (!similarityFileExtensions.includes(fileExt)) {
                return cb(new HttpError_1.default(`Invalid similarity file extension: ${fileExt}. Accepted extensions are ${similarityFileExtensions.join(', ')}.`, { status: 400 }));
            }
        }
        // Check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(new HttpError_1.default('File names cannot contain whitespace.', { status: 400 }));
        }
        cb(null, true);
    },
});
const validateSimilarityFile = async (file) => {
    // For CSV files, use PapaParse
    if (path_1.default.extname(file.originalname).toLowerCase() === '.csv') {
        return new Promise((resolve, reject) => {
            const fileStream = fs_1.default.createReadStream(file.path);
            Papa.parse(fileStream, {
                delimiter: ',',
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        resolve(false);
                        return;
                    }
                    const data = results.data;
                    if (data.length < 2) {
                        resolve(false);
                        return;
                    }
                    // First line should be a number (expected pairs)
                    const expectedPairs = parseInt(data[0][0]);
                    if (isNaN(expectedPairs) || data[0].length !== 1) {
                        resolve(false);
                        return;
                    }
                    // Check if the number of actual pairs matches the expected count
                    if (data.length - 1 !== expectedPairs) {
                        resolve(false);
                        return;
                    }
                    // Validate each similarity pair
                    for (let i = 1; i < data.length; i++) {
                        const row = data[i];
                        if (row.length !== 3 || !row[0] || !row[1]) {
                            resolve(false);
                            return;
                        }
                        const similarity = parseFloat(row[2]);
                        if (isNaN(similarity) || similarity < -0.000001 || similarity > 1.000001) {
                            resolve(false);
                            return;
                        }
                    }
                    resolve(true);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    }
    else {
        // For other file types, use the original readline approach
        return new Promise((resolve, reject) => {
            const fileStream = fs_1.default.createReadStream(file.path);
            const rl = readline_1.default.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            let isValid = true;
            let lineCount = 0;
            let expectedPairs = null;
            rl.on('line', (line) => {
                // Skip empty lines and comments
                if (line.trim() === '' || line.startsWith('#')) {
                    return;
                }
                lineCount++;
                // Handle first line (expected number of pairs)
                if (lineCount === 1) {
                    expectedPairs = parseInt(line.trim());
                    if (isNaN(expectedPairs)) {
                        isValid = false;
                        rl.close();
                        return;
                    }
                    return;
                }
                // Split by any number of whitespace characters (space or tab)
                const columns = line.trim().split(/\s+/);
                // Check if we have exactly 3 columns
                if (columns.length !== 3) {
                    isValid = false;
                    rl.close();
                    return;
                }
                // Validate node names (first two columns)
                if (!columns[0] || !columns[1]) {
                    isValid = false;
                    rl.close();
                    return;
                }
                // Validate similarity score (third column)
                const similarity = parseFloat(columns[2]);
                if (isNaN(similarity)) {
                    isValid = false;
                    rl.close();
                    return;
                }
                // More lenient similarity range check (allow small floating-point imprecisions)
                if (similarity < -0.000001 || similarity > 1.000001) {
                    isValid = false;
                    rl.close();
                    return;
                }
            });
            rl.on('close', () => {
                // File should have at least two lines (count + at least one similarity pair)
                if (lineCount < 2) {
                    resolve(false);
                    return;
                }
                // Check if the number of actual pairs matches the expected count
                // Subtract 1 from lineCount to account for the first line with the count
                if (expectedPairs && lineCount - 1 !== expectedPairs) {
                    resolve(false);
                    return;
                }
                resolve(isValid);
            });
            rl.on('error', (error) => {
                reject(error);
            });
        });
    }
};
// const validateFilesMiddleware = (req: RequestWithFiles, res: Response, next: NextFunction): void => {
//     if (!req.files?.files || req.files.files.length < 2) {
//         throw new HttpError('Two files must be uploaded.', { status: 400});
//     }
//     const file1Ext = path.extname(req.files.files[0].originalname).toLowerCase().slice(1);
//     const file2Ext = path.extname(req.files.files[1].originalname).toLowerCase().slice(1);
//     if (file1Ext !== file2Ext) {
//         throw new HttpError('Files must have the same extension.', { status: 400});
//     }
//     next();
// };
const validateFilesMiddleware = (req) => {
    return new Promise((resolve, reject) => {
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {
            reject(new HttpError_1.default('Two files must be uploaded.', { status: 400 }));
            return;
        }
        const file1Ext = path_1.default.extname(req.files['files'][0].originalname).toLowerCase().slice(1);
        const file2Ext = path_1.default.extname(req.files['files'][1].originalname).toLowerCase().slice(1);
        if (file1Ext !== file2Ext) {
            reject(new HttpError_1.default('Files must have the same extension.', { status: 400 }));
            return;
        }
        resolve();
    });
};
const validateSimilarityFileMiddleware = async (req, res, next) => {
    var _a, _b, _c, _d;
    try {
        const similarityFiles = (_a = req.files) === null || _a === void 0 ? void 0 : _a['similarityFiles'];
        if (similarityFiles) {
            // Parse and validate esim weights from request body
            // let options: SANA2Options;
            let options;
            let esimWeights;
            try {
                options = JSON.parse(req.body.options);
                const validatedOptions = sana2OptionsSchema.parse(options);
                esimWeights = (_b = validatedOptions.advanced) === null || _b === void 0 ? void 0 : _b.esim;
            }
            catch (error) {
                throw new HttpError_1.default('Invalid sana2 options format.', { status: 400 });
            }
            // Check if number of weights matches number of similarity files
            if ((esimWeights === null || esimWeights === void 0 ? void 0 : esimWeights.length) !== similarityFiles.length) {
                throw new HttpError_1.default('Number of esim weights must match number of similarity files.', { status: 400 });
            }
            const validationPromises = similarityFiles.map(validateSimilarityFile);
            const validationResults = await Promise.all(validationPromises);
            if (validationResults.some((result) => !result)) {
                throw new HttpError_1.default('One or more similarity files are invalid. Files must contain three columns: node1 node2 similarity(0-1)', { status: 400 });
            }
        }
        next();
    }
    catch (error) {
        const allFiles = [...(((_c = req.files) === null || _c === void 0 ? void 0 : _c['files']) || []), ...(((_d = req.files) === null || _d === void 0 ? void 0 : _d['similarityFiles']) || [])];
        allFiles.forEach((file) => {
            fs_1.default.unlink(file.path, (err) => {
                if (err)
                    console.error(`Error deleting file ${file.path}:`, err);
            });
        });
        next(error);
    }
};
const validateAllFilesMiddleware = async (req, res, next) => {
    try {
        await validateFilesMiddleware(req);
        await validateSimilarityFileMiddleware(req, res, next);
        next();
    }
    catch (error) {
        cleanupFiles(req.files);
        next(error);
    }
};
exports.validateAllFilesMiddleware = validateAllFilesMiddleware;
const cleanupFiles = (reqFiles) => {
    if (!reqFiles)
        return;
    const allFiles = Object.values(reqFiles)
        .flat()
        .filter((file) => !!file && typeof file.path === 'string' && file.path.length > 0);
    allFiles.forEach((file) => {
        fs_1.default.unlink(file.path, (err) => {
            if (err)
                console.error(`Error deleting file ${file.path}:`, err);
        });
    });
};
exports.cleanupFiles = cleanupFiles;
const cleanupFilesErrorHandler = async (err, req, res, next) => {
    console.log('am i here?'); // TESTING
    cleanupFiles(req.files);
    console.error('Job processing error:', err);
    next(new HttpError_1.default(err.message || 'An error occurred during job processing', { status: 500 }));
};
exports.cleanupFilesErrorHandler = cleanupFilesErrorHandler;
// Configure multer upload
const uploadMiddleware = upload.fields([
    { name: 'files', maxCount: 2 },
    { name: 'similarityFiles', maxCount: 3 },
]);
exports.uploadMiddleware = uploadMiddleware;
const zipStorage = multer_1.default.diskStorage({
    destination: tmpDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'zip-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const zipUpload = (0, multer_1.default)({
    storage: zipStorage,
    fileFilter: (req, file, cb) => {
        // Only accept zip files
        const fileExt = path_1.default.extname(file.originalname).toLowerCase();
        if (fileExt !== '.zip') {
            return cb(new HttpError_1.default('Only .zip files are accepted for this endpoint.', { status: 400 }));
        }
        // Check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(new HttpError_1.default('File names cannot contain whitespace.', { status: 400 }));
        }
        cb(null, true);
    }
});
const zipUploadMiddleware = zipUpload.single('zipFile');
exports.zipUploadMiddleware = zipUploadMiddleware;
// ...existing code...
const adm_zip_1 = __importDefault(require("adm-zip"));
const stream_1 = require("stream");
// Add this new middleware after your zipUploadMiddleware
const extractZipMiddleware = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new HttpError_1.default('Zip file is required.', { status: 400 }));
        }
        const zipFile = req.file;
        const extractDir = path_1.default.join(tmpDir, `extract-${Date.now()}`);
        // Create extraction directory
        if (!fs_1.default.existsSync(extractDir)) {
            fs_1.default.mkdirSync(extractDir, { recursive: true });
        }
        // Extract zip file
        const zip = new adm_zip_1.default(zipFile.path);
        zip.extractAllTo(extractDir, true);
        // Find network files (.gw or .el files)
        const networkFiles = fs_1.default.readdirSync(extractDir)
            .filter(file => ['.gw', '.el'].includes(path_1.default.extname(file).toLowerCase()))
            .map(file => {
            const filePath = path_1.default.join(extractDir, file);
            // Read file content into buffer
            const fileBuffer = fs_1.default.readFileSync(filePath);
            // Create a readable stream from the buffer (no file handles kept open)
            const fileStream = new stream_1.Readable();
            fileStream.push(fileBuffer);
            fileStream.push(null); // Signal end of stream
            return {
                path: filePath,
                originalname: file,
                fieldname: 'files',
                mimetype: 'application/octet-stream',
                size: fs_1.default.statSync(filePath).size,
                filename: path_1.default.basename(file),
                encoding: '7bit',
                destination: extractDir,
                buffer: fileBuffer,
                stream: fileStream
            };
        });
        if (networkFiles.length < 2) {
            // Clean up extracted files if validation fails
            fs_1.default.rmSync(extractDir, { recursive: true, force: true });
            return next(new HttpError_1.default('The zip file must contain at least two network files (.gw or .el).', { status: 400 }));
        }
        // Attach the files to req object in the format expected by the job creation code
        req.files = {
            files: networkFiles.slice(0, 2),
            similarityFiles: [],
        };
        // Store the extract directory path for cleanup later
        req.extractDir = extractDir;
        next();
    }
    catch (err) {
        // Clean up zip file on error
        if (req.file) {
            fs_1.default.unlinkSync(req.file.path);
        }
        next(err);
    }
};
exports.extractZipMiddleware = extractZipMiddleware;
// Add a cleanup middleware for after processing
const cleanupZipMiddleware = (req, res, next) => {
    // Clean up extracted directory
    if (req.extractDir && fs_1.default.existsSync(req.extractDir)) {
        try {
            fs_1.default.rmSync(req.extractDir, { recursive: true, force: true });
        }
        catch (err) {
            console.error('Error cleaning up extract directory:', err);
        }
    }
    // Clean up original zip file
    if (req.file && fs_1.default.existsSync(req.file.path)) {
        try {
            fs_1.default.unlinkSync(req.file.path);
        }
        catch (err) {
            console.error('Error cleaning up zip file:', err);
        }
    }
    next();
};
exports.cleanupZipMiddleware = cleanupZipMiddleware;
//# sourceMappingURL=upload.js.map