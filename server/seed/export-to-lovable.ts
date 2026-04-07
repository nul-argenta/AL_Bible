import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");
const EXPORT_DIR = path.resolve(__dirname, "../../exports");

if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

function escapeCsv(val: any) {
    if (val === null || val === undefined) return "";
    let str = String(val);
    if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, "\"\"")}"`;
    }
    return str;
}

async function exportToLovable() {
    console.log("🚀 Starting export to Lovable...");

    // 1. Export Books
    console.log("📦 Exporting books...");
    const books = db.prepare("SELECT * FROM books ORDER BY book_order").all();
    if (books.length > 0) {
        const headers = Object.keys(books[0]);
        const csvContent = [
            headers.join(","),
            ...books.map((row: any) => headers.map(h => escapeCsv(row[h])).join(","))
        ].join("\n");
        fs.writeFileSync(path.join(EXPORT_DIR, "lovable_books.csv"), csvContent);
        console.log(`✅ Exported ${books.length} books to lovable_books.csv`);
    }

    // 2. Export Verses
    console.log("📖 Exporting verses (this may take a moment)...");
    const verses = db.prepare(`
        SELECT v.id, b.slug as book_slug, v.chapter, v.verse, 
               v.text_web, v.text_kjv, v.text_spanish, v.text_arabic, 
               v.text_portuguese, v.text_chinese
        FROM verses v
        JOIN books b ON v.book_id = b.id
        ORDER BY v.id
    `).all();
    if (verses.length > 0) {
        const headers = Object.keys(verses[0]);
        const csvContent = [
            headers.join(","),
            ...verses.map((row: any) => headers.map(h => escapeCsv(row[h])).join(","))
        ].join("\n");
        fs.writeFileSync(path.join(EXPORT_DIR, "lovable_verses.csv"), csvContent);
        console.log(`✅ Exported ${verses.length} verses to lovable_verses.csv`);
    }

    // 3. Export Commentaries
    console.log("📝 Exporting commentaries...");
    const commentaries = db.prepare(`
        SELECT c.id, b.slug as book_slug, v.chapter, v.verse, c.author, c.text, c.source
        FROM commentaries c
        JOIN verses v ON c.verse_id = v.id
        JOIN books b ON v.book_id = b.id
        ORDER BY c.id
    `).all();
    if (commentaries.length > 0) {
        const headers = Object.keys(commentaries[0]);
        const csvContent = [
            headers.join(","),
            ...commentaries.map((row: any) => headers.map(h => escapeCsv(row[h])).join(","))
        ].join("\n");
        fs.writeFileSync(path.join(EXPORT_DIR, "lovable_commentaries.csv"), csvContent);
        console.log(`✅ Exported ${commentaries.length} commentaries to lovable_commentaries.csv`);
    }

    console.log("\n🎉 Export complete! Files are in the /exports directory.");
    db.close();
}

exportToLovable().catch(console.error);
