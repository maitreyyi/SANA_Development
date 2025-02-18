const apiKeyService = require('../services/apiKeyService');
const HttpError = require('./HttpError');

const MAX_CONCURRENT_JOBS = 3; // Configure as needed

/*
  Validates that each request has a proper API key, 
  and that the user satisfies the job limit.
*/
const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new HttpError('API key is required', 401);
    }

    // Validate API key
    const user = await apiKeyService.validateApiKey(apiKey);
    if (!user) {
      throw new HttpError('Invalid API key', 401);
    }

    // Check concurrent job limit
    const currentJobCount = await apiKeyService.getCurrentJobCount(user.id);
    if (currentJobCount >= MAX_CONCURRENT_JOBS) {
      throw new HttpError('Maximum concurrent job limit reached', 429);
    }

    // Attach user to request for use in controllers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = apiKeyMiddleware; 