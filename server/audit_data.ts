/**
 * Data quality audit script for cross-references and commentaries.
 * Run with: npx tsx server/audit_data.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

console.log("=== DATA VOLUME ===");
const counts = db.prepare(`
    SELECT 'verses' as tbl, COUNT(*) as cnt FROM verses
    UNION ALL SELECT 'books', COUNT(*) FROM books
    UNION ALL SELECT 'cross_references', COUNT(*) FROM cross_references
    UNION ALL SELECT 'commentaries', COUNT(*) FROM commentaries
    UNION ALL SELECT 'book_introductions', COUNT(*) FROM book_introductions
    UNION ALL SELECT 'strongs_definitions', COUNT(*) FROM strongs_definitions
`).all() as { tbl: string; cnt: number }[];
for (const r of counts) console.log(`  ${r.tbl}: ${r.cnt}`);

// ─── Cross-Reference Audit ──────────────────────────────────────────

console.log("\n=== CROSS-REFERENCE SAMPLE (first 30) ===");
const xrefSample = db.prepare(`
    SELECT
        cr.id,
        cr.from_verse_id,
        cr.to_verse_id,
        cr.votes,
        fb.name || ' ' || fv.chapter || ':' || fv.verse AS from_ref,
        SUBSTR(fv.text_web, 1, 80) AS from_text,
        tb.name || ' ' || tv.chapter || ':' || tv.verse AS to_ref,
        SUBSTR(tv.text_web, 1, 80) AS to_text
    FROM cross_references cr
    JOIN verses fv ON cr.from_verse_id = fv.id
    JOIN books fb ON fv.book_id = fb.id
    JOIN verses tv ON cr.to_verse_id = tv.id
    JOIN books tb ON tv.book_id = tb.id
    LIMIT 30
`).all() as any[];
for (const r of xrefSample) {
    console.log(`  [${r.id}] ${r.from_ref} → ${r.to_ref} (votes: ${r.votes})`);
    console.log(`    FROM: "${r.from_text}..."`);
    console.log(`    TO:   "${r.to_text}..."`);
}

// Check for self-referencing cross-refs
console.log("\n=== SELF-REFERENCING CROSS-REFS ===");
const selfRefs = db.prepare(`
    SELECT COUNT(*) as cnt FROM cross_references WHERE from_verse_id = to_verse_id
`).get() as { cnt: number };
console.log(`  Count: ${selfRefs.cnt}`);

// Check for orphan cross-refs (verse IDs that don't exist)
console.log("\n=== ORPHAN CROSS-REFS (broken verse IDs) ===");
const orphanFrom = db.prepare(`
    SELECT COUNT(*) as cnt FROM cross_references cr
    LEFT JOIN verses v ON cr.from_verse_id = v.id
    WHERE v.id IS NULL
`).get() as { cnt: number };
const orphanTo = db.prepare(`
    SELECT COUNT(*) as cnt FROM cross_references cr
    LEFT JOIN verses v ON cr.to_verse_id = v.id
    WHERE v.id IS NULL
`).get() as { cnt: number };
console.log(`  Orphan from_verse_id: ${orphanFrom.cnt}`);
console.log(`  Orphan to_verse_id: ${orphanTo.cnt}`);

// Check for duplicate cross-refs
console.log("\n=== DUPLICATE CROSS-REFS ===");
const dupes = db.prepare(`
    SELECT from_verse_id, to_verse_id, COUNT(*) as cnt
    FROM cross_references
    GROUP BY from_verse_id, to_verse_id
    HAVING cnt > 1
    LIMIT 20
`).all() as { from_verse_id: number; to_verse_id: number; cnt: number }[];
console.log(`  Duplicate pairs found: ${dupes.length}`);
for (const d of dupes) console.log(`    ${d.from_verse_id} → ${d.to_verse_id} (${d.cnt} times)`);

// Cross-ref distribution by book
console.log("\n=== CROSS-REF DISTRIBUTION (top 15 source books) ===");
const xrefDist = db.prepare(`
    SELECT b.name, COUNT(*) as cnt
    FROM cross_references cr
    JOIN verses v ON cr.from_verse_id = v.id
    JOIN books b ON v.book_id = b.id
    GROUP BY b.name
    ORDER BY cnt DESC
    LIMIT 15
`).all() as { name: string; cnt: number }[];
for (const r of xrefDist) console.log(`  ${r.name}: ${r.cnt}`);

// ─── Commentary Audit ───────────────────────────────────────────────

console.log("\n=== COMMENTARY SAMPLE (first 20) ===");
const commSample = db.prepare(`
    SELECT
        c.id,
        c.author,
        c.source,
        b.name || ' ' || v.chapter || ':' || v.verse AS verse_ref,
        SUBSTR(v.text_web, 1, 80) AS verse_text,
        SUBSTR(c.text, 1, 200) AS commentary_text
    FROM commentaries c
    JOIN verses v ON c.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    LIMIT 20
`).all() as any[];
for (const r of commSample) {
    console.log(`  [${r.id}] ${r.verse_ref} — Author: ${r.author} (${r.source || 'no source'})`);
    console.log(`    VERSE: "${r.verse_text}..."`);
    console.log(`    NOTE:  "${r.commentary_text}..."`);
    console.log("");
}

// Commentary authors distribution
console.log("\n=== COMMENTARY AUTHORS ===");
const authDist = db.prepare(`
    SELECT author, COUNT(*) as cnt
    FROM commentaries
    GROUP BY author
    ORDER BY cnt DESC
`).all() as { author: string; cnt: number }[];
for (const a of authDist) console.log(`  ${a.author}: ${a.cnt}`);

// Commentary coverage
console.log("\n=== COMMENTARY COVERAGE ===");
const coverage = db.prepare(`
    SELECT
        (SELECT COUNT(DISTINCT verse_id) FROM commentaries) as covered_verses,
        (SELECT COUNT(*) FROM verses) as total_verses
`).get() as { covered_verses: number; total_verses: number };
console.log(`  Verses with commentary: ${coverage.covered_verses} / ${coverage.total_verses} (${(coverage.covered_verses / coverage.total_verses * 100).toFixed(1)}%)`);

// Check for empty commentaries
console.log("\n=== EMPTY/BLANK COMMENTARIES ===");
const emptyComm = db.prepare(`
    SELECT COUNT(*) as cnt FROM commentaries WHERE text IS NULL OR TRIM(text) = ''
`).get() as { cnt: number };
console.log(`  Empty/blank: ${emptyComm.cnt}`);

// ─── Cross-ref thematic spot check ──────────────────────────────────────

console.log("\n=== SPOT CHECK: Well-known verse cross-refs ===");

// John 3:16
const john316 = db.prepare(`
    SELECT v.id FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = 'john' AND v.chapter = 3 AND v.verse = 16
`).get() as { id: number } | undefined;

if (john316) {
    const john316Refs = db.prepare(`
        SELECT tb.name || ' ' || tv.chapter || ':' || tv.verse AS ref, SUBSTR(tv.text_web, 1, 100) AS txt
        FROM cross_references cr
        JOIN verses tv ON cr.to_verse_id = tv.id
        JOIN books tb ON tv.book_id = tb.id
        WHERE cr.from_verse_id = ?
    `).all(john316.id) as { ref: string; txt: string }[];
    console.log(`\n  John 3:16 (id=${john316.id}) has ${john316Refs.length} cross-refs:`);
    for (const r of john316Refs) console.log(`    → ${r.ref}: "${r.txt}..."`);
}

// Romans 8:28
const rom828 = db.prepare(`
    SELECT v.id FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = 'romans' AND v.chapter = 8 AND v.verse = 28
`).get() as { id: number } | undefined;

if (rom828) {
    const rom828Refs = db.prepare(`
        SELECT tb.name || ' ' || tv.chapter || ':' || tv.verse AS ref, SUBSTR(tv.text_web, 1, 100) AS txt
        FROM cross_references cr
        JOIN verses tv ON cr.to_verse_id = tv.id
        JOIN books tb ON tv.book_id = tb.id
        WHERE cr.from_verse_id = ?
    `).all(rom828.id) as { ref: string; txt: string }[];
    console.log(`\n  Romans 8:28 (id=${rom828.id}) has ${rom828Refs.length} cross-refs:`);
    for (const r of rom828Refs) console.log(`    → ${r.ref}: "${r.txt}..."`);
}

// Genesis 1:1
const gen11 = db.prepare(`
    SELECT v.id FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = 'genesis' AND v.chapter = 1 AND v.verse = 1
`).get() as { id: number } | undefined;

if (gen11) {
    const gen11Refs = db.prepare(`
        SELECT tb.name || ' ' || tv.chapter || ':' || tv.verse AS ref, SUBSTR(tv.text_web, 1, 100) AS txt
        FROM cross_references cr
        JOIN verses tv ON cr.to_verse_id = tv.id
        JOIN books tb ON tv.book_id = tb.id
        WHERE cr.from_verse_id = ?
    `).all(gen11.id) as { ref: string; txt: string }[];
    console.log(`\n  Genesis 1:1 (id=${gen11.id}) has ${gen11Refs.length} cross-refs:`);
    for (const r of gen11Refs) console.log(`    → ${r.ref}: "${r.txt}..."`);
}

// Psalm 23:1
const ps231 = db.prepare(`
    SELECT v.id FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = 'psalms' AND v.chapter = 23 AND v.verse = 1
`).get() as { id: number } | undefined;

if (ps231) {
    const ps231Refs = db.prepare(`
        SELECT tb.name || ' ' || tv.chapter || ':' || tv.verse AS ref, SUBSTR(tv.text_web, 1, 100) AS txt
        FROM cross_references cr
        JOIN verses tv ON cr.to_verse_id = tv.id
        JOIN books tb ON tv.book_id = tb.id
        WHERE cr.from_verse_id = ?
    `).all(ps231.id) as { ref: string; txt: string }[];
    console.log(`\n  Psalm 23:1 (id=${ps231.id}) has ${ps231Refs.length} cross-refs:`);
    for (const r of ps231Refs) console.log(`    → ${r.ref}: "${r.txt}..."`);
}

// ─── Commentary spot check for well-known verses ──────────────────────

console.log("\n=== SPOT CHECK: Commentary on well-known verses ===");

const spotCheckVerses = [
    { slug: 'genesis', ch: 1, v: 1 },
    { slug: 'john', ch: 3, v: 16 },
    { slug: 'romans', ch: 8, v: 28 },
    { slug: 'psalms', ch: 23, v: 1 },
    { slug: 'ephesians', ch: 6, v: 11 },
    { slug: 'matthew', ch: 5, v: 3 },
];

for (const sv of spotCheckVerses) {
    const verse = db.prepare(`
        SELECT v.id, b.name || ' ' || v.chapter || ':' || v.verse AS ref, SUBSTR(v.text_web, 1, 100) AS txt
        FROM verses v JOIN books b ON v.book_id = b.id
        WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
    `).get(sv.slug, sv.ch, sv.v) as { id: number; ref: string; txt: string } | undefined;

    if (!verse) { console.log(`  ${sv.slug} ${sv.ch}:${sv.v} NOT FOUND`); continue; }

    const comms = db.prepare(`
        SELECT author, SUBSTR(text, 1, 250) AS txt FROM commentaries WHERE verse_id = ?
    `).all(verse.id) as { author: string; txt: string }[];

    console.log(`\n  ${verse.ref}: "${verse.txt}..."`);
    if (comms.length === 0) {
        console.log(`    ⚠ NO COMMENTARY`);
    } else {
        for (const c of comms) {
            console.log(`    [${c.author}] "${c.txt}..."`);
        }
    }
}

// ─── Random sampling of cross-refs for thematic relevance ──────────

console.log("\n=== RANDOM CROSS-REF SAMPLE (10 random pairs for thematic review) ===");
const randomXrefs = db.prepare(`
    SELECT
        fb.name || ' ' || fv.chapter || ':' || fv.verse AS from_ref,
        SUBSTR(fv.text_web, 1, 120) AS from_text,
        tb.name || ' ' || tv.chapter || ':' || tv.verse AS to_ref,
        SUBSTR(tv.text_web, 1, 120) AS to_text
    FROM cross_references cr
    JOIN verses fv ON cr.from_verse_id = fv.id
    JOIN books fb ON fv.book_id = fb.id
    JOIN verses tv ON cr.to_verse_id = tv.id
    JOIN books tb ON tv.book_id = tb.id
    ORDER BY RANDOM()
    LIMIT 10
`).all() as any[];
for (const r of randomXrefs) {
    console.log(`\n  ${r.from_ref} → ${r.to_ref}`);
    console.log(`    FROM: "${r.from_text}"`);
    console.log(`    TO:   "${r.to_text}"`);
}

db.close();
console.log("\n=== AUDIT COMPLETE ===");
