// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';

// Lower limits for unauthenticated users
export const publicRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
});

// Higher limits for authenticated users
export const authenticatedRateLimit = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.supabase) {
        return next(publicRateLimit);
    }

    const {
        data: { session },
    } = await req.supabase.auth.getSession();

    if (session) {
        // Apply a higher rate limit for authenticated users
        return rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 300, // 300 requests per windowMs for authenticated users
            message: 'Too many requests, please try again later',
        })(req, res, next);
    }

    // Fall back to public rate limit
    return publicRateLimit(req, res, next);
});
