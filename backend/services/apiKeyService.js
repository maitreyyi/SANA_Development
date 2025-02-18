/*
  Helper functions to manage users and API keys in sqlite database.
*/

const crypto = require('crypto');
const db = require('../config/database');

const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const checkApiKeyExists = async (apiKey) => {
  const row = await db.get('SELECT 1 FROM users WHERE api_key = ? LIMIT 1', [apiKey]);
  return row !== undefined;
};

const generateUniqueApiKey = async () => {
  let apiKey;
  let exists;
  
  do { // if generated API key is not unique, keep generating until it is
    apiKey = generateApiKey();
    exists = await checkApiKeyExists(apiKey);
  } while (exists);
  
  return apiKey;
};

const createUser = async (email) => {
    const apiKey = await generateUniqueApiKey();
    console.log(apiKey);
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, api_key) VALUES (?, ?)',
        [email, apiKey],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, email, apiKey });
        }
      );
    });
};

const validateApiKey = async (apiKey) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE api_key = ?',
        [apiKey],
        (err, row) => {
          if (err) reject(err);
          if (!row) {
            reject(new Error('Invalid API key'));
          }
          resolve(row);
        }
      );
    });
};

const getCurrentJobCount = async (userId) => {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM jobs WHERE user_id = ? AND status = "active"',
        [userId],
        (err, row) => {
          if (err) reject(err);
          resolve(row ? row.count : 0);
        }
      );
    });
};

module.exports = {
    generateApiKey,
    generateUniqueApiKey,
    createUser,
    validateApiKey,
    getCurrentJobCount,
}; 