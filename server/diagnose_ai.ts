/**
 * Diagnostic script: tests API key, measures token usage, and estimates costs.
 */
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing.");
    process.exit(1);
}

console.log("Using API Key:", apiKey.substring(0, 10) + "...");
const ai = new GoogleGenAI({ apiKey });

// ─── Test 1: Simple API call (no schema) ─────────────────
async function testSimpleCall() {
    console.log("\n=== TEST 1: Simple API Call ===");
    const start = Date.now();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say 'Hello' and nothing else.",
        });
        console.log(`  ✅ Response: "${response.text?.trim()}"`);
        console.log(`  ⏱  Time: ${Date.now() - start}ms`);
        console.log(`  📊 Usage:`, JSON.stringify(response.usageMetadata, null, 2));
        return true;
    } catch (error: any) {
        console.error(`  ❌ FAILED: ${error.message}`);
        console.error(`  Status: ${error.status}`);
        console.error(`  Full error:`, error);
        return false;
    }
}

// ─── Test 2: Structured output (same schema as AI pass) ──
async function testStructuredCall() {
    console.log("\n=== TEST 2: Structured Output (Commentary Schema) ===");

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

    const start = Date.now();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Target Verse: John 3:16\nText: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."\n\nPlease evaluate this verse.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: schemaDefinition as any
            }
        });

        const data = JSON.parse(response.text || "{}");
        console.log(`  ✅ Commentary length: ${data.commentary?.length || 0} chars`);
        console.log(`  ✅ Cross-refs: ${data.crossReferences?.length || 0}`);
        console.log(`  ⏱  Time: ${Date.now() - start}ms`);
        console.log(`  📊 Usage:`, JSON.stringify(response.usageMetadata, null, 2));
        return response.usageMetadata;
    } catch (error: any) {
        console.error(`  ❌ FAILED: ${error.message}`);
        console.error(`  Status: ${error.status}`);
        if (error.errorDetails) console.error(`  Details:`, JSON.stringify(error.errorDetails, null, 2));
        return null;
    }
}

// ─── Test 3: Cost estimation based on actual token usage ──
async function estimateCost(usage: any) {
    console.log("\n=== COST ESTIMATION ===");

    // DB stats
    const total = (db.prepare("SELECT COUNT(*) as c FROM verses").get() as any).c;
    const completed = (db.prepare("SELECT COUNT(*) as c FROM global_ai_pass_log WHERE status = 'COMPLETED'").get() as any).c;
    const remaining = total - completed;

    console.log(`  Total verses: ${total}`);
    console.log(`  Already completed: ${completed}`);
    console.log(`  Remaining to process: ${remaining}`);

    if (usage) {
        const inputTokens = usage.promptTokenCount || 0;
        const outputTokens = usage.candidatesTokenCount || 0;
        const thinkingTokens = usage.thoughtsTokenCount || 0;
        const totalTokens = usage.totalTokenCount || 0;

        console.log(`\n  Per-verse token usage (from test):`);
        console.log(`    Input tokens: ${inputTokens}`);
        console.log(`    Output tokens: ${outputTokens}`);
        console.log(`    Thinking tokens: ${thinkingTokens}`);
        console.log(`    Total tokens: ${totalTokens}`);

        // Gemini 2.5 Flash pricing (as of early 2025):
        // Input: $0.15 per 1M tokens (up to 200k), $0.075 per 1M for >200k prompts
        // Output: $0.60 per 1M tokens (up to 200k) 
        // Thinking: $0.35 per 1M tokens
        const inputCostPerM = 0.15;
        const outputCostPerM = 0.60;
        const thinkingCostPerM = 0.35;

        const perVerseCost =
            (inputTokens / 1_000_000) * inputCostPerM +
            (outputTokens / 1_000_000) * outputCostPerM +
            (thinkingTokens / 1_000_000) * thinkingCostPerM;

        const totalRemainingCost = perVerseCost * remaining;
        const totalAllCost = perVerseCost * total;

        console.log(`\n  Estimated cost per verse: $${perVerseCost.toFixed(6)}`);
        console.log(`  Estimated cost for remaining ${remaining} verses: $${totalRemainingCost.toFixed(2)}`);
        console.log(`  Estimated total cost for all ${total} verses: $${totalAllCost.toFixed(2)}`);
        console.log(`  (Already spent on completed ${completed} verses: ~$${(perVerseCost * completed).toFixed(2)})`);

        console.log(`\n  ⚠️  These estimates use published Gemini 2.5 Flash pricing.`);
        console.log(`  ⚠️  Actual costs depend on your billing plan and Google Cloud credits.`);
        console.log(`  ⚠️  Thinking tokens may vary significantly per verse.`);

        // Show total token projection
        const totalInputTokensAll = inputTokens * total;
        const totalOutputTokensAll = outputTokens * total;
        const totalThinkingTokensAll = thinkingTokens * total;
        console.log(`\n  Total token projection (all ${total} verses):`);
        console.log(`    Input: ${(totalInputTokensAll / 1_000_000).toFixed(1)}M tokens`);
        console.log(`    Output: ${(totalOutputTokensAll / 1_000_000).toFixed(1)}M tokens`);
        console.log(`    Thinking: ${(totalThinkingTokensAll / 1_000_000).toFixed(1)}M tokens`);
    }
}

// ─── Run ──────────────────────────────────────────────────
async function main() {
    const simpleOk = await testSimpleCall();

    if (!simpleOk) {
        console.log("\n❌ API key appears invalid or there's a network issue. Cannot proceed.");
        db.close();
        return;
    }

    const usage = await testStructuredCall();
    await estimateCost(usage);

    db.close();
    console.log("\n✨ Diagnosis complete.");
}

main().catch(console.error);
