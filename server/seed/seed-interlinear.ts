/**
 * Armor & Light — Interlinear Data Seed Script
 * 
 * Fetches JSON interlinear mapping from the public domain KJV+ repository
 * and populates the `interlinear_data` JSON column in the `verses` table.
 * 
 * Interlinear Data format per verse:
 * [ { "word": "In the beginning", "strongs": "H7225" }, ... ]
 * 
 * Note: Our Reader UI will use this array and join with `strongs_definitions`
 * to display the original Hebrew/Greek word and transliteration underneath.
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");

if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database not found at ${DB_PATH}`);
    process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Ensure interlinear column exists
try {
    db.exec("ALTER TABLE verses ADD COLUMN interlinear_data TEXT");
    console.log("✅ Added interlinear_data column to verses table.");
} catch (e: any) {
    if (!e.message.includes("duplicate column")) {
        console.error("Warning ensuring column:", e.message);
    }
}

const updateVerse = db.prepare("UPDATE verses SET interlinear_data = ? WHERE book_id = ? AND chapter = ? AND verse = ?");

async function seedInterlinear() {
    console.log("════════════════════════════════════════════════");
    console.log("  Armor & Light — Interlinear Seeder");
    console.log("════════════════════════════════════════════════\n");

    // Fetch the books index from the repository to map names
    console.log("📖 Fetching books index...");
    const booksUrl = "https://raw.githubusercontent.com/tahmmee/interlinear_bibledata/master/books.json";

    let repoBooks: any[] = [];
    try {
        const res = await fetch(booksUrl);
        if (!res.ok) throw new Error("Failed to fetch books.json");
        repoBooks = await res.json();
    } catch (e) {
        console.error("❌ Fatal: Could not fetch books root:", e);
        return;
    }

    // Map our DB books to the repo's book names
    const dbBooks = db.prepare("SELECT id, slug, chapter_count FROM books").all() as any[];

    let totalVerses = 0;
    const startTime = Date.now();

    for (const dbBook of dbBooks) {
        // The repo uses lowercase slugs like "1_chronicles" or "1_john" or "genesis"
        const repoSlug = dbBook.slug.replace("-", "_");

        let bookUpdated = 0;
        const bookStart = Date.now();

        // Loop over chapters
        for (let ch = 1; ch <= dbBook.chapter_count; ch++) {
            const url = `https://raw.githubusercontent.com/tahmmee/interlinear_bibledata/master/src/${repoSlug}/${ch}.json`;

            try {
                const res = await fetch(url);
                if (!res.ok) {
                    if (res.status !== 404) console.warn(`  ⚠ HTTP ${res.status} for ${repoSlug} ch ${ch}`);
                    continue;
                }

                const chapterData = await res.json();

                const tx = db.transaction(() => {
                    // chapterData is an object mapping verse "1" to an array of objects
                    for (const [verseNumStr, wordsArray] of Object.entries(chapterData)) {
                        const verseNum = parseInt(verseNumStr, 10);
                        if (isNaN(verseNum)) continue;

                        // the wordsArray often comes unordered. The repo objects look like { text: "God", number: "h430" }
                        // The original english text in the text field is basically our word.
                        // We store it as a JSON string

                        // Map down to { e: "God", s: "H430" } to save space
                        const cleanArray = (wordsArray as any[]).map(w => ({
                            e: w.text || "",
                            s: w.number ? w.number.toUpperCase().replace(/^0+/, '') : "" // normalize h0430 to H430
                        }));

                        updateVerse.run(JSON.stringify(cleanArray), dbBook.id, ch, verseNum);
                        totalVerses++;
                        bookUpdated++;
                    }
                });

                tx();

                // Be polite to github
                await new Promise(r => setTimeout(r, 100));
            } catch (e) {
                console.warn(`  ⚠ Failed to fetch/parse ${repoSlug} ch ${ch}`);
            }
        }

        const elapsed = ((Date.now() - bookStart) / 1000).toFixed(1);
        console.log(`  ✅ ${dbBook.slug.padEnd(16)} ${bookUpdated.toString().padStart(4)} verses interlinearized (${elapsed}s)`);
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Done! Updated ${totalVerses} verses with interlinear data in ${totalElapsed}s.`);
}

seedInterlinear().then(() => db.close()).catch(e => {
    console.error(e);
    db.close();
});
