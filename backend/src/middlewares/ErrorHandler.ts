import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { Request, Response, NextFunction } from 'express';
import { UnifiedResponse } from '../../types/types';
import HttpError from './HttpError';

/**
 * Error handling middleware that captures any thrown errors.
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 * @returns {void}
 */
const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
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
          data: isHttpError && err.error ? err.error.data : undefined
      }
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