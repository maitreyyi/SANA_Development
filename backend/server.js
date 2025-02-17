const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const bodyParser = require('body-parser');
const ErrorHandler = require("./middlewares/ErrorHandler");
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// cors and bodyparser middleware
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}
app.use(bodyParser.json());

//session management for google OAuth
app.use(session({
  secret: 'your_secret_key', // CHANGE THIS
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// api routes
app.use('/api/jobs', jobRoutes);

// error handling middleware after routes
app.use(ErrorHandler);
app.use('/auth', authRoutes); //google auth route

// serve static files and fallback to index.html for client-side routing
if (process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '../build')));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
