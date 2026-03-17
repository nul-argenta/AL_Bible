import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS highlights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT NOT NULL,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    color TEXT NOT NULL DEFAULT 'yellow',
    label TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT NOT NULL,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT NOT NULL,
    book_slug TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS favourite_verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_id TEXT NOT NULL,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

console.log("Tables created successfully:");
const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('highlights','notes','reading_progress','favourite_verses')"
).all();
(tables as any[]).forEach((t: any) => console.log("  ✅ " + t.name));

db.close();
