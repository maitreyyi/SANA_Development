// dest: 'backend/tmp/'     --> maybe use 'backend/process' maybe not
const { upload, validateFilesMiddleware } = require("../middlewares/upload");
const ErrorHandler = require("../middlewares/ErrorHandler");
const express = require("express");
const {
    preprocessJob,
    getJobStatus,
    processJob,
    getJobResults,
} = require("../controllers/jobController");
const router = express.Router();

router.get("/:id", getJobStatus, ErrorHandler);
router.post(
    "/preprocess",
    upload.array("files", 2),
    validateFilesMiddleware,
    preprocessJob,
    ErrorHandler
);
router.post("/process", processJob, ErrorHandler);
// router.get("/results", getJobResults, ErrorHandler);
router.get("/results/:id", getJobResults, ErrorHandler);

module.exports = router;
