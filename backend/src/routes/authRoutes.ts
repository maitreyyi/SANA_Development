import express, { Request, Response, NextFunction } from 'express';
import passport from '../services/auth';
import authController from '../controllers/authController';

const router = express.Router();

// Route to start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
    (req: Request, res: Response) => {
        // Successful login - Redirect to frontend
        res.redirect('http://localhost:3000/dashboard');
    },
);

// Logout Route
router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: Error) => {
        if (err) return next(err); // was'faDiagramNext'
        res.redirect('/');
    });
});

// Register route
router.post('/register', authController.register);

// Authentication middleware
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Login route
router.post('/login', authController.login);

// Profile route
router.get('/profile', ensureAuthenticated, (req: Request, res: Response) => {
    res.json({ user: req.user });
});

export default router;
