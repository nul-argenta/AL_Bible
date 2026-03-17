/**
 * Fix Script — Delete bad cross-refs + backfill commentary gaps using LLM
 * Run with: npx tsx server/fix_data_llm.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY is missing. Backfilling commentary will fail.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key-for-build" });

async function fixCrossReferences() {
    console.log("=== 1. Deleting Self-Referencing Cross-Refs ===");
    const selfRefResult = db.prepare(`
        DELETE FROM cross_references WHERE from_verse_id = to_verse_id
    `).run();
    console.log(`  Deleted self-referencing rows: ${selfRefResult.changes}`);

    console.log("\n=== 2. Deleting Identical Text Cross-Refs ===");
    // Delete cross-references where the source verse text exactly matches the destination verse text (usually a copy-paste error in the original data source)
    const identicalTextResult = db.prepare(`
        DELETE FROM cross_references 
        WHERE id IN (
            SELECT cr.id
            FROM cross_references cr
            JOIN verses fv ON cr.from_verse_id = fv.id
            JOIN verses tv ON cr.to_verse_id = tv.id
            WHERE fv.text_web = tv.text_web AND fv.text_web IS NOT NULL
        )
    `).run();
    console.log(`  Deleted identical text rows: ${identicalTextResult.changes}`);
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function backfillTargetVerse(slug: string, chapter: number, verse: number, retries = 3) {
    const verseRow = db.prepare(`
        SELECT v.id, v.text_web, b.name || ' ' || v.chapter || ':' || v.verse AS ref
        FROM verses v
        JOIN books b ON v.book_id = b.id
        WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
    `).get(slug, chapter, verse) as { id: number; text_web: string | null; ref: string } | undefined;

    if (!verseRow) {
        console.log(`  [SKIP] Verse not found: ${slug} ${chapter}:${verse}`);
        return;
    }

    const existing = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?`).get(verseRow.id) as { cnt: number };
    if (existing.cnt > 0) {
        console.log(`  [SKIP] Already has commentary: ${verseRow.ref}`);
        return;
    }

    if (!verseRow.text_web) {
        console.log(`  [SKIP] Verse has no text: ${verseRow.ref}`);
        return;
    }

    console.log(`  [FETCH] Getting commentary for ${verseRow.ref}...`);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Reference: ${verseRow.ref}\nText: "${verseRow.text_web}"\n\nPlease provide the commentary.`,
            config: {
                systemInstruction: "You are a Biblical scholar writing in the style of Matthew Henry's Concise Commentary. Provide a concise, spiritually enriching, and practical commentary for the following Bible verse. Write 1-2 paragraphs max.",
                temperature: 0.7,
            }
        });

        const commentaryText = response.text;

        if (commentaryText) {
            db.prepare(`
                INSERT INTO commentaries (verse_id, author, text, source)
                VALUES (?, 'Matthew Henry (AI)', ?, 'Armor & Light Generated')
            `).run(verseRow.id, commentaryText);
            console.log(`  [SUCCESS] Added AI commentary for ${verseRow.ref}`);
        }
    } catch (error: any) {
        if (error.status === 429 && retries > 0) {
            console.log(`  [RETRY] Rate limit hit for ${verseRow.ref}. Retrying in 30 seconds...`);
            await sleep(30000); // 30 seconds
            return backfillTargetVerse(slug, chapter, verse, retries - 1);
        }
        console.error(`  [ERROR] Failed to fetch commentary for ${verseRow.ref}:`, error.message);
    }
}

async function backfillBookSample(slug: string, chapters: number[]) {
    console.log(`\n=== Backfilling Commentary for Book: ${slug} ===`);
    // Fetch verse 1 of each specified chapter to provide a baseline commentary since the entire book has 0 coverage
    for (const chapter of chapters) {
        await backfillTargetVerse(slug, chapter, 1);
        // Add a delay to avoid rate limits (15 TPM on free tier, meaning 1 request every 4 seconds)
        // With an extra safety margin, we'll sleep for 15 seconds between requests
        console.log("  [SLEEP] Waiting 15s to respect rate limits...");
        await sleep(15000);
    }
}

async function main() {
    await fixCrossReferences();

    if (!apiKey) {
        console.log("\nSkipping API commentary generation due to missing GEMINI_API_KEY");
        return;
    }

    console.log("\n=== 3. Backfilling Missing Popular Verses ===");
    const popularVerses = [
        { slug: 'john', ch: 3, v: 16 },
        { slug: 'psalms', ch: 23, v: 1 },
        { slug: 'psalms', ch: 23, v: 4 },
        { slug: 'jeremiah', ch: 29, v: 11 },
        { slug: 'isaiah', ch: 40, v: 31 },
    ];

    for (const pv of popularVerses) {
        await backfillTargetVerse(pv.slug, pv.ch, pv.v);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("\n=== 4. Backfilling Sample Commentaries for Empty Books ===");
    // Add sample commentaries to books that currently have 0% coverage based on the deep audit
    await backfillBookSample("ecclesiastes", [1, 3, 12]);
    await backfillBookSample("song-of-solomon", [1, 2, 8]);
    await backfillBookSample("isaiah", [1, 6, 9, 53]);
    await backfillBookSample("jeremiah", [1, 29, 31]);
    await backfillBookSample("lamentations", [3]);
    await backfillBookSample("ezekiel", [1, 36, 37]);
    await backfillBookSample("daniel", [1, 3, 6, 9]);
    await backfillBookSample("hosea", [1, 6]);
    await backfillBookSample("joel", [2]);
    await backfillBookSample("jude", [1]);

    const totalComms = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries`).get() as { cnt: number };
    console.log(`\n=== FIX COMPLETE ===`);
    console.log(`Total commentaries in database: ${totalComms.cnt}`);
    db.close();
}

main().catch(console.error);
