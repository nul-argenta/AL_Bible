/**
 * Armor & Light — Matthew Henry Concise Commentary Seed Script
 * 
 * Parses mhcc.xml (ThML format from CCEL) and seeds:
 *   - book_introductions (overview)
 *   - commentaries (per-verse text, mapping ranges to individual verses)
 * 
 * Usage: npx tsx server/seed/seed-commentary.ts
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const XML_PATH = path.resolve(__dirname, "mhcc.xml");

if (!fs.existsSync(XML_PATH)) {
    console.error(`❌ Global mhcc.xml not found at ${XML_PATH}`);
    process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Create Tables if needed ────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS book_introductions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id),
    author TEXT,
    overview TEXT,
    theme TEXT,
    key_verses TEXT,
    outline TEXT
  );

  CREATE TABLE IF NOT EXISTS commentaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    source TEXT
  );
`);

// ─── OSIS Abbreviation Map ──────────────────────────────────────────
const OSIS_MAP: { [key: string]: string } = {
    "Gen": "genesis", "Exod": "exodus", "Lev": "leviticus", "Num": "numbers", "Deut": "deuteronomy",
    "Josh": "joshua", "Judg": "judges", "Ruth": "ruth", "1Sam": "1-samuel", "2Sam": "2-samuel",
    "1Kgs": "1-kings", "2Kgs": "2-kings", "1Chr": "1-chronicles", "2Chr": "2-chronicles",
    "Ezra": "ezra", "Neh": "nehemiah", "Esth": "esther", "Job": "job", "Ps": "psalms",
    "Prov": "proverbs", "Eccl": "ecclesiastes", "Song": "song-of-solomon", "Isa": "isaiah",
    "Jer": "jeremiah", "Lam": "lamentations", "Ezek": "ezekiel", "Dan": "daniel", "Hos": "hosea",
    "Joel": "joel", "Amos": "amos", "Obad": "obadiah", "Jonah": "jonah", "Mic": "micah",
    "Nah": "nahum", "Hab": "habakkuk", "Zeph": "zephaniah", "Hag": "haggai", "Zech": "zechariah",
    "Mal": "malachi", "Matt": "matthew", "Mark": "mark", "Luke": "luke", "John": "john",
    "Acts": "acts", "Rom": "romans", "1Cor": "1-corinthians", "2Cor": "2-corinthians",
    "Gal": "galatians", "Eph": "ephesians", "Phil": "philippians", "Col": "colossians",
    "1Thess": "1-thessalonians", "2Thess": "2-thessalonians", "1Tim": "1-timothy", "2Tim": "2-timothy",
    "Titus": "titus", "Phlm": "philemon", "Heb": "hebrews", "Jas": "james", "1Pet": "1-peter",
    "2Pet": "2-peter", "1John": "1-john", "2John": "2-john", "3John": "3-john", "Jude": "jude",
    "Rev": "revelation"
};

// ─── Helpers ────────────────────────────────────────────────────────
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>?/gm, "") // Remove tags
        .replace(/\?/g, "\"")      // Clean encoding artifacts
        .replace(/\-/g, "-")
        .replace(/\s\s+/g, " ")     // Collapse whitespace
        .trim();
}

/**
 * Parses a range like "Gen.3.16-Gen.3.19" or "Gen.3.16"
 * Returns array of {slug, chapter, verse} for all verses in between.
 * Note: CCEL usually only has single-chapter ranges within a div.
 */
function expandRange(osisRef: string): { slug: string, chapter: number, verse: number }[] {
    const parts = osisRef.split("-");
    const start = parts[0].split(".");
    if (start.length < 3) return [];

    const slug = OSIS_MAP[start[0]];
    if (!slug) return [];

    const chapter = parseInt(start[1]);
    const vStart = parseInt(start[2]);
    let vEnd = vStart;

    if (parts.length > 1) {
        const end = parts[1].split(".");
        if (end.length >= 3) {
            vEnd = parseInt(end[2]);
        }
    }

    const result = [];
    for (let v = vStart; v <= vEnd; v++) {
        result.push({ slug, chapter, verse: v });
    }
    return result;
}

