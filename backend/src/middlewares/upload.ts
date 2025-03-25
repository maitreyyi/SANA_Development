// FILE: middlewares/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { Request, Response, NextFunction } from 'express';
import HttpError from './HttpError'; 
import { modelOptionsSchemas } from '../config/modelOptions';
import * as Papa from 'papaparse';
import { Sana2Options } from '../config/modelOptions';
import { RequestHandler } from 'express';
import { MulterFile } from '../../types/types';


// Constants
const networkFileExtensions: string[] = ['gw', 'el'];
const similarityFileExtensions: string[] = ['txt', 'csv', 'tsv'];
const tmpDir: string = path.join(__dirname, '../tmp');

const sana2OptionsSchema = modelOptionsSchemas.SANA2;

// Configure multer storage
const storage = multer.diskStorage({
    destination: tmpDir,
    filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    // limits: { fileSize: 1000000 },
    fileFilter: (req: Request, file: MulterFile, cb: multer.FileFilterCallback) => {
        // Validate file extension
        const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
        if (file.fieldname === 'files') {
            if (!networkFileExtensions.includes(fileExt)) {
                return cb(
                    new HttpError(
                        `Invalid network file extension: ${fileExt}. Accepted extensions are ${networkFileExtensions.join(
                            ', ',
                        )}.`,
                        { status: 400},
                    ),
                );
            }
        } else if (file.fieldname === 'similarityFiles') {
            if (!similarityFileExtensions.includes(fileExt)) {
                return cb(
                    new HttpError(
                        `Invalid similarity file extension: ${fileExt}. Accepted extensions are ${similarityFileExtensions.join(
                            ', ',
                        )}.`,
                        { status: 400},
                    ),
                );
            }
        }
        // Check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(new HttpError('File names cannot contain whitespace.', { status: 400}));
        }
        cb(null, true);
    },
});

const validateSimilarityFile = async (file: MulterFile): Promise<boolean> => {
    // For CSV files, use PapaParse
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(file.path);

            Papa.parse(fileStream, {
                delimiter: ',',
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        resolve(false);
                        return;
                    }

                    const data = results.data as string[][];
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
    } else {
        // For other file types, use the original readline approach
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(file.path);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });

            let isValid = true;
            let lineCount = 0;
            let expectedPairs: number | null = null;

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

const validateFilesMiddleware = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!req.files || !req.files['files'] || req.files['files'].length < 2) {

            reject(new HttpError('Two files must be uploaded.', { status: 400}));
            return;
        }

        const file1Ext = path.extname(req.files['files'][0].originalname).toLowerCase().slice(1);
        const file2Ext = path.extname(req.files['files'][1].originalname).toLowerCase().slice(1);

        if (file1Ext !== file2Ext) {
            reject(new HttpError('Files must have the same extension.', { status: 400}));
            return;
        }
        resolve();
    });
};

const validateSimilarityFileMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const similarityFiles = req.files?.['similarityFiles'];
        if (similarityFiles) {
            // Parse and validate esim weights from request body
            // let options: SANA2Options;
            let options: Sana2Options;
            let esimWeights: number[] | undefined;
            try {
                options = JSON.parse(req.body.options);
                const validatedOptions = sana2OptionsSchema.parse(options);
                esimWeights = validatedOptions.advanced?.esim;
            } catch (error) {
                throw new HttpError('Invalid sana2 options format.', { status: 400});
            }

            // Check if number of weights matches number of similarity files
            if (esimWeights?.length !== similarityFiles.length) {
                throw new HttpError('Number of esim weights must match number of similarity files.', { status: 400});
            }

            const validationPromises = similarityFiles.map(validateSimilarityFile);
            const validationResults = await Promise.all(validationPromises);

            if (validationResults.some((result) => !result)) {
                throw new HttpError(
                    'One or more similarity files are invalid. Files must contain three columns: node1 node2 similarity(0-1)',
                    { status: 400},
                );
            }
        }

        next();
    } catch (error) {
        const allFiles = [...(req.files?.['files'] || []), ...(req.files?.['similarityFiles'] || [])];
        allFiles.forEach((file) => {
            fs.unlink(file.path, (err) => {
                if (err) console.error(`Error deleting file ${file.path}:`, err);
            });
        });
        next(error);
    }
};

const validateAllFilesMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await validateFilesMiddleware(req);
        await validateSimilarityFileMiddleware(req, res, next);
        next();
    } catch (error) {
        cleanupFiles(req.files);
        next(error);
    }
};

