const crypto = require('crypto');
const db = require('../config/database');

const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const generateUniqueApiKey = async () => {
  let apiKey;
  let exists;
  
  do { // generate a unique api key until it doesn't exist in the database
    apiKey = generateApiKey();
    exists = await validateApiKey(apiKey); // exists is true if the api key already exists in the database, and null if it doesn't
  } while (exists);
  
  return apiKey;
};

const createUser = async (email) => {
    const apiKey = await generateUniqueApiKey();
    
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