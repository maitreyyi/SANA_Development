const fs = require("fs");
const HttpError = require("../middlewares/HttpError");
const path = require("path");

const sanitize = async (requestOption, requestSanaVersion) => {
    const options = JSON.parse(requestOption);

    const getConfigPath = (sanaVersion) => {
        const validVersions = new Set(["SANA1", "SANA1_1", "SANA2"]);
        if (validVersions.has(sanaVersion)) {
            return path.join(__dirname, "../config", `${sanaVersion}.json`);
        } else {
            throw new HttpError("Invalid sana version specified in request");
        }
    };
    const configPath = getConfigPath(requestSanaVersion);

    if (!fs.existsSync(configPath)) {
        throw new HttpError("Config file not found.", 404);
    }

    const defaultOptionsInfo = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const defaultOptionsArray = [
        ...defaultOptionsInfo.standard,
        ...defaultOptionsInfo.advanced,
    ];

    const sanitizedOptions = {};

    defaultOptionsArray.forEach(([key, type, defaultValue]) => {
        if (!options[key]) {
            sanitizedOptions[key] = type !== "checkbox" ? defaultValue : 0;
        } else {
            sanitizedOptions[key] = options[key];
        }
    });

    for (const [key, value] of Object.entries(sanitizedOptions)) {
        if (isNaN(value)) {
            throw new HttpError(
                "One or more of the selected options was invalid. Please try again.",
                400
            );
        }

        if (key === "t") {
            if (value < 1 || value > 20) {
                throw new HttpError(
                    "Running time must be an integer between 1 and 20, inclusive. Please try again.",
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
