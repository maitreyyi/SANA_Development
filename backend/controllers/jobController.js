const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Handle job submission
const submitJob = (req, res) => {
  // Logic to process the job submission
  // Access files with req.files and other form data
  res.json({ message: 'Job submitted successfully' });
};

// helper function to validate query parameters for job lookup
function validateQueryParams(req, res, next) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Job ID is required as a query parameter.' });
  }
  next();
}


// Export controller functions
module.exports = {
  upload,
  submitJob,
  validateQueryParams
};
