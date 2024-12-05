const express = require('express');
const bodyParser = require('body-parser');
const jobRoutes = require('./routes/jobRoutes');
// const contactRoutes = require('./routes/contactRoutes');
// const validateRoutes = require('./routes/validateRoutes');
// deps for validate-files
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');


const app = express();
const PORT = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use('/api/jobs', jobRoutes);
// app.use('/api/contact', contactRoutes);

// app.use('/api', validateRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
