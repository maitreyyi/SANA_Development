const apiKeyService = require('../services/apiKeyService');
const HttpError = require('../middlewares/HttpError');

const register = async (req, res, next) => {
  // oauth middleware runs first 
  // if successful, oauth will give us the unique google ID of the user, as well as their email which we will store in the DB
  // first need to check if the user already exists in the DB

  try {
    const { googleID, email } = req.body;

    if (!email) {
      res.status(400).send("Email is required");
      // throw new HttpError('Email is required', 400);
    }
    const userExists = await apiKeyService.userExists(email);
    console.log('user exists: ', userExists);
    if (userExists) {
      res.status(400).send("User already exists");
    }
    const user = await apiKeyService.createUser(googleID, email);
    
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