/**
 * Armor & Light — Bible Seed Script (Bulk GitHub Download)
 * 
 * Downloads Bible text from aruljohn's GitHub repos (per-book JSON files):
 *   - aruljohn/Bible-wmb (branch: main)  → WEB/WMB — PUBLIC DOMAIN
 *   - aruljohn/Bible-kjv (branch: master) → KJV     — PUBLIC DOMAIN
 * 
 * NOTE: The repos use different filename conventions:
 *   KJV: No spaces (e.g. "1Chronicles", "SongofSolomon", "1John")
 *   WMB: Spaces + Hebrew names (e.g. "1 Chronicles", "Song of Solomon", "1 Yochanan")
 * 
 * Usage: npx tsx server/seed/seed-bible.ts
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── GitHub Raw URL Templates ────────────────────────────────────────
const WMB_BASE = "https://raw.githubusercontent.com/aruljohn/Bible-wmb/main";
const KJV_BASE = "https://raw.githubusercontent.com/aruljohn/Bible-kjv/master";

// ─── Create Tables ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    testament TEXT NOT NULL,
    book_order INTEGER NOT NULL,
    chapter_count INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id),
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text_web TEXT,
    text_kjv TEXT,
    text_esv TEXT,
    text_hebrew TEXT,
    text_greek TEXT,
    text_korean TEXT,
    text_chinese TEXT,
    strongs_numbers TEXT,
    transliteration TEXT
  );

  CREATE TABLE IF NOT EXISTS strongs_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strongs_number TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL,
    original_word TEXT,
    transliteration TEXT,
    pronunciation TEXT,
    definition TEXT NOT NULL,
    kjv_usage TEXT,
    outline TEXT
  );

  CREATE TABLE IF NOT EXISTS cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_verse_id INTEGER NOT NULL REFERENCES verses(id),
    to_verse_id INTEGER NOT NULL REFERENCES verses(id),
    votes INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'member',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    ai_response TEXT,
    rating INTEGER,
    comment TEXT,
    context TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    verse_id INTEGER REFERENCES verses(id),
    content TEXT NOT NULL,
    parent_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(book_id, chapter);
  CREATE INDEX IF NOT EXISTS idx_verses_text_web ON verses(text_web);
  CREATE INDEX IF NOT EXISTS idx_crossrefs_from ON cross_references(from_verse_id);
  CREATE INDEX IF NOT EXISTS idx_crossrefs_to ON cross_references(to_verse_id);
  CREATE INDEX IF NOT EXISTS idx_strongs_number ON strongs_definitions(strongs_number);
  CREATE INDEX IF NOT EXISTS idx_posts_verse ON posts(verse_id);
`);

console.log("✅ Tables created.");

// ─── Bible Book Data ─────────────────────────────────────────────────
// Each book has separate GitHub filenames for KJV and WMB repos
const BOOKS = [
    // ──── Old Testament ────
    { name: "Genesis", kjv: "Genesis", wmb: "Genesis", slug: "genesis", testament: "OT", order: 1, chapters: 50 },
    { name: "Exodus", kjv: "Exodus", wmb: "Exodus", slug: "exodus", testament: "OT", order: 2, chapters: 40 },
    { name: "Leviticus", kjv: "Leviticus", wmb: "Leviticus", slug: "leviticus", testament: "OT", order: 3, chapters: 27 },
    { name: "Numbers", kjv: "Numbers", wmb: "Numbers", slug: "numbers", testament: "OT", order: 4, chapters: 36 },
    { name: "Deuteronomy", kjv: "Deuteronomy", wmb: "Deuteronomy", slug: "deuteronomy", testament: "OT", order: 5, chapters: 34 },
    { name: "Joshua", kjv: "Joshua", wmb: "Joshua", slug: "joshua", testament: "OT", order: 6, chapters: 24 },
    { name: "Judges", kjv: "Judges", wmb: "Judges", slug: "judges", testament: "OT", order: 7, chapters: 21 },
    { name: "Ruth", kjv: "Ruth", wmb: "Ruth", slug: "ruth", testament: "OT", order: 8, chapters: 4 },
    { name: "1 Samuel", kjv: "1Samuel", wmb: "1 Samuel", slug: "1-samuel", testament: "OT", order: 9, chapters: 31 },
    { name: "2 Samuel", kjv: "2Samuel", wmb: "2 Samuel", slug: "2-samuel", testament: "OT", order: 10, chapters: 24 },
    { name: "1 Kings", kjv: "1Kings", wmb: "1 Kings", slug: "1-kings", testament: "OT", order: 11, chapters: 22 },
    { name: "2 Kings", kjv: "2Kings", wmb: "2 Kings", slug: "2-kings", testament: "OT", order: 12, chapters: 25 },
    { name: "1 Chronicles", kjv: "1Chronicles", wmb: "1 Chronicles", slug: "1-chronicles", testament: "OT", order: 13, chapters: 29 },
    { name: "2 Chronicles", kjv: "2Chronicles", wmb: "2 Chronicles", slug: "2-chronicles", testament: "OT", order: 14, chapters: 36 },
    { name: "Ezra", kjv: "Ezra", wmb: "Ezra", slug: "ezra", testament: "OT", order: 15, chapters: 10 },
    { name: "Nehemiah", kjv: "Nehemiah", wmb: "Nehemiah", slug: "nehemiah", testament: "OT", order: 16, chapters: 13 },
    { name: "Esther", kjv: "Esther", wmb: "Esther", slug: "esther", testament: "OT", order: 17, chapters: 10 },
    { name: "Job", kjv: "Job", wmb: "Job", slug: "job", testament: "OT", order: 18, chapters: 42 },
    { name: "Psalms", kjv: "Psalms", wmb: "Psalms", slug: "psalms", testament: "OT", order: 19, chapters: 150 },
    { name: "Proverbs", kjv: "Proverbs", wmb: "Proverbs", slug: "proverbs", testament: "OT", order: 20, chapters: 31 },
    { name: "Ecclesiastes", kjv: "Ecclesiastes", wmb: "Ecclesiastes", slug: "ecclesiastes", testament: "OT", order: 21, chapters: 12 },
    { name: "Song of Solomon", kjv: "SongofSolomon", wmb: "Song of Solomon", slug: "song-of-solomon", testament: "OT", order: 22, chapters: 8 },
    { name: "Isaiah", kjv: "Isaiah", wmb: "Isaiah", slug: "isaiah", testament: "OT", order: 23, chapters: 66 },
    { name: "Jeremiah", kjv: "Jeremiah", wmb: "Jeremiah", slug: "jeremiah", testament: "OT", order: 24, chapters: 52 },
    { name: "Lamentations", kjv: "Lamentations", wmb: "Lamentations", slug: "lamentations", testament: "OT", order: 25, chapters: 5 },
    { name: "Ezekiel", kjv: "Ezekiel", wmb: "Ezekiel", slug: "ezekiel", testament: "OT", order: 26, chapters: 48 },
    { name: "Daniel", kjv: "Daniel", wmb: "Daniel", slug: "daniel", testament: "OT", order: 27, chapters: 12 },
    { name: "Hosea", kjv: "Hosea", wmb: "Hosea", slug: "hosea", testament: "OT", order: 28, chapters: 14 },
    { name: "Joel", kjv: "Joel", wmb: "Joel", slug: "joel", testament: "OT", order: 29, chapters: 3 },
    { name: "Amos", kjv: "Amos", wmb: "Amos", slug: "amos", testament: "OT", order: 30, chapters: 9 },
    { name: "Obadiah", kjv: "Obadiah", wmb: "Obadiah", slug: "obadiah", testament: "OT", order: 31, chapters: 1 },
    { name: "Jonah", kjv: "Jonah", wmb: "Jonah", slug: "jonah", testament: "OT", order: 32, chapters: 4 },
    { name: "Micah", kjv: "Micah", wmb: "Micah", slug: "micah", testament: "OT", order: 33, chapters: 7 },
    { name: "Nahum", kjv: "Nahum", wmb: "Nahum", slug: "nahum", testament: "OT", order: 34, chapters: 3 },
    { name: "Habakkuk", kjv: "Habakkuk", wmb: "Habakkuk", slug: "habakkuk", testament: "OT", order: 35, chapters: 3 },
    { name: "Zephaniah", kjv: "Zephaniah", wmb: "Zephaniah", slug: "zephaniah", testament: "OT", order: 36, chapters: 3 },
    { name: "Haggai", kjv: "Haggai", wmb: "Haggai", slug: "haggai", testament: "OT", order: 37, chapters: 2 },
    { name: "Zechariah", kjv: "Zechariah", wmb: "Zechariah", slug: "zechariah", testament: "OT", order: 38, chapters: 14 },
    { name: "Malachi", kjv: "Malachi", wmb: "Malachi", slug: "malachi", testament: "OT", order: 39, chapters: 4 },
    // ──── New Testament ────
    { name: "Matthew", kjv: "Matthew", wmb: "Matthew", slug: "matthew", testament: "NT", order: 40, chapters: 28 },
    { name: "Mark", kjv: "Mark", wmb: "Mark", slug: "mark", testament: "NT", order: 41, chapters: 16 },
    { name: "Luke", kjv: "Luke", wmb: "Luke", slug: "luke", testament: "NT", order: 42, chapters: 24 },
    { name: "John", kjv: "John", wmb: "Yochanan", slug: "john", testament: "NT", order: 43, chapters: 21 },
    { name: "Acts", kjv: "Acts", wmb: "Acts", slug: "acts", testament: "NT", order: 44, chapters: 28 },
    { name: "Romans", kjv: "Romans", wmb: "Romans", slug: "romans", testament: "NT", order: 45, chapters: 16 },
    { name: "1 Corinthians", kjv: "1Corinthians", wmb: "1 Corinthians", slug: "1-corinthians", testament: "NT", order: 46, chapters: 16 },
    { name: "2 Corinthians", kjv: "2Corinthians", wmb: "2 Corinthians", slug: "2-corinthians", testament: "NT", order: 47, chapters: 13 },
    { name: "Galatians", kjv: "Galatians", wmb: "Galatians", slug: "galatians", testament: "NT", order: 48, chapters: 6 },
    { name: "Ephesians", kjv: "Ephesians", wmb: "Ephesians", slug: "ephesians", testament: "NT", order: 49, chapters: 6 },
    { name: "Philippians", kjv: "Philippians", wmb: "Philippians", slug: "philippians", testament: "NT", order: 50, chapters: 4 },
    { name: "Colossians", kjv: "Colossians", wmb: "Colossians", slug: "colossians", testament: "NT", order: 51, chapters: 4 },
    { name: "1 Thessalonians", kjv: "1Thessalonians", wmb: "1 Thessalonians", slug: "1-thessalonians", testament: "NT", order: 52, chapters: 5 },
    { name: "2 Thessalonians", kjv: "2Thessalonians", wmb: "2 Thessalonians", slug: "2-thessalonians", testament: "NT", order: 53, chapters: 3 },
    { name: "1 Timothy", kjv: "1Timothy", wmb: "1 Timothy", slug: "1-timothy", testament: "NT", order: 54, chapters: 6 },
    { name: "2 Timothy", kjv: "2Timothy", wmb: "2 Timothy", slug: "2-timothy", testament: "NT", order: 55, chapters: 4 },
    { name: "Titus", kjv: "Titus", wmb: "Titus", slug: "titus", testament: "NT", order: 56, chapters: 3 },
    { name: "Philemon", kjv: "Philemon", wmb: "Philemon", slug: "philemon", testament: "NT", order: 57, chapters: 1 },
    { name: "Hebrews", kjv: "Hebrews", wmb: "Hebrews", slug: "hebrews", testament: "NT", order: 58, chapters: 13 },
    { name: "James", kjv: "James", wmb: "Jacob", slug: "james", testament: "NT", order: 59, chapters: 5 },
    { name: "1 Peter", kjv: "1Peter", wmb: "1 Peter", slug: "1-peter", testament: "NT", order: 60, chapters: 5 },
    { name: "2 Peter", kjv: "2Peter", wmb: "2 Peter", slug: "2-peter", testament: "NT", order: 61, chapters: 3 },
    { name: "1 John", kjv: "1John", wmb: "1 Yochanan", slug: "1-john", testament: "NT", order: 62, chapters: 5 },
    { name: "2 John", kjv: "2John", wmb: "2 Yochanan", slug: "2-john", testament: "NT", order: 63, chapters: 1 },
    { name: "3 John", kjv: "3John", wmb: "3 Yochanan", slug: "3-john", testament: "NT", order: 64, chapters: 1 },
    { name: "Jude", kjv: "Jude", wmb: "Judah", slug: "jude", testament: "NT", order: 65, chapters: 1 },
    { name: "Revelation", kjv: "Revelation", wmb: "Revelation", slug: "revelation", testament: "NT", order: 66, chapters: 22 },
];

// ─── Seed Books ──────────────────────────────────────────────────────
const existingBooks = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };

if (existingBooks.count === 0) {
    const insertBook = db.prepare(
        "INSERT INTO books (name, slug, testament, book_order, chapter_count) VALUES (?, ?, ?, ?, ?)"
    );
    const seedBooks = db.transaction(() => {
        for (const b of BOOKS) {
            insertBook.run(b.name, b.slug, b.testament, b.order, b.chapters);
        }
    });
    seedBooks();
    console.log(`✅ Seeded ${BOOKS.length} books.`);
} else {
    console.log(`ℹ️  Books already seeded (${existingBooks.count}). Skipping.`);
}

// ─── JSON Data Structures ────────────────────────────────────────────
interface BookJSON {
    book: string;
    chapters: {
        chapter: string;
        verses: { verse: string; text: string }[];
    }[];
}

// ─── Download a single book JSON from GitHub ─────────────────────────
async function downloadBookJSON(base: string, fileName: string): Promise<BookJSON | null> {
    // Use encodeURIComponent for each path segment but replace %20 with space encoding
    const url = `${base}/${encodeURIComponent(fileName)}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`  ⚠ HTTP ${response.status} for ${url}`);
            return null;
        }
        return (await response.json()) as BookJSON;
    } catch (err) {
        console.warn(`  ⚠ Failed to download ${fileName}:`, err);
        return null;
    }
}

// ─── Main Seeding Logic ──────────────────────────────────────────────
async function fetchAndSeedBible() {
    const existingVerses = db.prepare("SELECT COUNT(*) as count FROM verses").get() as { count: number };
    if (existingVerses.count > 0) {
        console.log(`ℹ️  Verses already seeded (${existingVerses.count}). Skipping.`);
        return;
    }

    console.log("\n📖 Downloading WEB + KJV Bible text from GitHub...\n");

    const insertVerse = db.prepare(
        "INSERT INTO verses (book_id, chapter, verse, text_web, text_kjv) VALUES (?, ?, ?, ?, ?)"
    );

    const allBooks = db.prepare("SELECT * FROM books ORDER BY book_order").all() as any[];
    let totalVerses = 0;
    let failedBooks: string[] = [];
    const startTime = Date.now();

    for (const book of allBooks) {
        const bookDef = BOOKS.find(b => b.slug === book.slug);
        if (!bookDef) continue;

        const bookStart = Date.now();

        // Download both translations for this book in parallel
        // WMB uses "main" branch, KJV uses "master" branch (already in base URLs)
        const [webData, kjvData] = await Promise.all([
            downloadBookJSON(WMB_BASE, bookDef.wmb),
            downloadBookJSON(KJV_BASE, bookDef.kjv),
        ]);

        if (!webData && !kjvData) {
            console.warn(`  ❌ Failed BOTH translations for ${book.name}`);
            failedBooks.push(book.name);
            continue;
        }

        // Build a lookup: chapter -> verse -> text for KJV
        const kjvLookup = new Map<string, Map<string, string>>();
        if (kjvData) {
            for (const ch of kjvData.chapters) {
                const verseMap = new Map<string, string>();
                for (const v of ch.verses) {
                    verseMap.set(v.verse, v.text);
                }
                kjvLookup.set(ch.chapter, verseMap);
            }
        }

        // Build a lookup for WEB text too (in case KJV has extra verses)
        const webLookup = new Map<string, Map<string, string>>();
        if (webData) {
            for (const ch of webData.chapters) {
                const verseMap = new Map<string, string>();
                for (const v of ch.verses) {
                    verseMap.set(v.verse, v.text);
                }
                webLookup.set(ch.chapter, verseMap);
            }
        }

        // Use WEB chapters as primary source, with KJV fallback
        const sourceChapters = webData?.chapters || kjvData?.chapters || [];
        let bookVerses = 0;

        const seedBook = db.transaction(() => {
            for (const ch of sourceChapters) {
                const chapterNum = parseInt(ch.chapter, 10);
                const kjvChapter = kjvLookup.get(ch.chapter);

                for (const v of ch.verses) {
                    const verseNum = parseInt(v.verse, 10);
                    const webText = webData ? v.text : null;
                    const kjvText = kjvChapter?.get(v.verse) || null;

                    insertVerse.run(book.id, chapterNum, verseNum, webText, kjvText);
                    totalVerses++;
                    bookVerses++;
                }
            }
        });
        seedBook();

        const elapsed = ((Date.now() - bookStart) / 1000).toFixed(1);
        const webStatus = webData ? "✓" : "✗";
        const kjvStatus = kjvData ? "✓" : "✗";
        console.log(`  ✅ ${book.name.padEnd(18)} ${bookVerses.toString().padStart(5)} verses  [WEB:${webStatus} KJV:${kjvStatus}]  (${elapsed}s)`);

        // Small delay between books to be polite to GitHub
        await new Promise(r => setTimeout(r, 200));
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n✅ Seeded ${totalVerses} verses (WEB + KJV) in ${totalElapsed}s.`);

    if (failedBooks.length > 0) {
        console.log(`⚠  Failed books: ${failedBooks.join(", ")}`);
    }
}

// ─── Run ─────────────────────────────────────────────────────────────
async function main() {
    console.log("\n⚔️  Armor & Light — Bible Seed Script");
    console.log("   Source: GitHub (aruljohn/Bible-wmb + aruljohn/Bible-kjv)");
    console.log("   Translations: WEB (primary) + KJV (secondary)");
    console.log("   Both are PUBLIC DOMAIN — free for commercial use.\n");

    await fetchAndSeedBible();

    // Show DB stats
    const stats = {
        books: (db.prepare("SELECT COUNT(*) as c FROM books").get() as any).c,
        verses: (db.prepare("SELECT COUNT(*) as c FROM verses").get() as any).c,
        webVerses: (db.prepare("SELECT COUNT(*) as c FROM verses WHERE text_web IS NOT NULL").get() as any).c,
        kjvVerses: (db.prepare("SELECT COUNT(*) as c FROM verses WHERE text_kjv IS NOT NULL").get() as any).c,
    };

    console.log("\n📊 Database Stats:");
    console.log(`   Books:      ${stats.books}`);
    console.log(`   Verses:     ${stats.verses}`);
    console.log(`   WEB filled: ${stats.webVerses}`);
    console.log(`   KJV filled: ${stats.kjvVerses}`);
    console.log(`   DB path:    ${DB_PATH}`);

    db.close();
    console.log("\n✅ Done!");
}

main().catch(console.error);
