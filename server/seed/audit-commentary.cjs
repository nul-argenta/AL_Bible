const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.resolve(__dirname, "../../data/armorlight.db"));

const rows = db.prepare(`
    SELECT b.name, b.slug,
           COUNT(DISTINCT v.id) as total_verses,
           COUNT(DISTINCT c.verse_id) as covered_verses,
           ROUND(COUNT(DISTINCT c.verse_id)*100.0/COUNT(DISTINCT v.id), 1) as pct
    FROM books b
    JOIN verses v ON v.book_id = b.id
    LEFT JOIN commentaries c ON c.verse_id = v.id
    GROUP BY b.id
    ORDER BY pct ASC, b.id
`).all();

let incomplete = 0;
for (const r of rows) {
    if (r.pct < 100) {
        console.log(`${r.name}: ${r.covered_verses}/${r.total_verses} (${r.pct}%)`);
        incomplete++;
    }
}

if (incomplete === 0) {
    console.log("ALL 66 BOOKS AT 100% COVERAGE!");
} else {
    console.log(`\n${incomplete} books below 100%`);
}

const total = db.prepare("SELECT COUNT(*) as cnt FROM commentaries").get();
console.log(`\nTotal commentary entries: ${total.cnt}`);

// Check popular verses
console.log("\n=== Popular Verse Spot Check ===");
const popular = [
    ["john", 3, 16], ["psalms", 23, 1], ["psalms", 23, 4],
    ["jeremiah", 29, 11], ["isaiah", 40, 31], ["isaiah", 53, 5],
    ["philippians", 4, 13], ["romans", 8, 28], ["proverbs", 3, 5],
    ["matthew", 28, 19], ["genesis", 1, 1], ["revelation", 21, 4],
];

for (const [slug, ch, v] of popular) {
    const vid = db.prepare(
        "SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?"
    ).get(slug, ch, v);
    if (!vid) { console.log(`  ${slug} ${ch}:${v} — VERSE NOT FOUND`); continue; }
    const cnt = db.prepare("SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?").get(vid.id);
    const status = cnt.cnt > 0 ? "✓" : "⚠ MISSING";
    console.log(`  ${slug} ${ch}:${v} — ${status} (${cnt.cnt} entries)`);
}

db.close();
