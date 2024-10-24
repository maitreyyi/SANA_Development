const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/submit', jobController.upload.array('files', 2), jobController.submitJob);

module.exports = router;
