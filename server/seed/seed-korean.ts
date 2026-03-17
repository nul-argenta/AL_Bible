import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// The JSON format from thiagobodruk/bible
interface KoreanBookJSON {
    abbrev: string;
    name?: string;
    chapters: string[][]; // Array of chapters, each containing an array of verse strings
}

async function seedKoreanTranslation() {
    console.log("Fetching Korean Revised Version (KRV) JSON...");

    try {
        const response = await fetch("https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json");

        if (!response.ok) {
            throw new Error(`Failed to fetch JSON: ${response.statusText}`);
        }

        const books = (await response.json()) as KoreanBookJSON[];
        console.log(`Successfully fetched ${books.length} books.`);

        const localBooks = db.prepare("SELECT id, name, book_order FROM books ORDER BY book_order ASC").all() as { id: number, name: string, book_order: number }[];

        if (localBooks.length !== books.length) {
            console.warn(`Mismatch in book counts: Local (${localBooks.length}) vs JSON (${books.length}). Proceeding by index mapping.`);
        }

        const updateVerse = db.prepare(`
            UPDATE verses 
            SET text_korean = ? 
            WHERE book_id = ? AND chapter = ? AND verse = ?
        `);

        let updateCount = 0;

        // Use a transaction for bulk updating the entire bible
        const processUpdates = db.transaction(() => {
            books.forEach((bookData, bIndex) => {
                // Ensure we don't overflow if json has more than 66 books (e.g., apocrypha)
                if (bIndex >= localBooks.length) return;

                const localBook = localBooks[bIndex];

                bookData.chapters.forEach((versesArray, cIndex) => {
                    const chapterNum = cIndex + 1;

                    versesArray.forEach((verseText, vIndex) => {
                        const verseNum = vIndex + 1;

                        const result = updateVerse.run(verseText, localBook.id, chapterNum, verseNum);
                        if (result.changes > 0) {
                            updateCount++;
                        }
                    });
                });
            });
        });

        console.log("Updating database... this may take a moment.");
        processUpdates();
        console.log(`✅ Successfully updated ${updateCount} verses with text_korean translations.`);

    } catch (err) {
        console.error("Error during Korean seeding:", err);
    } finally {
        db.close();
    }
}

seedKoreanTranslation();
