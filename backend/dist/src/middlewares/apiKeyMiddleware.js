"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiKeyService_1 = require("../services/apiKeyService");
const HttpError_1 = __importDefault(require("./HttpError"));
const MAX_CONCURRENT_JOBS = 3; // Configure as needed
// Define user interface
/*
  Validates that each request has a proper API key,
  and that the user satisfies the job limit.
*/
const apiKeyMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            throw new HttpError_1.default('API key is required', { status: 401 });
        }
        // Validate API key
        const user = await (0, apiKeyService_1.validateApiKey)(apiKey);
        if (!user) {
            throw new HttpError_1.default('Invalid API key', { status: 401 });
        }
        // Check concurrent job limit
        const currentJobCount = await (0, apiKeyService_1.getCurrentJobCount)(user.id);
        if (currentJobCount >= MAX_CONCURRENT_JOBS) {
            throw new HttpError_1.default('Maximum concurrent job limit reached', { status: 429 });
        }
        // Attach user to request for use in controllers
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = apiKeyMiddleware;
//# sourceMappingURL=apiKeyMiddleware.js.map