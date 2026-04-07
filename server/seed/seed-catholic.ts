import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const BOOKS_CSV = path.resolve(__dirname, "../../exports/books_catholic.csv");
const VERSES_CSV = path.resolve(__dirname, "../../exports/verses_catholic.csv");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

async function seedCatholicContent() {
    console.log("--- Seeding Catholic/Deuterocanonical Content ---");

    // 1. Seed Books
    console.log("Reading Books CSV...");
    const booksContent = fs.readFileSync(BOOKS_CSV, "utf-8");
    const bookLines = booksContent.split(/\r?\n/).slice(1).filter(l => l.trim());
    
    const insertBook = db.prepare(`
        INSERT OR IGNORE INTO books (id, name, slug, testament, book_order, chapter_count)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        for (const line of bookLines) {
            // Simple CSV split (handles quotes if any)
            const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!parts || parts.length < 6) continue;
            
            const id = parseInt(parts[0]);
            const name = parts[1].replace(/"/g, "");
            const slug = parts[2].replace(/"/g, "");
            const testament = parts[3].replace(/"/g, "");
            const bookOrder = parseInt(parts[4]);
            const chapterCount = parseInt(parts[5]);

            insertBook.run(id, name, slug, testament, bookOrder, chapterCount);
        }
    })();
    console.log(`✅ Books processed.`);

    // 2. Seed Verses
    console.log("Reading Verses CSV...");
    const versesContent = fs.readFileSync(VERSES_CSV, "utf-8");
    const verseLines = versesContent.split(/\r?\n/).slice(1).filter(l => l.trim());
    
    // Header: id,book_id,chapter,verse,text (Haydock/Douay?),text_web,text_kjv
    const insertVerse = db.prepare(`
        INSERT OR IGNORE INTO verses (id, book_id, chapter, verse, text_web, text_kjv)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    db.transaction(() => {
        for (const line of verseLines) {
            // Simple split by first 4 commas to get id, book_id, chapter, verse
            const firstComma = line.indexOf(",");
            const secondComma = line.indexOf(",", firstComma + 1);
            const thirdComma = line.indexOf(",", secondComma + 1);
            const fourthComma = line.indexOf(",", thirdComma + 1);

            if (firstComma === -1 || fourthComma === -1) continue;

            const id = parseInt(line.substring(0, firstComma));
            const bookId = parseInt(line.substring(firstComma + 1, secondComma));
            const chapter = parseInt(line.substring(secondComma + 1, thirdComma));
            const verse = parseInt(line.substring(thirdComma + 1, fourthComma));

            // The rest is "text","text_web","text_kjv"
            // We'll use a regex for the quoted parts if they exist
            const remainder = line.substring(fourthComma + 1);
            const textParts = remainder.match(/"(.*?)"/g);
            
            if (textParts && textParts.length >= 2) {
                const text_catholic = textParts[0].replace(/"/g, "");
                const text_web = textParts[1].replace(/"/g, "");
                const text_kjv = textParts.length > 2 ? textParts[2].replace(/"/g, "") : null;

                insertVerse.run(
                    id,
                    bookId,
                    chapter,
                    verse,
                    text_web || text_catholic,
                    text_kjv || null
                );
                count++;
            }
        }
    })();

    console.log(`✅ Successfully seeded ${count} Catholic verses.`);
    db.close();
}

seedCatholicContent().catch(console.error);
