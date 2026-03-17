import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../data", "armorlight.db");
const db = new Database(DB_PATH);

const updateVerse = db.prepare("UPDATE verses SET interlinear_data = ? WHERE book_id = ? AND chapter = ? AND verse = ?");

const missingBooks = [
    "1-samuel", "2-samuel", "1-kings", "2-kings", "1-chronicles", "2-chronicles",
    "song-of-solomon",
    "1-corinthians", "2-corinthians", "1-thessalonians", "2-thessalonians",
    "1-timothy", "2-timothy", "1-peter", "2-peter", "1-john", "2-john", "3-john"
];

const mappedSlugs: Record<string, string> = {
    "1-samuel": "i_samuel",
    "2-samuel": "ii_samuel",
    "1-kings": "i_kings",
    "2-kings": "ii_kings",
    "1-chronicles": "i_chronicles",
    "2-chronicles": "ii_chronicles",
    "song-of-solomon": "song_of_solomon",
    "1-corinthians": "i_corinthians",
    "2-corinthians": "ii_corinthians",
    "1-thessalonians": "i_thessalonians",
    "2-thessalonians": "ii_thessalonians",
    "1-timothy": "i_timothy",
    "2-timothy": "ii_timothy",
    "1-peter": "i_peter",
    "2-peter": "ii_peter",
    "1-john": "i_john",
    "2-john": "ii_john",
    "3-john": "iii_john"
};

async function patch() {
    const dbBooks = db.prepare("SELECT id, slug, chapter_count FROM books").all() as any[];

    for (const book of dbBooks) {
        if (!missingBooks.includes(book.slug)) continue;

        const repoSlug = mappedSlugs[book.slug];
        let bookUpdated = 0;

        for (let ch = 1; ch <= book.chapter_count; ch++) {
            const url = `https://raw.githubusercontent.com/tahmmee/interlinear_bibledata/master/src/${repoSlug}/${ch}.json`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.log(`Failed HTTP ${res.status} for ${book.slug} ch ${ch}`);
                    continue;
                }
                const chapterData = await res.json();

                const tx = db.transaction(() => {
                    for (const [verseNumStr, wordsArray] of Object.entries(chapterData)) {
                        const verseNum = parseInt(verseNumStr, 10);
                        if (isNaN(verseNum)) continue;

                        const cleanArray = (wordsArray as any[]).map(w => ({
                            e: w.text || "",
                            s: w.number ? w.number.toUpperCase().replace(/^0+/, '') : ""
                        }));

                        updateVerse.run(JSON.stringify(cleanArray), book.id, ch, verseNum);
                        bookUpdated++;
                    }
                });
                tx();
                await new Promise(r => setTimeout(r, 100)); // rate limit
            } catch (e) {
                console.error(`Error parsing ${book.slug} ch ${ch}`, e);
            }
        }
        console.log(`✅ ${book.slug} (${repoSlug}) - ${bookUpdated} verses`);
    }
}

patch().then(() => db.close());
