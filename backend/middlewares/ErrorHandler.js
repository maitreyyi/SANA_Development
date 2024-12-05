const ErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = {
        message: err.message,
    };
    if (process.env.NODE_ENV === 'development') {
        response.files = req.files;
        response.body = req.body;
        console.error('backend error caugh:', response);
    }

    res.status(statusCode).json(response);
};

module.exports = ErrorHandler;
