import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../data", "armorlight.db");
const db = new Database(DB_PATH);

console.log(db.prepare('SELECT * FROM strongs_definitions WHERE strongs_number = ?').get('H430'));
console.log(db.prepare('SELECT * FROM strongs_definitions WHERE strongs_number = ?').get('H7225'));
db.close();
