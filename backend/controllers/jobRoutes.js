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
  const runLogFilePath = path.join(jobDir, 'run.log');

  let jobData = null;
  let runLogContent = null;

  if (fs.existsSync(infoFilePath)) { // check if info.json exists
    try {
        jobData = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8')); // parse info.json as JSON
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse info.json.' });
    }
  }

  if (fs.existsSync(runLogFilePath)) { // check if run.log exists
    try {
        runLogContent = fs.readFileSync(runLogFilePath, 'utf-8'); // parse run.log as plain text
    } catch (err) {
        return res.status(500).json({ error: 'Failed to parse run.log' });
    }
  }

  const response = {
    id: jobID,
    data: jobData,
    runLog: runLogContent
  };

  res.json(response);
});

module.exports = router;
