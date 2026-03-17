import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../../data/armorlight.db");
const db = new Database(dbPath);

function runPerfCheck() {
    console.log("🏎️  Starting Performance Check...");

    const query = `
        SELECT v.*, 
          COALESCE(v.text_web, v.text_kjv) as text_primary,
          b.name as book_name, b.slug as book_slug
        FROM verses v
        JOIN books b ON v.book_id = b.id
        WHERE b.slug = 'genesis' AND v.chapter = 1
        ORDER BY v.verse
    `;

    const plan = db.prepare(`EXPLAIN QUERY PLAN ${query}`).all();

    console.log("\n--- Query Plan ---");
    plan.forEach((row: any) => {
        console.log(row.detail);
    });

    console.log("\n--- Analysis ---");
    const fullScan = plan.some((row: any) => row.detail.includes("SCAN TABLE verses"));
    if (fullScan) {
        console.log("⚠️  WARNING: Full table scan detected on 'verses'.");
        console.log("    Recommendation: Add index on verses(book_id, chapter).");
    } else {
        console.log("✅  Index usage detected (likely auto-index or partial).");
    }
}

runPerfCheck();
