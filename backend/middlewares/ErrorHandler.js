/**
 * Error response object.
 * @typedef {Object} ErrorResponse
 * @property {string} message - The error message.
 * @property {string} message - The error message.
 * @property {any} data - The data.
 * @property {boolean} error - boolean signaling error.
 */

/**
 * Error handling middleware.
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {ErrorResponse} res - The response object.
 * @returns {void}
 */
const ErrorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Error happened on server.";
    const errorLog = err.errorLog || message;
    // const errors = err.error;
    /** @type {ErrorResponse} */
    const response = {
        message,
        error: true,
        errorLog
    };
    if (process.env.NODE_ENV === 'development') {
        response.data = err.data;
        console.log('Error response:', JSON.stringify(response, null, 2)); // Pretty print the response object
        response.stackTrace = err.stack;
        // console.error(`Error stack trace: ${err.stack}`); // Log the error stack trace
    }
    res.status(status).json(response);
};

module.exports = ErrorHandler;
