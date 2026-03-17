/**
 * Seed commentary for missing books — query what ranges we need
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

const missingBooks = [
    'ecclesiastes', 'song-of-solomon', 'isaiah', 'jeremiah',
    'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'jude'
];

for (const slug of missingBooks) {
    const book = db.prepare(`SELECT id, name, chapter_count FROM books WHERE slug = ?`).get(slug) as any;
    if (!book) { console.log(`NOT FOUND: ${slug}`); continue; }

    const chapters = db.prepare(`
        SELECT chapter, COUNT(*) as verse_count, MIN(id) as first_id, MAX(id) as last_id
        FROM verses WHERE book_id = ?
        GROUP BY chapter ORDER BY chapter
    `).all(book.id) as any[];

    console.log(`\n${book.name} (${slug}) — ${book.chapter_count} chapters, ${chapters.reduce((s: number, c: any) => s + c.verse_count, 0)} verses`);
    for (const ch of chapters) {
        console.log(`  Ch ${ch.chapter}: ${ch.verse_count} verses [IDs ${ch.first_id}–${ch.last_id}]`);
    }
}

db.close();
