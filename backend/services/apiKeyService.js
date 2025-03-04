/*
  Helper functions to manage users and API keys in sqlite database.
*/

const crypto = require('crypto');
const db = require('../config/database');
const { use } = require('passport');
const bcrypt = require('bcrypt');

const generateApiKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

const checkApiKeyExists = async (apiKey) => {
  const row = await db.get('SELECT 1 FROM users WHERE api_key = ? LIMIT 1', [apiKey]);
  return JSON.stringify(row) != "{}";
  return row !== undefined;
};

const userLogin = async (email, password) => {
  try {
      // Check if user exists
      const exists = await userExists(email);
      if (!exists) {
          console.log("Login failed: User not found");
          return { success: false, message: "User not found." };
      }

      // Fetch the user's hashed password from the database
      return new Promise((resolve, reject) => {
          db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
              if (err) {
                  console.error("Database error:", err);
                  return reject({ success: false, message: "Database error." });
              }

              if (!user) {
                  return resolve({ success: false, message: "User not found." });
              }

              // If user has a Google ID, no password verification is needed
              if (user.google_id) {
                  console.log("Google user authenticated.");
                  return resolve({ success: true, message: "Google user authenticated.", user });
              }

              // Verify password for manual users
              const isMatch = await bcrypt.compare(password, user.password);
              if (!isMatch) {
                  console.log("Login failed: Incorrect password");
                  return resolve({ success: false, message: "Invalid credentials." });
              }

              // Generate JWT token
              //const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

              console.log("Login successful.");
              return resolve({ success: true, token });
          });
      });

  } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Internal server error." };
  }
};

const userExists = async (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT email FROM users WHERE email = ? LIMIT 1', [email], (err, row) => {
        if (err) {
          console.error("Database error:", err);
          //resolve(false);
          reject(err);
        } else if (row === undefined) {
          console.log("No row found with email: ", email);
          return resolve(false);
        } else {
          console.log("Row found:", row);
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


const generateUniqueApiKey = async () => {
  let apiKey;
  let exists;
  
  do { // if generated API key is not unique, keep generating until it is
    apiKey = generateApiKey();
    exists = await checkApiKeyExists(apiKey);
  } while (exists);
  
  return apiKey;
};

const createUser = async (googleID, email, first_name, last_name) => {
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
      'INSERT INTO users (google_id, email, first_name, last_name, password, api_key) VALUES (?, ?, ?, ?)',
      [googleID || null, email, first_name || NULL, last_name || NULL, password || NULL, apiKey],
      function(err) {
        if (err) {
          console.error('Database error:', err.message);
          console.error('Error code:', err.code);
          reject(err);
          return;
        }
        resolve({ id: this.lastID, email, apiKey });
      }
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
    userExists,
    userLogin
}; 