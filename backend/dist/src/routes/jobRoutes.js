"use strict";
// // dest: 'backend/tmp/'     --> maybe use 'backend/process' maybe not
// const {
//     upload,
//     validateAllFilesMiddleware,
//     cleanupFilesErrorHandler,
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const upload_1 = require("../middlewares/upload");
const jobController_1 = require("../controllers/jobController");
const supabase_1 = require("../middlewares/supabase");
const router = (0, express_1.Router)();
router.get('/:id/zip', jobController_1.downloadZipJob);
router.post('/preprocess', upload_1.uploadMiddleware, upload_1.validateAllFilesMiddleware, jobController_1.submitJobController, upload_1.cleanupFilesErrorHandler);
router.post('/process', jobController_1.processController);
router.get('/:id', jobController_1.getJobResults);
// router.get('/api/jobs', lookupJobsController); <-- for admin page in future
router.post('/submit-default-zip', supabase_1.supabaseAuth, upload_1.zipUploadMiddleware, upload_1.extractZipMiddleware, jobController_1.submitDefaultZipController, upload_1.cleanupZipMiddleware);
exports.default = router;
//# sourceMappingURL=jobRoutes.js.map