const cleanupFiles = (reqFiles: Request['files'] | undefined): void => {
    if (!reqFiles) return;

    const allFiles = Object.values(reqFiles)
        .flat()
        .filter((file): file is MulterFile => !!file && typeof file.path === 'string' && file.path.length > 0);

    allFiles.forEach((file) => {
        fs.unlink(file.path, (err) => {
            if (err) console.error(`Error deleting file ${file.path}:`, err);
        });
    });
};

const cleanupFilesErrorHandler = async (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    console.log('am i here?'); // TESTING

    cleanupFiles(req.files);
    console.error('Job processing error:', err);
    next(new HttpError(err.message || 'An error occurred during job processing', {status:500}));
};

// Configure multer upload
const uploadMiddleware = upload.fields([
    { name: 'files', maxCount: 2 },
    { name: 'similarityFiles', maxCount: 3 },
]);

const zipStorage = multer.diskStorage({
    destination: tmpDir,
    filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'zip-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const zipUpload = multer({
    storage: zipStorage,
    fileFilter: (req: Request, file: MulterFile, cb: multer.FileFilterCallback) => {
        // Only accept zip files
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.zip') {
            return cb(new HttpError('Only .zip files are accepted for this endpoint.', { status: 400 }));
        }
        
        // Check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(new HttpError('File names cannot contain whitespace.', { status: 400 }));
        }
        
        cb(null, true);
    }
});

const zipUploadMiddleware = zipUpload.single('zipFile');

// ...existing code...

import AdmZip from 'adm-zip';
import { Readable } from 'stream';

// Add this new middleware after your zipUploadMiddleware
const extractZipMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            return next(new HttpError('Zip file is required.', { status: 400 }));
        }

        const zipFile = req.file;
        const extractDir = path.join(tmpDir, `extract-${Date.now()}`);

        // Create extraction directory
        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir, { recursive: true });
        }
        
        // Extract zip file
        const zip = new AdmZip(zipFile.path);
        zip.extractAllTo(extractDir, true);
        
        // Find network files (.gw or .el files)
        const networkFiles = fs.readdirSync(extractDir)
            .filter(file => ['.gw', '.el'].includes(path.extname(file).toLowerCase()))
            .map(file => {
                const filePath = path.join(extractDir, file);
                // Read file content into buffer
                const fileBuffer = fs.readFileSync(filePath);
                
                // Create a readable stream from the buffer (no file handles kept open)
                const fileStream = new Readable();
                fileStream.push(fileBuffer);
                fileStream.push(null); // Signal end of stream
                
                return {
                    path: filePath,
                    originalname: file,
                    fieldname: 'files',
                    mimetype: 'application/octet-stream',
                    size: fs.statSync(filePath).size,
                    filename: path.basename(file),
                    encoding: '7bit',
                    destination: extractDir,
                    buffer: fileBuffer,
                    stream: fileStream
                };
            });
        
        if (networkFiles.length < 2) {
            // Clean up extracted files if validation fails
            fs.rmSync(extractDir, { recursive: true, force: true });
            return next(new HttpError('The zip file must contain at least two network files (.gw or .el).', { status: 400 }));
        }
        
        // Attach the files to req object in the format expected by the job creation code
        req.files = {
            files: networkFiles.slice(0, 2),
            similarityFiles: [],
        };
        
        // Store the extract directory path for cleanup later
        req.extractDir = extractDir;
        
        next();
    } catch (err) {
        // Clean up zip file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
};

// Add a cleanup middleware for after processing
const cleanupZipMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Clean up extracted directory
    if (req.extractDir && fs.existsSync(req.extractDir)) {
        try {
            fs.rmSync(req.extractDir, { recursive: true, force: true });
        } catch (err) {
            console.error('Error cleaning up extract directory:', err);
        }
    }
    
    // Clean up original zip file
    if (req.file && fs.existsSync(req.file.path)) {
        try {
            fs.unlinkSync(req.file.path);
        } catch (err) {
            console.error('Error cleaning up zip file:', err);
        }
    }
    
    next();
};

export {
    uploadMiddleware,
    validateAllFilesMiddleware,
    cleanupFiles,
    cleanupFilesErrorHandler,
    zipUploadMiddleware,
    extractZipMiddleware,
    cleanupZipMiddleware,
    tmpDir
};
