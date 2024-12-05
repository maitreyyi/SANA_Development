const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const jobController = require('../controllers/jobController');
const JOBS_DIR = path.resolve(__dirname, 'jobs'); // directory where job task info is stored

router.post('/submit', jobController.upload.array('files', 2), jobController.submitJob);

// job lookup endpoint
router.get('/job', jobController.validateQueryParams, (req, res) => {
  const jobId = req.query.id;
  const jobDir = path.join(JOBS_DIR, jobId);

  // check if job directory exists
  if (!fs.existsSync(jobDir) || !fs.statSync(jobDir).isDirectory()) {
    return res.status(404).json({ error: `Job of ID ${jobId} not found.` });
  }

  const infoFilePath = path.join(jobDir, 'info.json');
  const errorFilePath = path.join(jobDir, 'error.log');
  const runLogFilePath = path.join(jobDir, 'run.log');

  const isProcessed = fs.existsSync(infoFilePath);
  const hasError = fs.existsSync(errorFilePath);

  let jobData = null;

  // Parse info.json if it exists
  if (isProcessed) {
    try {
        // code for parsing info.json file data here
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse info.json.' });
    }
  }

  const response = {
    jobId,
    isProcessed,
    hasError,
    jobData
  };

  res.json(response);
});

module.exports = router;
