import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validateApiKey, getCurrentJobCount } from '../services/apiKeyService';
import HttpError from './HttpError';
import { AuthenticatedRequest } from '../../types/types';
const MAX_CONCURRENT_JOBS = 3; // Configure as needed

// Define user interface

/*
  Validates that each request has a proper API key, 
  and that the user satisfies the job limit.
*/
const apiKeyMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            throw new HttpError('API key is required', { status: 401 });
        }

        // Validate API key
        const user = await validateApiKey(apiKey);
        if (!user) {
            throw new HttpError('Invalid API key', { status: 401 });
        }

        // Check concurrent job limit
        const currentJobCount = await getCurrentJobCount(user.id);
        if (currentJobCount >= MAX_CONCURRENT_JOBS) {
            throw new HttpError('Maximum concurrent job limit reached', { status: 429 });
        }

        // Attach user to request for use in controllers
        (req as AuthenticatedRequest).user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export default apiKeyMiddleware;
