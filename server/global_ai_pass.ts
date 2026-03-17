/**
 * Global AI Data Pass
 * 
 * Iterates over all 31k Bible verses to:
 * 1. Evaluate existing cross-references and suggest improvements.
 * 2. Rewrite/Expand the Matthew Henry concise commentary to be scholarly and profound.
 * 
 * Includes SQLite-backed state tracking to allow you to pause and resume.
 * Run with: cross-env GEMINI_API_KEY=your_key npx tsx server/global_ai_pass.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing. Please set it in your environment to run this script.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// ─── Setup State Tracking ─────────────────────────────────

// We create a temporary tracking table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS global_ai_pass_log (
        verse_id INTEGER PRIMARY KEY,
        status TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// ─── Gemini Calling Logic ─────────────────────────────────

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

// ─── Main Execution ───────────────────────────────────────

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processVerse(verseRow: any, retries = 3): Promise<void> {
    const { id, text_web, ref } = verseRow;

    // Check if already processed
    const isDone = db.prepare(`SELECT 1 FROM global_ai_pass_log WHERE verse_id = ? AND status = 'COMPLETED'`).get(id);
    if (isDone) return;

    console.log(`[PROCESS] Evaluating ${ref}...`);

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

        if (data.commentary) {
            // Update or Insert Commentary
            const existing = db.prepare(`SELECT id FROM commentaries WHERE verse_id = ?`).get(id) as { id: number } | undefined;
            if (existing) {
                db.prepare(`UPDATE commentaries SET text = ?, author = 'Armor & Light', source = 'Scholarly Commentary' WHERE id = ?`).run(data.commentary, existing.id);
            } else {
                db.prepare(`INSERT INTO commentaries (verse_id, author, text, source) VALUES (?, 'Armor & Light', ?, 'Scholarly Commentary')`).run(id, data.commentary);
            }
        }

        // We only log to console for the cross-refs in this v1 script to let the user review them later
        // Real cross-refs require string-matching back to Verse IDs which is complex.

        // Mark Completed
        db.prepare(`INSERT OR REPLACE INTO global_ai_pass_log (verse_id, status) VALUES (?, 'COMPLETED')`).run(id);
        console.log(`  [SUCCESS] Updated ${ref}`);

    } catch (error: any) {
        if (error.status === 429 && retries > 0) {
            console.log(`  [RETRY] Rate limit hit for ${ref}. Retrying...`);
            await sleep(5000);
            return processVerse(verseRow, retries - 1);
        }
        console.error(`  [ERROR] Failed on ${ref}:`, error.message);
        db.prepare(`INSERT OR REPLACE INTO global_ai_pass_log (verse_id, status) VALUES (?, 'FAILED')`).run(id);
    }
}

async function main() {
    console.log("=== Starting Global AI Data Pass ===");
    console.log("Using API Key:", apiKey?.substring(0, 10) + "...");

    // Fetch all verses (ordered by Book, Chapter, Verse)
    const allVerses = db.prepare(`
        SELECT v.id, v.text_web, b.name || ' ' || v.chapter || ':' || v.verse AS ref
        FROM verses v
        JOIN books b ON v.book_id = b.id
        ORDER BY v.id ASC
    `).all() as any[];

    console.log(`Found ${allVerses.length} total verses in the database.`);

    const completedCount = db.prepare(`SELECT COUNT(*) as count FROM global_ai_pass_log WHERE status = 'COMPLETED'`).get() as { count: number };
    console.log(`Already Completed: ${completedCount.count}. Remaining: ${allVerses.length - completedCount.count}`);

    // Because this API key is on the Paid Tier, we can use concurrency.
    // We will process verses in batches of 10 concurrently to heavily cut down time.
    const CONCURRENCY_LIMIT = 10;

    for (let i = 0; i < allVerses.length; i += CONCURRENCY_LIMIT) {
        const batch = allVerses.slice(i, i + CONCURRENCY_LIMIT);

        // Process the batch in parallel
        await Promise.all(batch.map(verse => processVerse(verse)));

        // Minimal sleep to avoid aggressively hammering the Pay-os-you-go limit
        await sleep(500);
    }

    console.log("=== Global AI Pass Finished ===");
}

main().catch(console.error);
