// FILE: middlewares/upload.js
const multer = require("multer");
const path = require("path");
const HttpError = require("./HttpError");

const validExtensions = ["gw", "el"];

const upload = multer({
    dest: "./backend/tmp/",
    // limits: { fileSize: 1000000 }, // limit file size to 1MB
    fileFilter: (req, file, cb) => {
        // Check for valid file extension
        const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
        if (!validExtensions.includes(fileExt)) {
            return cb(
                new HttpError(
                    `Invalid file extension: ${fileExt}. Accepted extensions are ${validExtensions.join(
                        ", "
                    )}.`,
                    400
                )
            );
        }

        // Check for whitespace in filename
        if (/\s/.test(file.originalname)) {
            return cb(
                new HttpError("File names cannot contain whitespace.", 400)
            );
        }
        cb(null, true);
    },
});

const validateFilesMiddleware = (req, res, next) => {
    if (!req.files || req.files.length < 2) {
        throw new HttpError("Two files must be uploaded.", 400);
    }

    const file1Ext = path
        .extname(req.files[0].originalname)
        .toLowerCase()
        .slice(1);
    const file2Ext = path
        .extname(req.files[1].originalname)
        .toLowerCase()
        .slice(1);

    if (file1Ext !== file2Ext) {
        throw new HttpError("Files must have the same extension.", 400);
    }
    next();
};

module.exports = { upload, validateFilesMiddleware };
