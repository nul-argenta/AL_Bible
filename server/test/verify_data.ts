import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/armorlight.db");
const db = new Database(dbPath);

interface CountResult {
    c: number;
}

function runVerification() {
    console.log("🔍 Starting Data Verification...");

    // 1. Books
    const bookCount = (db.prepare("SELECT COUNT(*) as c FROM books").get() as CountResult).c;
    console.log(`Books: ${bookCount} (Expected: 66) - ${bookCount === 66 ? "✅" : "❌"}`);

    // 2. Verses
    const verseCount = (db.prepare("SELECT COUNT(*) as c FROM verses").get() as CountResult).c;
    console.log(`Verses: ${verseCount} (Expected: ~31098) - ${verseCount >= 31090 ? "✅" : "❌"}`);

    // 3. Translations
    const webCount = (db.prepare("SELECT COUNT(*) as c FROM verses WHERE text_web IS NOT NULL").get() as CountResult).c;
    const kjvCount = (db.prepare("SELECT COUNT(*) as c FROM verses WHERE text_kjv IS NOT NULL").get() as CountResult).c;
    console.log(`WEB Verses: ${webCount} - ${webCount === verseCount ? "✅" : "❌"}`);
    console.log(`KJV Verses: ${kjvCount} - ${kjvCount >= 31090 ? "✅" : "❌"}`);

    // 4. Strongs
    const strongsCount = (db.prepare("SELECT COUNT(*) as c FROM strongs_definitions").get() as CountResult).c;
    console.log(`Strong's Definitions: ${strongsCount} (Expected: ~14000) - ${strongsCount > 14000 ? "✅" : "❌"}`);

    // 5. Cross Refs
    const crossRefCount = (db.prepare("SELECT COUNT(*) as c FROM cross_references").get() as CountResult).c;
    console.log(`Cross References: ${crossRefCount} (Expected: >300000) - ${crossRefCount > 300000 ? "✅" : "❌"}`);

    // 6. Commentaries
    const commCount = (db.prepare("SELECT COUNT(*) as c FROM commentaries").get() as CountResult).c;
    console.log(`Commentaries: ${commCount} (Expected: >20000) - ${commCount > 20000 ? "✅" : "❌"}`);

    // 7. Book Introductions
    const introCount = (db.prepare("SELECT COUNT(*) as c FROM book_introductions").get() as CountResult).c;
    console.log(`Book Introductions: ${introCount} (Expected: 66) - ${introCount === 66 ? "✅" : "❌"}`);

    console.log("\nVerification Complete.");
}

runVerification();
