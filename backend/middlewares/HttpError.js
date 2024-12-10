class HttpError extends Error {
    constructor(message, statusCode, data=null, errorLog=null) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.errorLog = errorLog;
    }
}

module.exports = HttpError;