import crypto from 'crypto';
import db from '../config/database';
import { UserRecord, JobStatus, JobData } from '../../types/types';
import HttpError from '../middlewares/HttpError';

/**
 * API Key Management
 */
const generateApiKey = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

const checkApiKeyExists = async (apiKey: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT 1 FROM users WHERE api_key = ? LIMIT 1',
            [apiKey],
            (err: Error | null, row: any) => {
                if (err) {
                    console.error('Error checking API key:', err);
                    reject(err);
                }
                resolve(row !== undefined);
            },
        );
    });
};

const generateUniqueApiKey = async (): Promise<string> => {
    let apiKey: string;
    let exists: boolean;
    let attempts = 0;
    const maxAttempts = 5;

    do {
        apiKey = generateApiKey();
        // console.log('Generated new API key attempt:', attempts + 1);
        try {
            exists = await checkApiKeyExists(apiKey);
            // console.log('API key exists?:', exists);
        } catch (error) {
            console.error('Error checking API key:', error);
            throw HttpError.internal('Failed to generate unique API key');
        }
        attempts++;

        if (attempts >= maxAttempts && exists) {
            throw HttpError.internal('Failed to generate unique API key after maximum attempts');
        }
    } while (exists);

    console.log('Successfully generated unique API key');
    return apiKey;
};

const getUserByApiKey = async (apiKey: string): Promise<UserRecord | null> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE api_key = ?', [apiKey], (err: Error | null, row: any) => {
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
            resolve(row as UserRecord);
        });
    });
};

/**
 * Job Management
 */
const createJob = async (userId: string, jobId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO jobs (id, user_id, status) VALUES (?, ?, "preprocessing")',
            [jobId, userId],
            (err: Error | null) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
};

const updateJobStatus = async (
    jobId: string,
    status: JobStatus,
    result?: any,
    error?: string,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        let serializedResult: string | null = null;
        if (result) {
            try {
                serializedResult = JSON.stringify(result);
            } catch (e) {
                console.error('Failed to serialize job result:', e);
                return reject(new Error('Invalid job result data'));
            }
        }

        db.run(
            'UPDATE jobs SET status = ?, result = ?, error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, serializedResult, error, jobId],
            (err: Error | null) => {
                if (err) {
                    console.error('Error updating job status:', err);
                    return reject(err);
                }
                resolve();
            },
        );
    });
};

const getJobStatus = async (jobId: string): Promise<JobData | null> => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err: Error | null, row: JobData) => {
            if (err) return reject(err);
            if (!row) return resolve(null);

            // Parse result if exists
            if (row.result) {
                try {
                    row.result = JSON.parse(row.result);
                } catch (e) {
                    console.warn(`Failed to parse job result for job ${jobId}`);
                }
            }

            resolve(row);
        });
    });
};

const getUserJobs = async (userId: string): Promise<JobData[]> => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC',
            [userId],
            (err: Error | null, rows: JobData[]) => {
                if (err) return reject(err);

                // Parse results if they exist
                rows.forEach((row) => {
                    if (row.result) {
                        try {
                            row.result = JSON.parse(row.result);
                        } catch (e) {
                            console.warn(`Failed to parse job result for job ${row.id}`);
                        }
                    }
                });

                resolve(rows);
            },
        );
    });
};

const getCurrentJobCount = async (userId: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) as count FROM jobs WHERE user_id = ? AND status IN ("preprocessing", "processing")',
            [userId],
            (err: Error | null, row: { count: number } | undefined) => {
                if (err) {
                    console.error('Error getting job count:', err);
                    return reject(err);
                }
                resolve(row?.count ?? 0);
            },
        );
    });
};

export {
    // API Key functions
    generateApiKey,
    generateUniqueApiKey,
    getUserByApiKey,
    // Job management functions
    createJob,
    updateJobStatus,
    getJobStatus,
    getUserJobs,
    getCurrentJobCount,
};
