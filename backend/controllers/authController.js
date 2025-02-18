const apiKeyService = require('../services/apiKeyService');
const HttpError = require('../middlewares/HttpError');

const register = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new HttpError('Email is required', 400);
    }

    const user = await apiKeyService.createUser(email);
    
    res.json({
      success: true,
      message: 'Registration successful',
      apiKey: user.apiKey
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register }; 