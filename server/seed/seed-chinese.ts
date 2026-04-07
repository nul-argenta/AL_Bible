import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const CSV_PATH = path.resolve(__dirname, "../../exports/verses_intl_cn.csv");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

async function seedChineseTranslation() {
    console.log("Reading Chinese Translation CSV...");
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`CSV file not found: ${CSV_PATH}`);
        return;
    }

    const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
    const lines = csvContent.split(/\r?\n/);
    
    // Skip header: Book,Chapter,Verse,Text
    const records = lines.slice(1).filter(line => line.trim().length > 0);

    console.log(`Processing ${records.length} lines.`);

    const localBooks = db.prepare("SELECT id, name FROM books").all() as { id: number, name: string }[];
    const bookMap = new Map(localBooks.map(b => [b.name.toLowerCase(), b.id]));

    const updateVerse = (db as any).prepare(`
        UPDATE verses 
        SET text_chinese = ? 
        WHERE book_id = ? AND chapter = ? AND verse = ?
    `);

    let updateCount = 0;
    let skipCount = 0;

    const processUpdates = db.transaction((recs: string[]) => {
        for (const line of recs) {
            // Simple split by first 3 commas
            const firstComma = line.indexOf(",");
            const secondComma = line.indexOf(",", firstComma + 1);
            const thirdComma = line.indexOf(",", secondComma + 1);

            if (firstComma === -1 || secondComma === -1 || thirdComma === -1) {
                skipCount++;
                continue;
            }

            let book = line.substring(0, firstComma).trim();
            const chapter = line.substring(firstComma + 1, secondComma).trim();
            const verse = line.substring(secondComma + 1, thirdComma).trim();
            const text = line.substring(thirdComma + 1).trim();

            // Normalize book name (Roman Numerals to Numbers, special cases)
            if (book.startsWith("I ")) book = "1 " + book.substring(2);
            else if (book.startsWith("II ")) book = "2 " + book.substring(3);
            else if (book.startsWith("III ")) book = "3 " + book.substring(4);
            else if (book === "Revelation of John") book = "Revelation";

            const bookId = bookMap.get(book.toLowerCase());

            if (bookId === undefined) {
                // Try removing spaces if it's like "1 Chronicles" vs "1Chronicles"
                const bookNoSpace = book.replace(/\s+/g, "").toLowerCase();
                const matchedBook = localBooks.find(b => b.name.replace(/\s+/g, "").toLowerCase() === bookNoSpace);
                
                if (matchedBook) {
                    const result = updateVerse.run(text, matchedBook.id, parseInt(chapter), parseInt(verse));
                    if (result.changes > 0) updateCount++; else skipCount++;
                } else {
                    skipCount++;
                }
                continue;
            }

            const result = updateVerse.run(text, bookId, parseInt(chapter), parseInt(verse));
            if (result.changes > 0) {
                updateCount++;
            } else {
                skipCount++;
            }
        }
    });

    console.log("Updating database... this may take a moment.");
    processUpdates(records);
    console.log(`✅ Successfully updated ${updateCount} verses with Chinese translation.`);
    if (skipCount > 0) {
        console.warn(`⚠️ Skipped ${skipCount} lines due to missing books or format issues.`);
    }
    db.close();
}

seedChineseTranslation().catch(console.error);
