import 'dotenv-safe/config';
import '../types/types';
import path from 'path';
import express from 'express';
import ErrorHandler from './middlewares/ErrorHandler';
import cors from 'cors';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import { authenticatedRateLimit, publicRateLimit } from './middlewares/rateLimiter';


const app = express();
const PORT = process.env.PORT || 4000;

// cors and bodyparser middleware
if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: '*',
            allowedHeaders: ['Origin', 'Content-Type', 'Authorization']
        }),
    );

    // Root route handler
    app.get('/', (req, res) => {
        console.log('test');
        res.send('hello!');
    });
    app.use(logger('dev'));
}
app.use(express.json());
app.use(cookieParser());

// Public API routes with basic rate limiting
// app.use('/api/public', publicRateLimit, publicRoutes);

// Protected routes with higher rate limits
// app.use('/api/protected', requireAuth, authenticatedRateLimit, protectedRoutes);

// api routes
// app.use('/api/auth', publicRateLimit, authRoutes);
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
