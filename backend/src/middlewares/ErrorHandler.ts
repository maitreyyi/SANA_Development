import { Request, Response, NextFunction } from 'express';
import { UnifiedResponse } from '../../types/types';
import HttpError from './HttpError';
import { ZodError } from 'zod';

const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof ZodError) {
        const httpError = HttpError.validation(err);

        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            data: undefined,
            error: {
                message: 'Validation failed',
                errorLog: err.message,
                data: httpError.error.data,
            },
        });
        return;
    }

    const isHttpError = err instanceof HttpError;
    const statusCode = isHttpError ? err.statusCode : 500;
    const message = err.message || 'Error happened on server.';
    const errorLog = isHttpError && err.error ? err.error.errorLog : message;

    const response: UnifiedResponse = {
        status: 'error',
        message,
        data: undefined,
        error: {
            message,
            errorLog,
            stackTrace: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            data: isHttpError && err.error ? err.error.data : undefined,
        },
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('Error response:', JSON.stringify(response, null, 2));
        if (!isHttpError) {
            console.warn('Non-HttpError was thrown:', err);
        }
    }

    res.status(statusCode).json(response);
};

export default ErrorHandler;
