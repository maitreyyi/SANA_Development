<<<<<<< HEAD
const express = require('express');
=======
// dest: 'backend/tmp/'     --> maybe use 'backend/process' maybe not
const { 
    upload, 
    validateAllFilesMiddleware,
    cleanupFilesErrorHandler,

} = require("../middlewares/upload");
const express = require("express");
const {
    downloadZipJob,
    getJobResults,
    submitJobController, 
    processController
} = require("../controllers/jobController");
>>>>>>> origin/main
const router = express.Router();
const jobController = require('../controllers/jobController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

// Apply API key middleware to job routes
router.use(apiKeyMiddleware);

<<<<<<< HEAD
// router.post('/submit', jobController.submitJob);
router.get('/status/:id', jobController.getJobStatus);
=======
/**
 * @typedef {import('../services/jobService').JobData} JobData
 * @typedef {import('../services/jobService').RedirectToResults} RedirectToResults
 * 
// /**
//  * @route GET /api/jobs/:id
//  * @param {string} id - The job ID
//  * @returns {JobData|RedirectToResults|ErrorResponse} 200 - Job data, redirect to results, or error response
//  */
// router.get("/:id", getJobStatus);

/**
 * @route GET /api/jobs/:id/zip
 * @param {string} id - The job ID
 * @returns {void | ErrorResponse} 200 - File download or error response
 */
router.get("/:id/zip", downloadZipJob);
router.post('/preprocess', upload, validateAllFilesMiddleware, submitJobController, cleanupFilesErrorHandler);
router.post('/process', processController);
router.get('/:id', getJobResults);
// router.get('/api/jobs', lookupJobsController); <-- for admin page in future 

>>>>>>> origin/main

module.exports = router;
