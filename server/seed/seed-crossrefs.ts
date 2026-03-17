/**
 * Armor & Light — Cross-References Seed Script
 * 
 * Reads `cross_references.txt` (OpenBible.info TSV) and inserts into the
 * `cross_references` table.
 * 
 * Format: From Verse \t To Verse \t Votes
 * Example: Gen.1.1 \t Jer.51.15 \t 83
 * 
 * Mapping strategy:
 * 1. Load all verses from DB into memory map: `bookSlug:chapter:verse` -> `verseId`
 * 2. Parse TSV, map abbreviations to slugs
 * 3. Batch insert using transactions
 * 
 * Usage: .\node_modules\.bin\tsx.cmd server/seed/seed-crossrefs.ts
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const CROSS_REFS_PATH = path.resolve(__dirname, "cross_references.txt");

if (!fs.existsSync(DB_PATH)) {
    console.error("❌ Database not found.");
    process.exit(1);
}

if (!fs.existsSync(CROSS_REFS_PATH)) {
    console.error("❌ cross_references.txt not found. Run download/unzip first.");
    process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const bookMap: Record<string, string> = {
    "Gen": "genesis", "Exod": "exodus", "Lev": "leviticus", "Num": "numbers", "Deut": "deuteronomy",
    "Josh": "joshua", "Judg": "judges", "Ruth": "ruth", "1Sam": "1-samuel", "2Sam": "2-samuel",
    "1Kings": "1-kings", "2Kings": "2-kings", "1Chr": "1-chronicles", "2Chr": "2-chronicles",
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

async function seedCrossRefs() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Armor & Light — Cross-References Seeder");
    console.log("═══════════════════════════════════════════════════════════\n");

    // 1. Load verses into memory map for fast lookup
    console.log("🚀 Loading verses into memory...");
    const verseLookup = new Map<string, number>();
    const allVerses = db.prepare(`
        SELECT v.id, b.slug, v.chapter, v.verse 
        FROM verses v 
        JOIN books b ON v.book_id = b.id
    `).all() as any[];

    for (const v of allVerses) {
        verseLookup.set(`${v.slug}:${v.chapter}:${v.verse}`, v.id);
    }
    console.log(`   ✅ Loaded ${verseLookup.size} verses.\n`);

    // 2. Prepare for insertion
    db.exec("DELETE FROM cross_references");
    const insert = db.prepare(`
        INSERT INTO cross_references (from_verse_id, to_verse_id, votes)
        VALUES (?, ?, ?)
    `);

    // 3. Process TSV line by line
    console.log("📜 Processing cross_references.txt...");
    const fileStream = fs.createReadStream(CROSS_REFS_PATH);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let errors = 0;
    let batch: any[] = [];
    const BATCH_SIZE = 10000;

    const runInsertBatch = db.transaction((items) => {
        for (const item of items) {
            insert.run(item.fromId, item.toId, item.votes);
        }
    });

    // Helper to parse "Gen.1.1" -> {slug, chapter, verse}
    function parseRef(ref: string) {
        // Handle ranges like "Gen.1.1-Gen.1.5" or "Gen.1.1-2.4"
        // OpenBible often uses ranges in the "To Verse" column
        const firstPart = ref.split("-")[0];
        const parts = firstPart.split(".");
        if (parts.length < 3) return null;

        const abbrev = parts[0];
        const chapter = parseInt(parts[1]);
        const verse = parseInt(parts[2]);

        const slug = bookMap[abbrev];
        if (!slug) return null;

        return { slug, chapter, verse };
    }

    const startTime = Date.now();

    for await (const line of rl) {
        if (line.startsWith("From Verse") || line.startsWith("#")) continue;

        const parts = line.split("\t");
        if (parts.length < 3) continue;

        const fromRef = parseRef(parts[0]);
        const toRef = parseRef(parts[1]);
        const votes = parseInt(parts[2]);

        if (fromRef && toRef) {
            const fromId = verseLookup.get(`${fromRef.slug}:${fromRef.chapter}:${fromRef.verse}`);
            const toId = verseLookup.get(`${toRef.slug}:${toRef.chapter}:${toRef.verse}`);

            if (fromId && toId) {
                batch.push({ fromId, toId, votes });
                count++;

                if (batch.length >= BATCH_SIZE) {
                    runInsertBatch(batch);
                    batch = [];
                    process.stdout.write(`   Processed ${count} refs...\r`);
                }
            } else {
                errors++;
            }
        } else {
            errors++;
        }
    }

    if (batch.length > 0) {
        runInsertBatch(batch);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n\n═══════════════════════════════════════════════════════════");
    console.log("  SEED COMPLETE");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Inserted:    ${count}`);
    console.log(`  Failed/Skip: ${errors}`);
    console.log(`  Time elapsed: ${elapsed}s`);
    console.log("═══════════════════════════════════════════════════════════\n");
}

try {
    seedCrossRefs().then(() => {
        db.close();
    });
} catch (err) {
    console.error("❌ Seed failed:", err);
    db.close();
    process.exit(1);
}
