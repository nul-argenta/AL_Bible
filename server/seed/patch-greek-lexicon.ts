import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = path.resolve(__dirname, "../../data", "armorlight.db");
const db = new Database(DB_PATH);
const require = createRequire(import.meta.url);

async function patchGreek() {
    console.log("Fetching live Greek dictionary from OpenScriptures master branch...");
    const url = "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js";
    const jsText = await fetch(url).then(r => r.text());

    const tempPath = path.resolve(__dirname, "temp-greek.cjs");
    // The downloaded file starts with "var strongsGreekDictionary = { ... };"
    // Attach an export statement so we can require it as a commonjs module:
    fs.writeFileSync(tempPath, jsText + "\nmodule.exports = strongsGreekDictionary;");

    let greekDict;
    try {
        greekDict = require(tempPath);
    } catch (e: any) {
        console.error("Failed to parse the JS file:", e.message);
        return;
    } finally {
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }

    const updateStmt = db.prepare(`
        UPDATE strongs_definitions 
        SET transliteration = ?, pronunciation = ? 
        WHERE strongs_number = ?
    `);

    let updatedCount = 0;
    let missingPron = 0;

    const tx = db.transaction(() => {
        for (const [strongs, entry] of Object.entries(greekDict) as any[]) {
            const translit = entry.translit || null;
            const pron = entry.pron || null; // Might not exist

            if (translit || pron) {
                updateStmt.run(translit, pron, strongs);
                updatedCount++;
            }
            if (!pron) {
                missingPron++;
            }
        }
    });

    tx();
    console.log(`Successfully patched ${updatedCount} Greek entries with transliteration/pronunciation.`);
    console.log(`Note: ${missingPron} out of ${Object.keys(greekDict).length} entries in the master repo are missing explicit phonetic pronunciation.`);
}

patchGreek().catch(console.error).finally(() => db.close());
