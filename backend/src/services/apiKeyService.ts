/*
  Helper functions to manage users and API keys in sqlite database.
*/

import crypto from 'crypto';
import db from '../config/database';
import bcrypt from 'bcrypt';
import { LoginResult, User } from '../../types/types';


const generateApiKey = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

const checkApiKeyExists = async (apiKey: string): Promise<boolean> => {
    const row = await db.get('SELECT 1 FROM users WHERE api_key = ? LIMIT 1', [apiKey]);
    return row !== undefined;
};

const userLogin = async (email: string, password: string): Promise<LoginResult> => {
    try {
        // Check if user exists
        const exists = await userExists(email);
        if (!exists) {
            console.log('Login failed: User not found');
            return { success: false, message: 'User not found.' };
        }
        console.log('Login: User found');

        // Fetch the user's hashed password from the database
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err: Error, user: User) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject({ success: false, message: 'Database error.' });
                }

                if (!user) {
                    return resolve({ success: false, message: 'User not found.' });
                }

                // If user has a Google ID, no password verification is needed
                if (user.google_id) {
                    console.log('Google user authenticated.');
                    return resolve({ success: true, message: 'Google user authenticated.', user });
                }
                console.log('Checked isMatch: ', user);

                // Verify password for manual users
                const isMatch = await bcrypt.compare(password, user.password || '');

                if (!isMatch) {
                    console.log('Login failed: Incorrect password');
                    return resolve({ success: false, message: 'Invalid credentials.' });
                }

                console.log('Login successful.');
                return resolve({ success: true });
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Internal server error.' };
    }
};

const userExists = async (email: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT email FROM users WHERE email = ? LIMIT 1', [email], (err: Error | null, row: any) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else if (row === undefined) {
                console.log('No row found with email: ', email);
                return resolve(false);
            } else {
                console.log('Row found:', row);
                return resolve(true);
            }
        });
    });
};

// console.log("row type:", typeof row);
// console.log("row properties:", Object.getOwnPropertyNames(row));
// console.log("row stringified:", JSON.stringify(row));
// console.log("row full inspection:", require('util').inspect(row, {depth: null, showHidden: true}));
// return row !== undefined;
// console.log('row: ', row);
// return JSON.stringify(row) != "{}";
// };

const generateUniqueApiKey = async (): Promise<string> => {
    let apiKey: string;
    let exists: boolean;

    do {
        // if generated API key is not unique, keep generating until it is
        apiKey = generateApiKey();
        exists = await checkApiKeyExists(apiKey);
    } while (exists);

    return apiKey;
};

interface UserCreateResult {
    id: number;
    email: string;
    apiKey: string;
}

const createUser = async (
    googleID: string | null,
    email: string,
    first_name: string | null,
    last_name: string | null,
    password: string | null,
): Promise<UserCreateResult> => {
    const apiKey = await generateUniqueApiKey();
    // console.log('Attempting to insert with values:', {
    //     googleID,
    //     email,
    //     apiKey,
    //     types: {
    //         googleID: typeof googleID,
    //         email: typeof email,
    //         apiKey: typeof apiKey
    //     },
    //     lengths: {
    //         googleID: googleID.length,
    //         email: email.length,
    //         apiKey: apiKey.length
    //     }
    // });

    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO users (google_id, email, first_name, last_name, password, api_key) VALUES (?, ?, ?, ?, ?, ?)',
            [googleID || null, email, first_name || null, last_name || null, password || null, apiKey],
            function (this: { lastID: number }, err: Error | null) {
                if (err) {
                    console.error('Database error:', err.message);
                    reject(err);
                    return;
                }
                resolve({ id: this.lastID, email, apiKey });
            },
        );
    });
};

// const createUser = async (googleID, email) => {
//     const apiKey = await generateUniqueApiKey();
//     console.log(typeof(apiKey));
//     console.log(typeof(googleID));
//     console.log(typeof(email));
//     // INSERT INTO users (id, email, api_key) VALUES ('google_id', 'user@example.com', 'api_key_value');

//     return new Promise((resolve, reject) => {
//       db.run(
//         'INSERT INTO users (id, email, api_key) VALUES (?, ?, ?)',
//         [googleID, email, apiKey],
//         function(err) {
//           if (err) reject(err);
//           resolve({ id: this.lastID, email, apiKey });
//         }
//       );
//     });
// };
const validateApiKey = async (apiKey: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE api_key = ?', [apiKey], (err: Error | null, row: User) => {
            if (err) reject(err);
            if (!row) {
                reject(new Error('Invalid API key'));
            }
            resolve(row);
        });
    });
};

const getCurrentJobCount = async (userId: number): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) as count FROM jobs WHERE user_id = ? AND status = "active"',
            [userId],
            (err: Error | null, row: { count: number } | undefined) => {
                if (err) reject(err);
                resolve(row ? row.count : 0);
            },
        );
    });
};

export { generateApiKey, generateUniqueApiKey, createUser, validateApiKey, getCurrentJobCount, userExists, userLogin };
