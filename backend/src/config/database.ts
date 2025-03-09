import sqlite3 from 'sqlite3';
import path from 'path';

const sqlite = sqlite3.verbose();

const db = new sqlite.Database(path.join(__dirname, 'users.db'));

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    api_key TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const createJobsTable = `
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('preprocessing', 'processing', 'processed', 'failed')) DEFAULT 'preprocessing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    result TEXT,
    error TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`;

db.serialize(() => {
    db.run(createUsersTable);
    db.run(createJobsTable);
});

export default db;
