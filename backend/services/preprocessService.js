const fs = require('fs');
const HttpError = require('../middlewares/HttpError');
const path = require('path');

const sanitize = async (requestOption) => {
    const options = JSON.parse(requestOption);
    const configPath = path.join(__dirname, '../utils/config.json');

    if (!fs.existsSync(configPath)) {
        throw new HttpError('Config file not found.', 404);
    }

    const defaultOptionsInfo = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const defaultOptionsArray = [...defaultOptionsInfo.standard, ...defaultOptionsInfo.advanced];

    const sanitizedOptions = {};

    defaultOptionsArray.forEach(([key, type, defaultValue]) => {
        if (!options[key]) {
            sanitizedOptions[key] = type !== 'checkbox' ? defaultValue : 0;
        } else {
            sanitizedOptions[key] = options[key];
        }
    });

    for (const [key, value] of Object.entries(sanitizedOptions)) {
        if (isNaN(value)) {
            throw new HttpError(
                'One or more of the selected options was invalid. Please try again.',
                400
            );
        }

        if (key === 't') {
            if (value < 1 || value > 60) {
                throw new HttpError(
                    'Running time must be an integer between 1 and 60, inclusive. Please try again.',
                    400
                );
            }
        }
    }

    return sanitizedOptions;
};


module.exports = {
    sanitize,
};