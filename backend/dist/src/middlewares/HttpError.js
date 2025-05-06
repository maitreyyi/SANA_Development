"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// class HttpError extends Error implements BaseResponse {
class HttpError extends Error {
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
    constructor(message, options = {}) {
        var _a;
        super(message);
        this.status = 'error';
        this.message = message;
        this.statusCode = (_a = options.status) !== null && _a !== void 0 ? _a : 500;
        this.data = undefined;
        this.error = {
            message: message,
            errorLog: options.errorLog,
            stackTrace: options.stackTrace,
            data: options.data
        };
    }
    static badRequest(message, data, errorLog) {
        return new HttpError(message, { status: 400, data, errorLog });
    }
    static unauthorized(message, data, errorLog) {
        return new HttpError(message, { status: 401, data, errorLog });
    }
    static forbidden(message, data, errorLog) {
        return new HttpError(message, { status: 403, data, errorLog });
    }
    static notFound(message, data, errorLog) {
        return new HttpError(message, { status: 404, data, errorLog });
    }
    static internal(message, data, errorLog) {
        return new HttpError(message, { status: 500, data, errorLog });
    }
    static validation(zodError) {
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
exports.default = HttpError;
//# sourceMappingURL=HttpError.js.map