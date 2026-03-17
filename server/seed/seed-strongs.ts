/**
 * Armor & Light — Strong's Concordance Seed Script
 * 
 * Reads Hebrew + Greek definitions from the `strongs` npm package
 * (openscriptures/strongs) and inserts them into the `strongs_definitions` table.
 * 
 * Data mapping:
 *   strongs package field  →  DB column
 *   ──────────────────────────────────────
 *   key (H1, G3056)       →  strongs_number
 *   (derived from key)    →  language ("hebrew" | "greek")
 *   lemma                 →  original_word
 *   xlit                  →  transliteration
 *   pron                  →  pronunciation
 *   strongs_def           →  definition
 *   kjv_def               →  kjv_usage
 *   derivation            →  outline
 * 
 * Expected totals: ~8,674 Hebrew (H1–H8674) + ~5,624 Greek (G1–G5624) = ~14,298 entries
 * 
 * Usage: npx tsx server/seed/seed-strongs.ts
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");

// ─── Validate DB exists ──────────────────────────────────────────────
if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Database not found at ${DB_PATH}`);
    console.error(`   Run seed-bible.ts first to create the database.`);
    process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// ─── Ensure table exists ─────────────────────────────────────────────
db.exec(`
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
`);

// ─── Load Strong's data from npm package ─────────────────────────────
// The package exports { hebrew: {...}, greek: {...} }
// Each dictionary is keyed by Strong's number (e.g. "H1", "G208")
const hebrewPath = path.resolve(__dirname, "../../node_modules/strongs/hebrew/strongs-hebrew-dictionary.js");
const greekPath = path.resolve(__dirname, "../../node_modules/strongs/greek/strongs-greek-dictionary.js");

// These files export a default object via module.exports
// We need to read them as CommonJS — use createRequire for ESM compatibility
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const hebrewDict: Record<string, any> = require(hebrewPath);
const greekDict: Record<string, any> = require(greekPath);

// ─── Helper: strip HTML tags from definitions ────────────────────────
function stripHtml(text: string | undefined | null): string | null {
    if (!text) return null;
    return text
        .replace(/<[^>]*>/g, "")   // Remove HTML tags
        .replace(/\s+/g, " ")      // Collapse whitespace
        .trim() || null;
}

// ─── Seed function ───────────────────────────────────────────────────
function seedStrongs() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Armor & Light — Strong's Concordance Seeder");
    console.log("═══════════════════════════════════════════════════════════\n");

    // Check for existing data
    const existingCount = (db.prepare("SELECT COUNT(*) as count FROM strongs_definitions").get() as any).count;
    if (existingCount > 0) {
        console.log(`⚠️  strongs_definitions already has ${existingCount} entries.`);
        console.log(`   Clearing existing data for fresh seed...\n`);
        db.exec("DELETE FROM strongs_definitions");
    }

    const insert = db.prepare(`
        INSERT INTO strongs_definitions 
            (strongs_number, language, original_word, transliteration, pronunciation, definition, kjv_usage, outline)
        VALUES 
            (@strongsNumber, @language, @originalWord, @transliteration, @pronunciation, @definition, @kjvUsage, @outline)
    `);

    let hebrewCount = 0;
    let greekCount = 0;
    let skippedCount = 0;

    const insertAll = db.transaction(() => {
        // ─── Hebrew entries ──────────────────────────────────
        console.log("📜 Seeding Hebrew definitions...");
        for (const [key, entry] of Object.entries(hebrewDict)) {
            if (!key.startsWith("H")) continue;  // Skip any non-entry keys

            const def = stripHtml(entry.strongs_def) || stripHtml(entry.kjv_def);
            if (!def) {
                skippedCount++;
                continue;
            }

            insert.run({
                strongsNumber: key,
                language: "hebrew",
                originalWord: entry.lemma || null,
                transliteration: entry.xlit || null,
                pronunciation: entry.pron || null,
                definition: def,
                kjvUsage: stripHtml(entry.kjv_def),
                outline: stripHtml(entry.derivation),
            });
            hebrewCount++;
        }
        console.log(`   ✅ ${hebrewCount} Hebrew entries inserted`);

        // ─── Greek entries ───────────────────────────────────
        console.log("📜 Seeding Greek definitions...");
        for (const [key, entry] of Object.entries(greekDict)) {
            if (!key.startsWith("G")) continue;  // Skip any non-entry keys

            const def = stripHtml(entry.strongs_def) || stripHtml(entry.kjv_def);
            if (!def) {
                skippedCount++;
                continue;
            }

            insert.run({
                strongsNumber: key,
                language: "greek",
                originalWord: entry.lemma || null,
                transliteration: entry.xlit || null,
                pronunciation: entry.pron || null,
                definition: def,
                kjvUsage: stripHtml(entry.kjv_def),
                outline: stripHtml(entry.derivation),
            });
            greekCount++;
        }
        console.log(`   ✅ ${greekCount} Greek entries inserted`);
    });

    // Execute the transaction
    const startTime = Date.now();
    insertAll();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // ─── Summary ─────────────────────────────────────────────
    const totalCount = (db.prepare("SELECT COUNT(*) as count FROM strongs_definitions").get() as any).count;

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  SEED COMPLETE");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`  Hebrew entries:  ${hebrewCount}`);
    console.log(`  Greek entries:   ${greekCount}`);
    console.log(`  Total in DB:     ${totalCount}`);
    console.log(`  Skipped (no def): ${skippedCount}`);
    console.log(`  Time elapsed:    ${elapsed}s`);
    console.log("═══════════════════════════════════════════════════════════\n");

    // ─── Sample output ───────────────────────────────────────
    console.log("📖 Sample entries:");
    const samples = db.prepare(
        "SELECT strongs_number, language, original_word, transliteration, substr(definition, 1, 80) as def_preview FROM strongs_definitions WHERE strongs_number IN ('H1', 'H430', 'G3056', 'G26')"
    ).all() as any[];

    for (const s of samples) {
        console.log(`   ${s.strongs_number} (${s.language}): ${s.original_word || '?'} [${s.transliteration || '?'}] — ${s.def_preview}...`);
    }
}

// ─── Run ─────────────────────────────────────────────────────────────
try {
    seedStrongs();
    db.close();
} catch (err) {
    console.error("❌ Seed failed:", err);
    db.close();
    process.exit(1);
}
