import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../data", "armorlight.db");
const db = new Database(DB_PATH);

const query = "beginning";
const searchTerm = `%${query}%`;
const stmt = db.prepare(`
    SELECT * FROM strongs_definitions 
    WHERE strongs_number LIKE ? 
       OR original_word LIKE ? 
       OR transliteration LIKE ? 
       OR definition LIKE ?
       OR kjv_usage LIKE ?
    ORDER BY strongs_number
    LIMIT 5
`);
const results = stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
console.log(results);
