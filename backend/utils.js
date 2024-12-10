/**
 * Sends a JSON response with the specified structure and clears the session cookie.
 *
 * @param {import('express').Response} res - The Express response object.
 * @param {boolean} success - Indicates whether the operation was successful.
 * @param {string} status - A message describing the status of the operation.
 * @param {Object} [data={}] - Additional data to include in the response.
 * @param {Object} [data.data] - The data object containing key-value pairs.
 */
const returnProcessingState = (res, success, status, data = {}) => {
    // res.clearCookie('connect.sid'); // clear cookie, maybe
    res.json({
        success: success,
        status: status,
        data: data
    });
};

module.exports = returnProcessingState;