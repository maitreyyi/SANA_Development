import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as apiKeyService from '../services/apiKeyService';
import HttpError from '../middlewares/HttpError';
import { LoginRequestBody, RegisterRequestBody } from '../../types/types';


// Manual Registration (Email & Password)
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password } = req.body as RegisterRequestBody;

    const userExists = await apiKeyService.userExists(email);
    if (userExists) {
      res.status(400).json({ message: "User already exists." });
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await apiKeyService.createUser(null, email, first_name, last_name, hashedPassword); // No Google ID, manual user

    res.status(201).json({ message: "User registered successfully.", apiKey: user.apiKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequestBody;
    const loggedIn = await apiKeyService.userLogin(email, password);

    if (loggedIn) {
      res.status(200).json({message: "User is logged in.", success: true});
    } else {
      res.status(400).json({message: "User does not exist"});
    }
    
  } catch(error) {
    console.error(error);
    res.status(500).json({message: "Server error"});
  }
};

export default { login, register };