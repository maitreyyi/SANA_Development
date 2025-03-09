// services/authService.ts
import db from '../config/database';
import { DbInsertUser, InsertUser, PublicUser, UserRecord, UserUpdateBody } from '../../types/types';
import { generateUniqueApiKey } from './apiKeyService';
import { User as SupabaseUser } from '@supabase/supabase-js';
import HttpError from '../middlewares/HttpError';
import asyncHandler from 'express-async-handler';

/**
 * Creates or updates a user profile in your database
 */
export const createOrUpdateUserProfile = async (userData: InsertUser): Promise<PublicUser> => {
    if (!userData.id || !userData.email) {
        throw HttpError.badRequest('User ID and email are required');
    }

    try {
        const existingUser = await getUserProfile(userData.id);
        // console.log('existingUser:', existingUser);//TESTING
        if (existingUser) {
            const updates: UserUpdateBody = {
                email: userData.email,
                first_name: userData.first_name ?? (existingUser.first_name || undefined),
                last_name: userData.last_name ?? (existingUser.last_name || undefined),
            };

            return await updateUserProfile(userData.id, updates);
        }

        const apiKey = await generateUniqueApiKey();

        return new Promise((resolve, reject) => {
            const insertValues = [
                userData.id,
                userData.email,
                userData.first_name || '',
                userData.last_name || '',
                apiKey,
            ];
            db.run(
                'INSERT INTO users (id, email, first_name, last_name, api_key) VALUES (?, ?, ?, ?, ?)',
                insertValues,
                function (err: Error | null) {
                    if (err) {
                        console.error('Database INSERT error:', err.message); //TESTING
                        // Handle specific SQLite errors
                        if (err.message.includes('UNIQUE constraint failed')) {
                            return reject(HttpError.internal('User already exists'));
                        }
                        return reject(HttpError.internal('Failed to create user'));
                    }

                    const newUser: UserRecord = {
                        id: userData.id,
                        email: userData.email,
                        first_name: userData.first_name || null,
                        last_name: userData.last_name || null,
                        api_key: apiKey,
                        created_at: new Date().toISOString()
                    };
                    resolve(toPublicUser(newUser));
                },
            );
        });
    } catch (error) {
        console.error('Error in createOrUpdateUserProfile:', error); //TESTING
        if (error instanceof HttpError) {
            throw error;
        }
        throw HttpError.internal('Failed to create or update user profile');
    }
};

/**
 * Updates a user profile in your database
 */
export const updateUserProfile = async (userId: string, updates: UserUpdateBody): Promise<PublicUser> => {
    return new Promise(async (resolve, reject) => {
        try {
            // First get the current user to return later
            const currentUser = await getUserProfile(userId);
            if (!currentUser) {
                return reject(new Error('User not found'));
            }

            // Build the SQL query dynamically
            const fields = Object.keys(updates).filter(
                (key) => updates[key as keyof typeof updates] !== undefined,
            );

            if (fields.length === 0) {
                // Nothing to update, return current user
                return resolve(toPublicUser(currentUser));
            }

            const setClause = fields.map((field) => `${field} = ?`).join(', ');
            const values = fields.map((field) => updates[field as keyof typeof updates]);
            values.push(userId); // Add the ID for the WHERE clause

            const sql = `UPDATE users SET ${setClause} WHERE id = ?`;

            db.run(sql, values, async function (err: Error | null) {
                if (err) {
                    return reject(err);
                }

                const updatedUser = await getUserProfile(userId);
                if (!updatedUser) {
                    return reject(new Error('Failed to retrieve updated user'));
                }

                resolve(updatedUser);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// // Strip sensitive data
// export const sanitizeUser = (user: UserRecord): PublicUser => {
//     const { id, email, first_name, last_name, api_key, created_at } = user;
//     return { id, email, first_name, last_name };
// };

/**
 * Get a user profile from the database by ID
 */
export const getUserProfile = async (userId: string): Promise<UserRecord | null> => {
    if (!userId) {
        throw HttpError.badRequest('User ID is required');
    }

    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                id,
                email,
                first_name,
                last_name,
                api_key,
                created_at
            FROM users 
            WHERE id = ?
        `;

        db.get<UserRecord>(
            query,
            [userId],
            (err: Error | null, row: UserRecord | undefined) => {
                if (err) {
                    return reject(HttpError.internal('Database error while fetching user'));
                }

                if (!row) {
                    return resolve(null);
                    // return reject(HttpError.notFound(`User not found`));
                }

                resolve(row);
            }
        );
    });
};

export const toPublicUser = (user: UserRecord): PublicUser => {
    const { id, email, first_name, last_name } = user;
    return { id, email, first_name, last_name };
};

export const userExists = async (userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        db.get(
            'SELECT 1 FROM users WHERE id = ? LIMIT 1',
            [userId],
            (err: Error | null, row: any) => {
                if (err || !row) {
                    resolve(false);
                }
                resolve(true);
            },
        );
    });
};
