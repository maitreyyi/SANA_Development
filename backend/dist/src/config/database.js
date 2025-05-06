"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const sqlite = sqlite3_1.default.verbose();
const db = new sqlite.Database(path_1.default.join(__dirname, 'users.db'));
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
exports.default = db;
//# sourceMappingURL=database.js.map