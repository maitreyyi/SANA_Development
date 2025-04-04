// // dest: 'backend/tmp/'     --> maybe use 'backend/process' maybe not
// const {
//     upload,
//     validateAllFilesMiddleware,
//     cleanupFilesErrorHandler,

// } = require("../middlewares/upload");
// const express = require("express");
// const {
//     downloadZipJob,
//     getJobResults,
//     submitJobController,
//     processController
// } = require("../controllers/jobController");
// const router = express.Router();

// /**
//  * @typedef {import('../middlewares/ErrorHandler').ErrorResponse} ErrorResponse
//  */

// /**
//  * @typedef {import('../services/jobService').JobData} JobData
//  * @typedef {import('../services/jobService').RedirectToResults} RedirectToResults
//  *
// // /**
// //  * @route GET /api/jobs/:id
// //  * @param {string} id - The job ID
// //  * @returns {JobData|RedirectToResults|ErrorResponse} 200 - Job data, redirect to results, or error response
// //  */
// // router.get("/:id", getJobStatus);

// /**
//  * @route GET /api/jobs/:id/zip
//  * @param {string} id - The job ID
//  * @returns {void | ErrorResponse} 200 - File download or error response
//  */
// router.get("/:id/zip", downloadZipJob);
// router.post('/preprocess', upload, validateAllFilesMiddleware, submitJobController, cleanupFilesErrorHandler);
// router.post('/process', processController);
// router.get('/:id', getJobResults);
// // router.get('/api/jobs', lookupJobsController); <-- for admin page in future

// module.exports = router;
import { Router, Request, Response, NextFunction } from 'express';
import {
    uploadMiddleware,
    validateAllFilesMiddleware,
    cleanupFilesErrorHandler,
    zipUploadMiddleware,
    extractZipMiddleware,
    cleanupZipMiddleware,
} from '../middlewares/upload';
import {
    downloadZipJob,
    getJobResults,
    submitJobController,
    processController,
    submitDefaultZipController,
} from '../controllers/jobController';
import apiKeyMiddleware from '../middlewares/apiKeyMiddleware';
import { supabaseAuth } from '../middlewares/supabase';

const router: Router = Router();


router.get('/:id/zip', downloadZipJob);
router.post(
    '/preprocess',
    uploadMiddleware,
    validateAllFilesMiddleware,
    submitJobController,
    cleanupFilesErrorHandler,
);
router.post('/process', processController);
router.get('/:id', getJobResults);
// router.get('/api/jobs', lookupJobsController); <-- for admin page in future
router.post(
    '/submit-default-zip',
    supabaseAuth,
    zipUploadMiddleware,
    extractZipMiddleware,
    submitDefaultZipController,
    cleanupZipMiddleware
);


export default router;