// ─── Main Script ─────────────────────────────────────────────────────
async function main() {
    console.log("📖 Loading Verse IDs into memory...");
    const versesByRef = new Map<string, number>();
    const allVerses = db.prepare(`
        SELECT v.id, b.slug, v.chapter, v.verse 
        FROM verses v 
        JOIN books b ON v.book_id = b.id
    `).all() as any[];
    for (const v of allVerses) {
        versesByRef.set(`${v.slug}:${v.chapter}:${v.verse}`, v.id);
    }
    console.log(`✅ Loaded ${versesByRef.size} verses.`);

    console.log("📂 Reading mhcc.xml...");
    const xml = fs.readFileSync(XML_PATH, "utf-8");

    // ─── 1. Seed Book Introductions ──────────────────────────────────
    console.log("🌱 Seeding Book Introductions...");
    // Split by <div1 title="
    const bookChunks = xml.split(/<div1 title="/).slice(1);

    const insertIntro = db.prepare(`
        INSERT INTO book_introductions (book_id, overview, author)
        VALUES (?, ?, 'Matthew Henry')
    `);

    const getBookId = db.prepare("SELECT id FROM books WHERE name = ?");

    db.transaction(() => {
        for (const chunk of bookChunks) {
            const quoteEnd = chunk.indexOf('"');
            const bookName = chunk.substring(0, quoteEnd);

            const bookIdResult = getBookId.get(bookName) as { id: number } | undefined;
            if (!bookIdResult) continue;

            // Extract introduction (all <p> content before the first <div2)
            const div2Start = chunk.indexOf("<div2");
            const introContent = div2Start > -1 ? chunk.substring(0, div2Start) : chunk;

            const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
            let combinedIntro = "";
            let match;
            while ((match = pRegex.exec(introContent)) !== null) {
                const pText = stripHtml(match[1]);
                if (pText && !pText.includes("contains the following summary") && !pText.startsWith("Chapter Outline")) {
                    combinedIntro += pText + "\n\n";
                }
            }

            if (combinedIntro.trim()) {
                insertIntro.run(bookIdResult.id, combinedIntro.trim());
            }
        }
    })();
    console.log("✅ Book introductions seeded.");

    // ─── 2. Seed Commentaries ────────────────────────────────────────
    console.log("🌱 Seeding Commentaries...");
    const insertCommentary = db.prepare(`
        INSERT INTO commentaries (verse_id, author, text, source)
        VALUES (?, ?, ?, ?)
    `);

    let commentaryCount = 0;
    let skipCount = 0;

    // Look for <div class="Commentary" id="Bible:([^"]+)">
    // We also need the text within.
    const commentaryRegex = /<div class="Commentary" id="Bible:([^"]+)">([\s\S]+?)<\/div>/g;

    db.transaction(() => {
        let match;
        while ((match = commentaryRegex.exec(xml)) !== null) {
            const osisRef = match[1];
            const content = match[2];
            const text = stripHtml(content);

            if (!text) continue;

            const targetVerses = expandRange(osisRef);
            if (targetVerses.length === 0) {
                skipCount++;
                continue;
            }

            for (const vRef of targetVerses) {
                const verseId = versesByRef.get(`${vRef.slug}:${vRef.chapter}:${vRef.verse}`);
                if (verseId) {
                    insertCommentary.run(verseId, "Matthew Henry", text, "Concise Commentary");
                    commentaryCount++;
                } else {
                    skipCount++;
                }
            }
        }
    })();

    console.log(`✅ Seeded ${commentaryCount} commentary entries.`);
    if (skipCount > 0) {
        console.warn(`⚠️  Skipped ${skipCount} entries (unrecognized refs or missing verses).`);
    }

    db.close();
    console.log("\n✨ Done!");
}

main().catch(console.error);
