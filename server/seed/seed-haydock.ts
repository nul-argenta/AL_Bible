import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const CSV_PATH = path.resolve(__dirname, "../../exports/commentaries_catholic.csv");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

async function seedHaydockCommentary() {
    console.log("Reading Haydock Commentary CSV...");
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`CSV file not found: ${CSV_PATH}`);
        return;
    }

    const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
    const lines = csvContent.split(/\r?\n/);
    
    // Skip header: id,verse_id,author,text,source
    const records = lines.slice(1).filter(line => line.trim().length > 0);

    console.log(`Processing ${records.length} commentary records.`);

    const insertCommentary = db.prepare(`
        INSERT OR IGNORE INTO commentaries (id, verse_id, author, text, source)
        VALUES (?, ?, ?, ?, ?)
    `);

    let count = 0;
    const processInserts = db.transaction((recs: string[]) => {
        for (const line of recs) {
            // Robust CSV parsing for quoted fields
            // Format: id,verse_id,author,text,source
            const firstComma = line.indexOf(",");
            const secondComma = line.indexOf(",", firstComma + 1);
            if (firstComma === -1 || secondComma === -1) continue;

            const id = parseInt(line.substring(0, firstComma));
            const verseId = parseInt(line.substring(firstComma + 1, secondComma));

            const remainder = line.substring(secondComma + 1);
            
            // Regex for CSV fields: either quoted with escaped quotes (double double quotes) or unquoted
            const fieldRegex = /"(?:""|[^"])*"|[^,]+/g;
            const parts = remainder.match(fieldRegex);
            
            if (parts && parts.length >= 3) {
                let author = parts[0].trim();
                let text = parts[1].trim();
                let source = parts[2].trim();

                // Clean up quotes
                if (author.startsWith("\"")) author = author.substring(1, author.length - 1).replace(/""/g, "\"");
                if (text.startsWith("\"")) text = text.substring(1, text.length - 1).replace(/""/g, "\"");
                if (source.startsWith("\"")) source = source.substring(1, source.length - 1).replace(/""/g, "\"");

                insertCommentary.run(id, verseId, author, text, source);
                count++;
            }
        }
    });

    console.log("Updating database...");
    processInserts(records);
    console.log(`✅ Successfully seeded ${count} Haydock commentary entries.`);
    db.close();
}

seedHaydockCommentary().catch(console.error);
