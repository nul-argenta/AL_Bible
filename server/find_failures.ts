/**
 * Find all verses that failed or are missing commentary, then list them.
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

// 1. Failed in AI pass log
console.log("=== FAILED in global_ai_pass_log ===");
const failed = db.prepare(`
    SELECT l.verse_id, l.status, b.name || ' ' || v.chapter || ':' || v.verse AS ref
    FROM global_ai_pass_log l
    JOIN verses v ON l.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE l.status = 'FAILED'
    ORDER BY v.id
`).all() as any[];
console.log(`Count: ${failed.length}`);
for (const f of failed) {
    console.log(`  ${f.ref} (verse_id: ${f.verse_id})`);
}

// 2. Verses with NO commentary at all
console.log("\n=== VERSES WITH NO COMMENTARY ===");
const noComm = db.prepare(`
    SELECT v.id, b.name || ' ' || v.chapter || ':' || v.verse AS ref, b.slug, v.chapter, v.verse
    FROM verses v
    JOIN books b ON v.book_id = b.id
    LEFT JOIN commentaries c ON c.verse_id = v.id
    WHERE c.id IS NULL
    ORDER BY v.id
`).all() as any[];
console.log(`Count: ${noComm.length}`);
for (const n of noComm) {
    console.log(`  ${n.ref} (verse_id: ${n.id})`);
}

// 3. Verses with empty/blank commentary
console.log("\n=== VERSES WITH EMPTY COMMENTARY ===");
const emptyComm = db.prepare(`
    SELECT v.id, b.name || ' ' || v.chapter || ':' || v.verse AS ref, c.text
    FROM commentaries c
    JOIN verses v ON c.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE c.text IS NULL OR TRIM(c.text) = ''
    ORDER BY v.id
`).all() as any[];
console.log(`Count: ${emptyComm.length}`);
for (const e of emptyComm) {
    console.log(`  ${e.ref} (verse_id: ${e.id})`);
}

// 4. Verses with very short commentary (< 50 chars, possibly truncated)
console.log("\n=== VERSES WITH SUSPICIOUSLY SHORT COMMENTARY (<100 chars) ===");
const shortComm = db.prepare(`
    SELECT v.id, b.name || ' ' || v.chapter || ':' || v.verse AS ref, LENGTH(c.text) as len, SUBSTR(c.text, 1, 100) as preview
    FROM commentaries c
    JOIN verses v ON c.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE LENGTH(c.text) < 100
    ORDER BY LENGTH(c.text) ASC
`).all() as any[];
console.log(`Count: ${shortComm.length}`);
for (const s of shortComm) {
    console.log(`  ${s.ref} (${s.len} chars): "${s.preview}"`);
}

// 5. Summary stats
console.log("\n=== SUMMARY ===");
const total = (db.prepare("SELECT COUNT(*) as c FROM verses").get() as any).c;
const withComm = (db.prepare("SELECT COUNT(DISTINCT verse_id) as c FROM commentaries").get() as any).c;
console.log(`Total verses: ${total}`);
console.log(`Verses with commentary: ${withComm}`);
console.log(`Verses missing commentary: ${total - withComm}`);
console.log(`Failed in AI log: ${failed.length}`);
console.log(`Combined unique issues: ${new Set([...failed.map((f: any) => f.verse_id), ...noComm.map((n: any) => n.id), ...emptyComm.map((e: any) => e.id)]).size}`);

db.close();
