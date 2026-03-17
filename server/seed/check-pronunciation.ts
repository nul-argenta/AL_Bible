import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../data", "armorlight.db");
const db = new Database(DB_PATH);

const hebrewMissing = db.prepare("SELECT COUNT(*) as count FROM strongs_definitions WHERE language = 'hebrew' AND (pronunciation IS NULL OR pronunciation = '')").get() as any;
const greekMissing = db.prepare("SELECT COUNT(*) as count FROM strongs_definitions WHERE language = 'greek' AND (pronunciation IS NULL OR pronunciation = '')").get() as any;

const hebrewTotal = db.prepare("SELECT COUNT(*) as count FROM strongs_definitions WHERE language = 'hebrew'").get() as any;
const greekTotal = db.prepare("SELECT COUNT(*) as count FROM strongs_definitions WHERE language = 'greek'").get() as any;

console.log(`Hebrew missing pron: ${hebrewMissing.count} / ${hebrewTotal.count}`);
console.log(`Greek missing pron: ${greekMissing.count} / ${greekTotal.count}`);

const sampleMissing = db.prepare("SELECT strongs_number, original_word, transliteration FROM strongs_definitions WHERE pronunciation IS NULL OR pronunciation = '' LIMIT 5").all();
console.log("Sample missing:", sampleMissing);

db.close();
