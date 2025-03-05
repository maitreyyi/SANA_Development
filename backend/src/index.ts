import path from 'path';
import dotenv from 'dotenv';
console.log('Looking for .env at:', path.resolve(__dirname, '../../.env'));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import bodyParser from 'body-parser';
import ErrorHandler from './middlewares/ErrorHandler';
import cors from 'cors';
import session from 'express-session';
import passport from './services/auth'; // You'll need to create this file
import authRoutes from './routes/authRoutes'; // You'll need to create this file
import jobRoutes from './routes/jobRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// cors and bodyparser middleware
if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: '*',
        }),
    );

    // Root route handler
    app.get('/', (req, res) => {
        console.log('test');
        res.send('hello!');
    });
}
app.use(bodyParser.json());

// Session management for Google OAuth
app.use(session({
    secret: 'your_secret_key', // CHANGE THIS
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// api routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// error handling middleware after routes
app.use(ErrorHandler);

// serve static files and fallback to index.html for client-side routing
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
