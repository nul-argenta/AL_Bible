import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

console.log("Updating verses table schema...");

const addColumn = (col: string) => {
    try {
        db.exec(`ALTER TABLE verses ADD COLUMN ${col} TEXT;`);
        console.log(`  ✅ Added ${col}`);
    } catch (e: any) {
        if (e.message.includes("duplicate column name")) {
            console.log(`  ℹ️ ${col} already exists`);
        } else {
            console.log(`  ❌ Error adding ${col}: ${e.message}`);
        }
    }
};

addColumn("text_spanish");
addColumn("text_arabic");
addColumn("text_portuguese");

console.log("Schema update complete.");
db.close();
