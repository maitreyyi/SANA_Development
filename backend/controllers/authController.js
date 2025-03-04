const apiKeyService = require('../services/apiKeyService');
const HttpError = require('../middlewares/HttpError');
const bcrypt = require("bcrypt");

// Manual Registration (Email & Password)
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name} = req.body;

    const userExists = await apiKeyService.userExists(email);
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await apiKeyService.createUser(null, email, hashedPassword, first_name, last_name); // No Google ID, manual user

    res.status(201).json({ message: "User registered successfully.", apiKey: user.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password} = req.body;
    const loggedIn = await apiKeyService.userLogin(email, password);

    if (loggedIn) {
      return res.status(200).json({message: "User is logged in.", success: true});
    } else {
      return res.status(400).json({message: "User does not exist"})
    }
    
  } catch(error){
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

module.exports = { login, register}

