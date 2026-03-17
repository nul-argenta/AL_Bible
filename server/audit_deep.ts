/**
 * Deep dive audit: self-referencing cross-refs + commentary gap analysis
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

// ─── Self-referencing cross-refs ────────────────────────────────────
console.log("=== SELF-REFERENCING CROSS-REFS (all 45) ===");
const selfRefs = db.prepare(`
    SELECT cr.id, cr.from_verse_id, cr.votes,
           b.name || ' ' || v.chapter || ':' || v.verse AS ref
    FROM cross_references cr
    JOIN verses v ON cr.from_verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE cr.from_verse_id = cr.to_verse_id
    ORDER BY b.book_order, v.chapter, v.verse
`).all() as any[];
for (const r of selfRefs) {
    console.log(`  [${r.id}] ${r.ref} → ITSELF (votes: ${r.votes})`);
}

// ─── Commentary gaps for high-traffic chapters ──────────────────────
console.log("\n=== COMMENTARY GAPS: Books with lowest coverage ===");
const bookGaps = db.prepare(`
    SELECT b.name, b.slug,
           COUNT(v.id) as total_verses,
           COUNT(c.id) as covered,
           ROUND(100.0 * COUNT(c.id) / COUNT(v.id), 1) as pct
    FROM books b
    JOIN verses v ON v.book_id = b.id
    LEFT JOIN commentaries c ON c.verse_id = v.id
    GROUP BY b.id
    ORDER BY pct ASC
    LIMIT 15
`).all() as any[];
for (const r of bookGaps) {
    console.log(`  ${r.name}: ${r.covered}/${r.total_verses} (${r.pct}%)`);
}

// ─── Specific VerseID checks for missing commentaries on popular verses ──
console.log("\n=== COMMENTARY GAPS: Popular verses without commentary ===");
const popularVerses = [
    { slug: 'john', ch: 3, v: 16 },
    { slug: 'psalms', ch: 23, v: 1 },
    { slug: 'psalms', ch: 23, v: 4 },
    { slug: 'psalms', ch: 46, v: 10 },
    { slug: 'psalms', ch: 119, v: 105 },
    { slug: 'john', ch: 14, v: 6 },
    { slug: 'john', ch: 1, v: 1 },
    { slug: 'matthew', ch: 28, v: 19 },
    { slug: 'matthew', ch: 6, v: 9 },
    { slug: 'jeremiah', ch: 29, v: 11 },
    { slug: 'philippians', ch: 4, v: 13 },
    { slug: 'joshua', ch: 1, v: 9 },
    { slug: 'isaiah', ch: 40, v: 31 },
    { slug: 'proverbs', ch: 3, v: 5 },
    { slug: 'romans', ch: 12, v: 2 },
    { slug: 'galatians', ch: 5, v: 22 },
    { slug: 'hebrews', ch: 11, v: 1 },
    { slug: '2-timothy', ch: 3, v: 16 },
    { slug: 'revelation', ch: 21, v: 4 },
    { slug: '1-corinthians', ch: 13, v: 4 },
];

for (const pv of popularVerses) {
    const verse = db.prepare(`
        SELECT v.id, b.name || ' ' || v.chapter || ':' || v.verse AS ref
        FROM verses v JOIN books b ON v.book_id = b.id
        WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
    `).get(pv.slug, pv.ch, pv.v) as { id: number; ref: string } | undefined;

    if (!verse) { console.log(`  NOT FOUND: ${pv.slug} ${pv.ch}:${pv.v}`); continue; }

    const comm = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?`).get(verse.id) as { cnt: number };
    const xrefs = db.prepare(`SELECT COUNT(*) as cnt FROM cross_references WHERE from_verse_id = ?`).get(verse.id) as { cnt: number };

    const status = comm.cnt > 0 ? "✓" : "⚠ NO COMMENTARY";
    console.log(`  ${verse.ref} — Commentary: ${status} | Cross-refs: ${xrefs.cnt}`);
}

// ─── Cross-refs where both verses have the same text (possible error) ──
console.log("\n=== CROSS-REFS WITH IDENTICAL TEXT (potential copy errors) ===");
const identicalText = db.prepare(`
    SELECT
        fb.name || ' ' || fv.chapter || ':' || fv.verse AS from_ref,
        tb.name || ' ' || tv.chapter || ':' || tv.verse AS to_ref,
        fv.text_web
    FROM cross_references cr
    JOIN verses fv ON cr.from_verse_id = fv.id
    JOIN books fb ON fv.book_id = fb.id
    JOIN verses tv ON cr.to_verse_id = tv.id
    JOIN books tb ON tv.book_id = tb.id
    WHERE fv.text_web = tv.text_web AND fv.text_web IS NOT NULL
    LIMIT 20
`).all() as any[];
console.log(`  Found: ${identicalText.length}`);
for (const r of identicalText) {
    console.log(`  ${r.from_ref} → ${r.to_ref}: "${(r.text_web || '').slice(0, 80)}..."`);
}

// ─── Commentary that doesn't mention the verse's key terms ──────────
console.log("\n=== COMMENTARY RELEVANCE CHECK (sample of 10 random) ===");
const randComms = db.prepare(`
    SELECT
        b.name || ' ' || v.chapter || ':' || v.verse AS ref,
        SUBSTR(v.text_web, 1, 150) AS verse_text,
        SUBSTR(c.text, 1, 300) AS comm_text
    FROM commentaries c
    JOIN verses v ON c.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    ORDER BY RANDOM()
    LIMIT 10
`).all() as any[];
for (const r of randComms) {
    console.log(`\n  ${r.ref}`);
    console.log(`    VERSE: "${r.verse_text}"`);
    console.log(`    COMMENTARY: "${r.comm_text}"`);
}

// ─── Cross-refs spanning OT→NT and NT→OT (should exist for prophecy fulfillment) ──
console.log("\n=== OT→NT AND NT→OT CROSS-REFS ===");
const otNt = db.prepare(`
    SELECT COUNT(*) as cnt FROM cross_references cr
    JOIN verses fv ON cr.from_verse_id = fv.id
    JOIN books fb ON fv.book_id = fb.id
    JOIN verses tv ON cr.to_verse_id = tv.id
    JOIN books tb ON tv.book_id = tb.id
    WHERE fb.testament = 'OT' AND tb.testament = 'NT'
`).get() as { cnt: number };
const ntOt = db.prepare(`
    SELECT COUNT(*) as cnt FROM cross_references cr
    JOIN verses fv ON cr.from_verse_id = fv.id
    JOIN books fb ON fv.book_id = fb.id
    JOIN verses tv ON cr.to_verse_id = tv.id
    JOIN books tb ON tv.book_id = tb.id
    WHERE fb.testament = 'NT' AND tb.testament = 'OT'
`).get() as { cnt: number };
console.log(`  OT → NT: ${otNt.cnt}`);
console.log(`  NT → OT: ${ntOt.cnt}`);

// ─── Verses with no cross-refs at all ───────────────────────────────
console.log("\n=== VERSES WITH ZERO CROSS-REFS ===");
const noXrefs = db.prepare(`
    SELECT COUNT(*) as cnt FROM verses v
    LEFT JOIN cross_references cr ON cr.from_verse_id = v.id
    WHERE cr.id IS NULL
`).get() as { cnt: number };
console.log(`  Verses with no cross-refs: ${noXrefs.cnt} / 31098`);

db.close();
console.log("\n=== DEEP AUDIT COMPLETE ===");
