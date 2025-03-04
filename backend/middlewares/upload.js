// FILE: middlewares/upload.js
const multer = require("multer");
const path = require("path");
const HttpError = require("./HttpError");
const fs = require("fs");
const readline = require("readline");

const networkFileExtensions = ["gw", "el"];
const similarityFileExtensions = ["txt", "csv", "tsv"]; // <--- VERIFY PULL REQUEST HERE
const tmpDir = path.join(__dirname, "../tmp");

const sana2OptionsSchema = require("../config/modelOptions").modelOptionsSchemas.SANA2;

const storage = multer.diskStorage({
    destination: tmpDir,
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    // limits: { fileSize: 1000000 }, // <--- VERIFY PULL REQUEST HERE
    fileFilter: (req, file, cb) => {
        // console.log("Uploading file:", file.originalname); // Log the file name
        // validate file extension
        const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
        if (file.fieldname === "files") {
            if (!networkFileExtensions.includes(fileExt)) {
                return cb(
                    new HttpError(
                        `Invalid network file extension: ${fileExt}. Accepted extensions are ${networkFileExtensions.join(
                            ", "
                        )}.`,
                        400
                    )
                );
            }
        } else if (file.fieldname === "similarityFiles") {
            if (!similarityFileExtensions.includes(fileExt)) {
                return cb(
                    new HttpError(
                        `Invalid similarity file extension: ${fileExt}. Accepted extensions are ${similarityFileExtensions.join(
                            ", "
                        )}.`,
                        400
                    )
                );
            }
        }
        // check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(
                new HttpError("File names cannot contain whitespace.", 400)
            );
        }
        cb(null, true);
    },
});

const validateSimilarityFile = async (file) => {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(file.path);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        let isValid = true;
        let lineCount = 0;
        let expectedPairs = null;

        rl.on("line", (line) => {
            // Skip empty lines and comments
            if (line.trim() === "" || line.startsWith("#")) {
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

        rl.on("close", () => {
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

        rl.on("error", (error) => {
            reject(error);
        });
    });
};


const validateFilesMiddleware = (req, res, next) => {
    // console.log("Validating files:", req.files); // Log the files array
    if (!req.files.files || req.files.files.length < 2) {
        throw new HttpError("Two files must be uploaded.", 400);
    }

    const file1Ext = path
        .extname(req.files.files[0].originalname)
        .toLowerCase()
        .slice(1);
    const file2Ext = path
        .extname(req.files.files[1].originalname)
        .toLowerCase()
        .slice(1);

    if (file1Ext !== file2Ext) {
        throw new HttpError("Files must have the same extension.", 400);
    }
    next();
};

const validateSimilarityFileMiddleware = async (req, res, next) => {
    try {
        const similarityFiles = req.files.similarityFiles;
        if (similarityFiles) {
            // Parse and validate esim weights from request body
            let options;
            let esimWeights;
            try {
                options = JSON.parse(req.body.options);
                const validatedOptions = sana2OptionsSchema.parse(options);
                esimWeights = validatedOptions.advanced?.esim;
            } catch (error) {
                throw new HttpError("Invalid sana2 options format.", 400);
            }

            // Check if number of weights matches number of similarity files
            if (esimWeights?.length !== similarityFiles.length) {
                throw new HttpError(
                    "Number of esim weights must match number of similarity files.",
                    400
                );
            }

            const validationPromises = similarityFiles.map(
                validateSimilarityFile
            );
            const validationResults = await Promise.all(validationPromises);

            if (validationResults.some((result) => !result)) {
                throw new HttpError(
                    "One or more similarity files are invalid. Files must contain three columns: node1 node2 similarity(0-1)",
                    400
                );
            }
        }

        next();
    } catch (error) {
        const allFiles = [
            ...(req.files.files || []),
            ...(req.files.similarityFiles || []),
        ];
        allFiles.forEach((file) => {
            fs.unlink(file.path, (err) => {
                if (err)
                    console.error(`Error deleting file ${file.path}:`, err);
            });
        });
        next(error);
    }
};

// const validateAllFilesMiddleware = async (req, res, next) => {
//     try {
//         validateFilesMiddleware(req, res, (err) => {
//             if (err) throw err;
//         });

//         await validateSimilarityFileMiddleware(req, res, (err) => {
//             if (err) throw err;
//         });

//         next();
//     } catch (error) {
//         const allFiles = [
//             ...(req.files.files || []),
//             ...(req.files.similarityFiles || []),
//         ];
//         allFiles.forEach((file) => {
//             fs.unlink(file.path, (err) => {
//                 if (err)
//                     console.error(`Error deleting file ${file.path}:`, err);
//             });
//         });
//         next(error);
//     }
// };
const validateAllFilesMiddleware = async (req, res, next) => {
    try {
        // run validateFilesMiddleware as a Promise
        await new Promise((resolve, reject) => {
            validateFilesMiddleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // only proceed to similarity validation if the first validation passes
        await new Promise((resolve, reject) => {
            validateSimilarityFileMiddleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        next();
    } catch (error) {
        // clean up files on error
        const allFiles = [
            ...(req.files?.files || []),
            ...(req.files?.similarityFiles || [])
        ];

        // use Promise.all to ensure all files are deleted
        await Promise.all(allFiles.map(file => 
            new Promise((resolve) => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Error deleting file ${file.path}:`, err);
                    resolve();
                });
            })
        ));

        next(error);
    }
};



// const cleanupFiles = (reqFiles) => {
//     if (!reqFiles) return;

//     const allFiles = Object.values(reqFiles)
//         .flat()
//         .filter((file) => file && file.path);

//     allFiles.forEach((file) => {
//         fs.unlink(file.path, (err) => {
//             if (err) console.error(`Error deleting file ${file.path}:`, err);
//         });
//     });
// };

const cleanupFiles = (reqFiles) => {
    if (!reqFiles) return;

    const allFiles = Object.values(reqFiles)
        .flat()
        .filter((file) => file && typeof file.path === 'string' && file.path.length > 0);

    allFiles.forEach((file) => {
        fs.unlink(file.path, (err) => {
            if (err) console.error(`Error deleting file ${file.path}:`, err);
        });
    });
};

const cleanupFilesErrorHandler = async(err, req, res, next) => {

    console.log('am i here??');//TESTIN

    cleanupFiles(req.files);
    console.error('Job processing error:', err);
    // throw HttpError(err.message || 'An error occurred during job processing', 500);
    next(new HttpError(err.message || 'An error occurred during job processing', 500));
};

module.exports = {
    upload: upload.fields([
        { name: "files", maxCount: 2 },
        { name: "similarityFiles", maxCount: 3 },
    ]),
    // validateFilesMiddleware,
    // validateSimilarityFileMiddleware,
    validateAllFilesMiddleware,
    cleanupFiles,
    cleanupFilesErrorHandler
};
