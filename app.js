const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// A simple route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

