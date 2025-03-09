import { ZodError } from 'zod';
import { ErrorDetails, UnifiedResponse } from '../../types/types';


interface HttpErrorOptions<T = undefined> {
    status?: number;
    data?: T;
    errorLog?: string;
    stackTrace?: string;
}


// class HttpError extends Error implements BaseResponse {
class HttpError<T = undefined, E = undefined> extends Error implements UnifiedResponse<T, E> {
    public readonly status: 'error';
    public readonly message: string;
    public readonly data?: T;
    public readonly error: ErrorDetails<E>;
    public readonly statusCode: number;
    // public readonly status: number;
    // public readonly data?: any;
    // public readonly error: ErrorDetails;

    // constructor(message: string, options: HttpErrorOptions = {}) {
    //     super(message);
    //     this.status = options.status ?? 500,
    //     this.data = options.data;
    //     this.error = {
    //         message: message,
    //         errorLog: options.errorLog,
    //     };
    // }
    constructor(message: string, options: HttpErrorOptions<E> = {}) {
        super(message);
        this.status = 'error';
        this.message = message;
        this.statusCode = options.status ?? 500;
        this.data = undefined;
        this.error = {
            message: message,
            errorLog: options.errorLog,
            stackTrace: options.stackTrace,
            data: options.data
        };
    }

    static badRequest(message: string, data?: any, errorLog?: string): HttpError {
        return new HttpError(message, { status: 400, data, errorLog });
    }

    static unauthorized(message: string, data?: any, errorLog?: string): HttpError {
        return new HttpError(message, { status: 401, data, errorLog });
    }

    static forbidden(message: string, data?: any, errorLog?: string): HttpError {
        return new HttpError(message, { status: 403, data, errorLog });
    }

    static notFound(message: string, data?: any, errorLog?: string): HttpError {
        return new HttpError(message, { status: 404, data, errorLog });
    }

    static internal(message: string, data?: any, errorLog?: string): HttpError {
        return new HttpError(message, { status: 500, data, errorLog });
    }

    static validation(zodError: ZodError): HttpError<undefined, { errors: { path: string; message: string }[] }> {
        return new HttpError('Validation failed', { 
            status: 400, 
            data: { 
                errors: zodError.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            },
            errorLog: zodError.message
        });
    }
}

export default HttpError;
