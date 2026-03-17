import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

const result = db.prepare(
    `UPDATE commentaries SET author = 'Armor & Light', source = 'Scholarly Commentary' WHERE author = 'AI Scholar (Armor & Light)'`
).run();

console.log(`Updated ${result.changes} commentary rows`);

const check = db.prepare("SELECT DISTINCT author, source FROM commentaries").all();
console.log("\nCurrent labels:");
(check as any[]).forEach((r: any) => console.log(`  "${r.author}" — (${r.source})`));

db.close();
