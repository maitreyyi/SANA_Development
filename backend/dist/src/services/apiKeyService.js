"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentJobCount = exports.getUserJobs = exports.getJobStatus = exports.updateJobStatus = exports.createJob = exports.getUserByApiKey = exports.generateUniqueApiKey = exports.generateApiKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
const HttpError_1 = __importDefault(require("../middlewares/HttpError"));
/**
 * API Key Management
 */
const generateApiKey = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateApiKey = generateApiKey;
const checkApiKeyExists = async (apiKey) => {
    return new Promise((resolve, reject) => {
        database_1.default.get('SELECT 1 FROM users WHERE api_key = ? LIMIT 1', [apiKey], (err, row) => {
            if (err) {
                console.error('Error checking API key:', err);
                reject(err);
            }
            resolve(row !== undefined);
        });
    });
};
const generateUniqueApiKey = async () => {
    let apiKey;
    let exists;
    let attempts = 0;
    const maxAttempts = 5;
    do {
        apiKey = generateApiKey();
        // console.log('Generated new API key attempt:', attempts + 1);
        try {
            exists = await checkApiKeyExists(apiKey);
            // console.log('API key exists?:', exists);
        }
        catch (error) {
            console.error('Error checking API key:', error);
            throw HttpError_1.default.internal('Failed to generate unique API key');
        }
        attempts++;
        if (attempts >= maxAttempts && exists) {
            throw HttpError_1.default.internal('Failed to generate unique API key after maximum attempts');
        }
    } while (exists);
    console.log('Successfully generated unique API key');
    return apiKey;
};
exports.generateUniqueApiKey = generateUniqueApiKey;
const getUserByApiKey = async (apiKey) => {
    return new Promise((resolve, reject) => {
        database_1.default.get('SELECT * FROM users WHERE api_key = ?', [apiKey], (err, row) => {
            if (err) {
                console.error('Error fetching user by API key:', err);
                return reject(err);
            }
            if (!row) {
                return resolve(null);
            }
            // Ensure all required User fields are present
            if (!row.id || !row.email || !row.api_key) {
                console.error('Invalid user data in database:', row);
                return reject(new Error('Invalid user data'));
            }
            resolve(row);
        });
    });
};
exports.getUserByApiKey = getUserByApiKey;
/**
 * Job Management
 */
const createJob = async (userId, jobId) => {
    return new Promise((resolve, reject) => {
        database_1.default.run('INSERT INTO jobs (id, user_id, status) VALUES (?, ?, "preprocessing")', [jobId, userId], (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.createJob = createJob;
const updateJobStatus = async (jobId, status, result, error) => {
    return new Promise((resolve, reject) => {
        let serializedResult = null;
        if (result) {
            try {
                serializedResult = JSON.stringify(result);
            }
            catch (e) {
                console.error('Failed to serialize job result:', e);
                return reject(new Error('Invalid job result data'));
            }
        }
        database_1.default.run('UPDATE jobs SET status = ?, result = ?, error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, serializedResult, error, jobId], (err) => {
            if (err) {
                console.error('Error updating job status:', err);
                return reject(err);
            }
            resolve();
        });
    });
};
exports.updateJobStatus = updateJobStatus;
const getJobStatus = async (jobId) => {
    return new Promise((resolve, reject) => {
        database_1.default.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err, row) => {
            if (err)
                return reject(err);
            if (!row)
                return resolve(null);
            // Parse result if exists
            if (row.result) {
                try {
                    row.result = JSON.parse(row.result);
                }
                catch (e) {
                    console.warn(`Failed to parse job result for job ${jobId}`);
                }
            }
            resolve(row);
        });
    });
};
exports.getJobStatus = getJobStatus;
const getUserJobs = async (userId) => {
    return new Promise((resolve, reject) => {
        database_1.default.all('SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
            if (err)
                return reject(err);
            // Parse results if they exist
            rows.forEach((row) => {
                if (row.result) {
                    try {
                        row.result = JSON.parse(row.result);
                    }
                    catch (e) {
                        console.warn(`Failed to parse job result for job ${row.id}`);
                    }
                }
            });
            resolve(rows);
        });
    });
};
exports.getUserJobs = getUserJobs;
const getCurrentJobCount = async (userId) => {
    return new Promise((resolve, reject) => {
        database_1.default.get('SELECT COUNT(*) as count FROM jobs WHERE user_id = ? AND status IN ("preprocessing", "processing")', [userId], (err, row) => {
            var _a;
            if (err) {
                console.error('Error getting job count:', err);
                return reject(err);
            }
            resolve((_a = row === null || row === void 0 ? void 0 : row.count) !== null && _a !== void 0 ? _a : 0);
        });
    });
};
exports.getCurrentJobCount = getCurrentJobCount;
//# sourceMappingURL=apiKeyService.js.map