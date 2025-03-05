import sqlite3 from 'sqlite3';
import path from 'path';

// verbose mode
const sqlite = sqlite3.verbose();

// Create database connection
const db = new sqlite.Database(path.join(__dirname, 'users.db'));

// Define table creation statements
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    password TEXT,
    api_key TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const createJobsTable = `
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    status TEXT CHECK(status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'PENDING')) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`;

// Initialize tables
// id is the unique Google ID
db.serialize(() => {
  db.run(createUsersTable);
  db.run(createJobsTable);
});

export default db;