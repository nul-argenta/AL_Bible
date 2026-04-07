import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const languages = [
    { name: "Spanish", file: "verses_intl_es.csv", column: "text_spanish" },
    { name: "Arabic", file: "verses_intl_ar.csv", column: "text_arabic" },
    { name: "Portuguese", file: "verses_intl_pt.csv", column: "text_portuguese" },
    { name: "Chinese", file: "verses_intl_cn.csv", column: "text_chinese" }
];

async function seedIntlTranslations() {
    const localBooks = db.prepare("SELECT id, name FROM books").all() as { id: number, name: string }[];
    const bookMap = new Map(localBooks.map(b => [b.name.toLowerCase(), b.id]));

    for (const lang of languages) {
        console.log(`\n--- Seeding ${lang.name} Translation ---`);
        const csvPath = path.resolve(__dirname, "../../exports", lang.file);
        
        if (!fs.existsSync(csvPath)) {
            console.warn(`⚠️ CSV file not found: ${csvPath}. Skipping.`);
            continue;
        }

        const csvContent = fs.readFileSync(csvPath, "utf-8");
        const lines = csvContent.split(/\r?\n/);
        const records = lines.slice(1).filter(line => line.trim().length > 0);

        console.log(`Processing ${records.length} records from ${lang.file}...`);

        const updateVerse = db.prepare(`
            UPDATE verses 
            SET ${lang.column} = ? 
            WHERE book_id = ? AND chapter = ? AND verse = ?
        `);

        let updateCount = 0;
        let skipCount = 0;

        db.transaction(() => {
            for (const line of records) {
                // Robust split for quoted fields
                const firstComma = line.indexOf(",");
                const secondComma = line.indexOf(",", firstComma + 1);
                const thirdComma = line.indexOf(",", secondComma + 1);

                if (firstComma === -1 || secondComma === -1 || thirdComma === -1) {
                    skipCount++;
                    continue;
                }

                let bookIdentifier = line.substring(0, firstComma).trim();
                const chapter = parseInt(line.substring(firstComma + 1, secondComma).trim());
                const verse = parseInt(line.substring(secondComma + 1, thirdComma).trim());
                let text = line.substring(thirdComma + 1).trim();

                // Clean up text quotes
                if (text.startsWith("\"") && text.endsWith("\"")) {
                    text = text.substring(1, text.length - 1).replace(/""/g, "\"");
                }

                let bookId: number | undefined;

                // Check if bookIdentifier is a number (ID) or a string (Name)
                if (/^\d+$/.test(bookIdentifier)) {
                    bookId = parseInt(bookIdentifier);
                } else {
                    // Normalization for names
                    let bookName = bookIdentifier;
                    if (bookName.startsWith("I ")) bookName = "1 " + bookName.substring(2);
                    else if (bookName.startsWith("II ")) bookName = "2 " + bookName.substring(3);
                    else if (bookName.startsWith("III ")) bookName = "3 " + bookName.substring(4);
                    
                    bookId = bookMap.get(bookName.toLowerCase());

                    if (bookId === undefined) {
                        const bookNoSpace = bookName.replace(/\s+/g, "").toLowerCase();
                        const matchedBook = localBooks.find(b => b.name.replace(/\s+/g, "").toLowerCase() === bookNoSpace);
                        if (matchedBook) bookId = matchedBook.id;
                    }
                }

                if (bookId !== undefined) {
                    const result = updateVerse.run(text, bookId, chapter, verse);
                    if (result.changes > 0) updateCount++; else skipCount++;
                } else {
                    skipCount++;
                }
            }
        })();

        console.log(`✅ ${lang.name}: Updated ${updateCount} verses.`);
        if (skipCount > 0) {
            console.log(`ℹ️ ${lang.name}: Skipped ${skipCount} verses.`);
        }
    }

    db.close();
}

seedIntlTranslations().catch(console.error);
