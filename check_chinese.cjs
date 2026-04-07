const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.resolve("data/armorlight.db");
const db = new Database(DB_PATH);

try {
    const row = db.prepare("SELECT COUNT(*) as count FROM verses WHERE text_chinese IS NOT NULL AND text_chinese != ''").get();
    console.log(`Count of verses with Chinese text: ${row.count}`);
    
    if (row.count && row.count > 0) {
        const samples = db.prepare("SELECT text_chinese FROM verses WHERE text_chinese IS NOT NULL AND text_chinese != '' LIMIT 5").all();
        console.log("Samples:");
        samples.forEach((s, i) => console.log(`${i+1}: ${s.text_chinese}`));
    } else {
        console.log("No Chinese text found in verses table.");
    }
} catch (err) {
    console.error("Error:", err);
} finally {
    db.close();
}
