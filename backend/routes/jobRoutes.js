// dest: 'backend/tmp/'     --> maybe use 'backend/process' maybe not
const { upload, validateFilesMiddleware } = require("../middlewares/upload");
const express = require("express");
const {
    preprocessJob,
    getJobStatus,
    downloadZipJob,
    processJob,
    getJobResults,
} = require("../controllers/jobController");
const router = express.Router();

/**
 * @typedef {import('../middlewares/ErrorHandler').ErrorResponse} ErrorResponse
 */

/**
 * @typedef {import('../services/jobService').JobData} JobData
 * @typedef {import('../services/jobService').RedirectToResults} RedirectToResults
 */
/**
 * @route GET /api/jobs/:id
 * @param {string} id - The job ID
 * @returns {JobData|RedirectToResults|ErrorResponse} 200 - Job data, redirect to results, or error response
 */
router.get("/:id", getJobStatus);

/**
 * @route GET /api/jobs/:id/zip
 * @param {string} id - The job ID
 * @returns {void | ErrorResponse} 200 - File download or error response
 */
router.get("/:id/zip", downloadZipJob);

router.post(
    "/preprocess",
    upload.array("files", 2),
    validateFilesMiddleware,
    preprocessJob
);

router.post("/process", processJob);

/**
 * @typedef {import('../controllers/jobController').ErrorMessageResponse} ErrorMessageResponse
 * @typedef {import('../controllers/jobController').ProcessedJobResponse} ProcessedJobResponse
 * @typedef {import('../controllers/jobController').FailedJobResponse} FailedJobResponse
 */
/**
 * @route GET /api/jobs/results/:id
 * @param {string} id - The job ID
 * @returns {ProcessedJobResponse | FailedJobResponse | ErrorMessageResponse | ErrorResponse} 200 - Job data, redirect to results, or error response
 */
router.get("/results/:id", getJobResults);

module.exports = router;
