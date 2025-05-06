"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExists = exports.toPublicUser = exports.getUserProfile = exports.updateUserProfile = exports.createOrUpdateUserProfile = void 0;
// services/authService.ts
const database_1 = __importDefault(require("../config/database"));
const apiKeyService_1 = require("./apiKeyService");
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
/**
 * Creates or updates a user profile in your database
 */
const createOrUpdateUserProfile = async (userData) => {
    var _a, _b;
    if (!userData.id || !userData.email) {
        throw HttpError_1.default.badRequest('User ID and email are required');
    }
    try {
        const existingUser = await (0, exports.getUserProfile)(userData.id);
        // console.log('existingUser:', existingUser);//TESTING
        if (existingUser) {
            const updates = {
                email: userData.email,
                first_name: (_a = userData.first_name) !== null && _a !== void 0 ? _a : (existingUser.first_name || undefined),
                last_name: (_b = userData.last_name) !== null && _b !== void 0 ? _b : (existingUser.last_name || undefined),
            };
            return await (0, exports.updateUserProfile)(userData.id, updates);
        }
        const apiKey = await (0, apiKeyService_1.generateUniqueApiKey)();
        return new Promise((resolve, reject) => {
            const insertValues = [
                userData.id,
                userData.email,
                userData.first_name || '',
                userData.last_name || '',
                apiKey,
            ];
            database_1.default.run('INSERT INTO users (id, email, first_name, last_name, api_key) VALUES (?, ?, ?, ?, ?)', insertValues, function (err) {
                if (err) {
                    console.error('Database INSERT error:', err.message); //TESTING
                    // Handle specific SQLite errors
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return reject(HttpError_1.default.internal('User already exists'));
                    }
                    return reject(HttpError_1.default.internal('Failed to create user'));
                }
                const newUser = {
                    id: userData.id,
                    email: userData.email,
                    first_name: userData.first_name || null,
                    last_name: userData.last_name || null,
                    api_key: apiKey,
                    created_at: new Date().toISOString()
                };
                resolve((0, exports.toPublicUser)(newUser));
            });
        });
    }
    catch (error) {
        console.error('Error in createOrUpdateUserProfile:', error); //TESTING
        if (error instanceof HttpError_1.default) {
            throw error;
        }
        throw HttpError_1.default.internal('Failed to create or update user profile');
    }
};
exports.createOrUpdateUserProfile = createOrUpdateUserProfile;
/**
 * Updates a user profile in your database
 */
const updateUserProfile = async (userId, updates) => {
    return new Promise(async (resolve, reject) => {
        try {
            // First get the current user to return later
            const currentUser = await (0, exports.getUserProfile)(userId);
            if (!currentUser) {
                return reject(new Error('User not found'));
            }
            // Build the SQL query dynamically
            const fields = Object.keys(updates).filter((key) => updates[key] !== undefined);
            if (fields.length === 0) {
                // Nothing to update, return current user
                return resolve((0, exports.toPublicUser)(currentUser));
            }
            const setClause = fields.map((field) => `${field} = ?`).join(', ');
            const values = fields.map((field) => updates[field]);
            values.push(userId); // Add the ID for the WHERE clause
            const sql = `UPDATE users SET ${setClause} WHERE id = ?`;
            database_1.default.run(sql, values, async function (err) {
                if (err) {
                    return reject(err);
                }
                const updatedUser = await (0, exports.getUserProfile)(userId);
                if (!updatedUser) {
                    return reject(new Error('Failed to retrieve updated user'));
                }
                resolve(updatedUser);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.updateUserProfile = updateUserProfile;
// // Strip sensitive data
// export const sanitizeUser = (user: UserRecord): PublicUser => {
//     const { id, email, first_name, last_name, api_key, created_at } = user;
//     return { id, email, first_name, last_name };
// };
/**
 * Get a user profile from the database by ID
 */
const getUserProfile = async (userId) => {
    if (!userId) {
        throw HttpError_1.default.badRequest('User ID is required');
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
        database_1.default.get(query, [userId], (err, row) => {
            if (err) {
                return reject(HttpError_1.default.internal('Database error while fetching user'));
            }
            if (!row) {
                return resolve(null);
                // return reject(HttpError.notFound(`User not found`));
            }
            resolve(row);
        });
    });
};
exports.getUserProfile = getUserProfile;
const toPublicUser = (user) => {
    const { id, email, first_name, last_name } = user;
    return { id, email, first_name, last_name };
};
exports.toPublicUser = toPublicUser;
const userExists = async (userId) => {
    return new Promise((resolve) => {
        database_1.default.get('SELECT 1 FROM users WHERE id = ? LIMIT 1', [userId], (err, row) => {
            if (err || !row) {
                resolve(false);
            }
            resolve(true);
        });
    });
};
exports.userExists = userExists;
//# sourceMappingURL=authServices.js.map