const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

// Apply API key middleware to job routes
router.use(apiKeyMiddleware);

router.post('/submit', jobController.submitJob);
router.get('/status/:id', jobController.getJobStatus);

module.exports = router;
