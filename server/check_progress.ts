import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

// Total verses
const total = db.prepare("SELECT COUNT(*) as c FROM verses").get() as any;
console.log(`Total verses: ${total.c}`);

// Commentary stats
const comms = db.prepare("SELECT COUNT(*) as c FROM commentaries").get() as any;
console.log(`Total commentary rows: ${comms.c}`);

const distinct = db.prepare("SELECT COUNT(DISTINCT verse_id) as c FROM commentaries").get() as any;
console.log(`Verses with commentary: ${distinct.c} / ${total.c} (${(distinct.c / total.c * 100).toFixed(1)}%)`);

// By source
console.log("\n=== Commentary by Source ===");
const sources = db.prepare("SELECT source, author, COUNT(*) as c FROM commentaries GROUP BY source, author ORDER BY c DESC").all() as any[];
for (const s of sources) {
    console.log(`  ${s.author} [${s.source}]: ${s.c} entries`);
}

// AI Pass log
try {
    const logStats = db.prepare("SELECT status, COUNT(*) as c FROM global_ai_pass_log GROUP BY status").all() as any[];
    console.log("\n=== Global AI Pass Progress ===");
    for (const l of logStats) {
        console.log(`  ${l.status}: ${l.c}`);
    }
    const pct = logStats.reduce((s: number, l: any) => l.status === 'COMPLETED' ? s + l.c : s, 0);
    console.log(`  Progress: ${pct} / ${total.c} (${(pct / total.c * 100).toFixed(1)}%)`);
} catch {
    console.log("\n=== Global AI Pass: No log table found (not yet started) ===");
}

// Books with 0 commentary
console.log("\n=== Books with NO commentary ===");
const missing = db.prepare(`
    SELECT b.name, b.slug, COUNT(v.id) as verse_count
    FROM books b
    JOIN verses v ON v.book_id = b.id
    LEFT JOIN commentaries c ON c.verse_id = v.id
    GROUP BY b.id
    HAVING COUNT(c.id) = 0
    ORDER BY b.book_order
`).all() as any[];
if (missing.length === 0) {
    console.log("  All books have at least some commentary!");
} else {
    for (const m of missing) {
        console.log(`  ${m.name} (${m.verse_count} verses)`);
    }
}

// Books with partial commentary  
console.log("\n=== Commentary Coverage by Book ===");
const coverage = db.prepare(`
    SELECT b.name, COUNT(v.id) as total_verses, COUNT(c.id) as comm_count,
           COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN v.id END) as covered_verses
    FROM books b
    JOIN verses v ON v.book_id = b.id
    LEFT JOIN commentaries c ON c.verse_id = v.id
    GROUP BY b.id
    ORDER BY b.book_order
`).all() as any[];
for (const c of coverage) {
    const pct = (c.covered_verses / c.total_verses * 100).toFixed(0);
    const bar = pct === "0" ? "❌" : Number(pct) >= 90 ? "✅" : "🟡";
    console.log(`  ${bar} ${c.name}: ${c.covered_verses}/${c.total_verses} verses (${pct}%) — ${c.comm_count} entries`);
}

db.close();
