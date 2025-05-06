"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpError_1 = __importDefault(require("./HttpError"));
const zod_1 = require("zod");
const ErrorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.ZodError) {
        const httpError = HttpError_1.default.validation(err);
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
    const isHttpError = err instanceof HttpError_1.default;
    const statusCode = isHttpError ? err.statusCode : 500;
    const message = err.message || 'Error happened on server.';
    const errorLog = isHttpError && err.error ? err.error.errorLog : message;
    const response = {
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
exports.default = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map