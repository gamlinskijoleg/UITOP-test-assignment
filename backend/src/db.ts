import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );
`);

// Seed default categories if they don't exist
const checkCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (checkCategories.count === 0) {
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const defaultCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance'];
  defaultCategories.forEach(name => insertCategory.run(name));
}

export default db;
