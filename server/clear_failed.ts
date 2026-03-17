import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);
const r = db.prepare("DELETE FROM global_ai_pass_log WHERE status = 'FAILED'").run();
console.log(`Cleared ${r.changes} FAILED entries for retry`);
db.close();
