import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Shim for dual ESM/CJS support (Vite Dev vs Electron Prod)
const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : dirname(currentFilename);

// Initialize database connection
// In production (Electron), we access the DB via the RESOURCES_PATH passed from main process
// In development, we use relative path
const dbPath = process.env.ELECTRON_RUN && process.env.RESOURCES_PATH
    ? path.join(process.env.RESOURCES_PATH, "data", "armorlight.db")
    : path.resolve(currentDirname, "../data/armorlight.db");

export const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
