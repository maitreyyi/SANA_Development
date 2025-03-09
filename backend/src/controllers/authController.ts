import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import HttpError from '../middlewares/HttpError';
import {
    createOrUpdateUserProfile,
    getUserProfile,
    updateUserProfile,
} from '../services/authServices';
import { ApiKeyAuthResponse, InsertUser } from '../../types/types';

export const createUserRecord = asyncHandler(async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const userCheck: InsertUser = {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
        };
        if (!user.id || !user.email) {
            throw HttpError.badRequest('Missing user id or email');
        }
        const userProfile = await createOrUpdateUserProfile(userCheck);

        res.status(201).json({
            status: 'success',
            data: {
                user: userProfile,
            },
        });
    } catch (error) {
        console.error('Create user error:', error); 
        if (error instanceof HttpError) throw error;
        throw HttpError.internal(`Failed to create user record: ${error.message}`);
    }
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw HttpError.unauthorized('User not authenticated');
        }

        // Get user profile from your database
        const userProfile = await getUserProfile(req.user.id);

        if (!userProfile) {
            throw HttpError.notFound('User profile not found');
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: userProfile,
            },
        });
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw HttpError.internal('Failed to get user profile');
    }
});

export const getApiKey = asyncHandler(async (req: Request, res: Response<ApiKeyAuthResponse>) => {
    try {
        if (!req.user?.id) {
            throw HttpError.unauthorized('User not authenticated');
        }

        const userProfile = await getUserProfile(req.user.id);
        if(!userProfile){
            throw HttpError.internal('no user profile');
        }

        res.status(200).json({
            status: 'success',
            data: {
                api_key: userProfile.api_key,
            },
        });
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw HttpError.internal('Failed to get API key');
    }
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.supabase) {
            throw HttpError.unauthorized('User not authenticated');
        }

        const updates = req.body;

        // Update user metadata in Supabase
        const { error: supabaseError } = await req.supabase.auth.updateUser({
            data: {
                first_name: updates.first_name,
                last_name: updates.last_name,
            },
        });

        if (supabaseError) {
            throw HttpError.internal(supabaseError.message);
        }

        // Update user profile in your database
        const updatedProfile = await updateUserProfile(req.user.id, updates);

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedProfile,
            },
        });
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw HttpError.internal('Failed to update user profile');
    }
});
