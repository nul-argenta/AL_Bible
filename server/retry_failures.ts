/**
 * Retry all failed, missing, and truncated commentary entries.
 * Clears failed log entries, then re-processes them + any verse missing/short commentary.
 */
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("❌ No GEMINI_API_KEY"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are an expert biblical theologian and database curator for Armor & Light.
You will be provided with a bible verse (and its surrounding context).

Your goal is twofold:
1. Provide a rich, profound, scholarly commentary based on the style of Matthew Henry, but expanded for modern deep study. Focus on the original Hebrew/Greek nuance, theological significance, and practical application. (Write 1-3 thorough paragraphs).
2. Recommend exactly 3 highly relevant cross-references for this verse.

Respond using the provided JSON schema.
`;

const schemaDefinition = {
    type: Type.OBJECT,
    properties: {
        commentary: {
            type: Type.STRING,
            description: "Deep, scholars-level theological commentary for this verse (1-3 paragraphs)."
        },
        crossReferences: {
            type: Type.ARRAY,
            description: "An array of exactly 3 highly relevant cross-reference verse IDs",
            items: {
                type: Type.OBJECT,
                properties: {
                    reference: { type: Type.STRING, description: "e.g., 'John 1:1'" },
                    reasoning: { type: Type.STRING, description: "Why this connects theologically to the target verse." }
                },
                required: ["reference", "reasoning"]
            }
        }
    },
    required: ["commentary", "crossReferences"]
};

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processVerse(verseRow: any, retries = 3): Promise<boolean> {
    const { id, text_web, ref } = verseRow;
    console.log(`[PROCESS] ${ref}...`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Target Verse: ${ref}\nText: "${text_web}"\n\nPlease evaluate this verse.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: schemaDefinition as any
            }
        });

        const data = JSON.parse(response.text || "{}");

        if (!data.commentary || data.commentary.length < 100) {
            if (retries > 0) {
                console.log(`  [RETRY] Response too short (${data.commentary?.length || 0} chars). Retrying...`);
                await sleep(2000);
                return processVerse(verseRow, retries - 1);
            }
            console.log(`  [WARN] Still short after retries: ${data.commentary?.length || 0} chars`);
        }

        if (data.commentary) {
            const existing = db.prepare(`SELECT id FROM commentaries WHERE verse_id = ?`).get(id) as { id: number } | undefined;
            if (existing) {
                db.prepare(`UPDATE commentaries SET text = ?, author = 'Armor & Light', source = 'Scholarly Commentary' WHERE id = ?`).run(data.commentary, existing.id);
            } else {
                db.prepare(`INSERT INTO commentaries (verse_id, author, text, source) VALUES (?, 'Armor & Light', ?, 'Scholarly Commentary')`).run(id, data.commentary);
            }
            db.prepare(`INSERT OR REPLACE INTO global_ai_pass_log (verse_id, status) VALUES (?, 'COMPLETED')`).run(id);
            console.log(`  [SUCCESS] ${ref} (${data.commentary.length} chars)`);
            return true;
        }
        return false;
    } catch (error: any) {
        if (error.status === 429 && retries > 0) {
            console.log(`  [RETRY] Rate limit. Waiting 10s...`);
            await sleep(10000);
            return processVerse(verseRow, retries - 1);
        }
        if (error.status === 503 && retries > 0) {
            console.log(`  [RETRY] Server overload. Waiting 5s...`);
            await sleep(5000);
            return processVerse(verseRow, retries - 1);
        }
        console.error(`  [ERROR] ${ref}: ${error.message?.substring(0, 100)}`);
        return false;
    }
}

async function main() {
    // 1. Collect all verse IDs that need work
    const verseIds = new Set<number>();

    // Failed in AI pass log
    const failed = db.prepare(`SELECT verse_id FROM global_ai_pass_log WHERE status = 'FAILED'`).all() as any[];
    for (const f of failed) verseIds.add(f.verse_id);

    // Missing commentary entirely
    const missing = db.prepare(`
        SELECT v.id FROM verses v LEFT JOIN commentaries c ON c.verse_id = v.id WHERE c.id IS NULL
    `).all() as any[];
    for (const m of missing) verseIds.add(m.id);

    // Truncated commentary (< 100 chars)
    const truncated = db.prepare(`
        SELECT v.id FROM commentaries c JOIN verses v ON c.verse_id = v.id WHERE LENGTH(c.text) < 100
    `).all() as any[];
    for (const t of truncated) verseIds.add(t.id);

    console.log(`=== Retry Pass: ${verseIds.size} unique verses to process ===\n`);

    // Clear failed entries so they can be retried
    db.prepare(`DELETE FROM global_ai_pass_log WHERE status = 'FAILED'`).run();
    console.log("Cleared FAILED entries from log.\n");

    // Fetch verse data
    const versesToProcess = db.prepare(`
        SELECT v.id, v.text_web, b.name || ' ' || v.chapter || ':' || v.verse AS ref
        FROM verses v JOIN books b ON v.book_id = b.id
        WHERE v.id IN (${[...verseIds].join(',')})
        ORDER BY v.id
    `).all() as any[];

    let success = 0;
    let fail = 0;

    // Process one at a time with a small delay (more conservative to avoid 503s)
    for (const verse of versesToProcess) {
        const ok = await processVerse(verse);
        if (ok) success++;
        else fail++;
        await sleep(1000); // 1 second between requests
    }

    console.log(`\n=== RETRY COMPLETE ===`);
    console.log(`  Success: ${success}`);
    console.log(`  Failed:  ${fail}`);
    console.log(`  Total:   ${versesToProcess.length}`);

    // Final check
    const noComm = (db.prepare(`SELECT COUNT(*) as c FROM verses v LEFT JOIN commentaries c ON c.verse_id = v.id WHERE c.id IS NULL`).get() as any).c;
    const shortComm = (db.prepare(`SELECT COUNT(*) as c FROM commentaries WHERE LENGTH(text) < 100`).get() as any).c;
    console.log(`\n  Remaining without commentary: ${noComm}`);
    console.log(`  Remaining with short commentary: ${shortComm}`);

    db.close();
}

main().catch(console.error);
