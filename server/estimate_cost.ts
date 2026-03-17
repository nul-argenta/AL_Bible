/**
 * Cost estimation using gemini-2.5-flash-lite with the actual commentary schema.
 */
import Database from "better-sqlite3";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath, { readonly: true });

const apiKey = process.env.GEMINI_API_KEY!;
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

async function main() {
    // Test with 3 different verse types to get a range
    const testVerses = [
        { ref: "Genesis 1:1", text: "In the beginning God created the heavens and the earth." },
        { ref: "Psalm 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
        { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
    ];

    const usages: any[] = [];

    for (const v of testVerses) {
        const start = Date.now();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `Target Verse: ${v.ref}\nText: "${v.text}"\n\nPlease evaluate this verse.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: schemaDefinition as any
            }
        });
        const elapsed = Date.now() - start;
        const data = JSON.parse(response.text || "{}");
        const u = response.usageMetadata as any;
        usages.push(u);
        console.log(`\n${v.ref} (${elapsed}ms):`);
        console.log(`  Commentary: ${data.commentary?.length || 0} chars`);
        console.log(`  Cross-refs: ${data.crossReferences?.length || 0}`);
        console.log(`  Tokens — Input: ${u.promptTokenCount} | Output: ${u.candidatesTokenCount} | Thinking: ${u.thoughtsTokenCount || 0} | Total: ${u.totalTokenCount}`);
    }

    // Average
    const avgInput = usages.reduce((s, u) => s + u.promptTokenCount, 0) / usages.length;
    const avgOutput = usages.reduce((s, u) => s + u.candidatesTokenCount, 0) / usages.length;
    const avgThinking = usages.reduce((s, u) => s + (u.thoughtsTokenCount || 0), 0) / usages.length;

    // DB stats
    const total = (db.prepare("SELECT COUNT(*) as c FROM verses").get() as any).c;
    const completed = (db.prepare("SELECT COUNT(*) as c FROM global_ai_pass_log WHERE status = 'COMPLETED'").get() as any).c;
    const remaining = total - completed;

    console.log(`\n\n=== COST ESTIMATE ===`);
    console.log(`Average tokens per verse: Input=${avgInput.toFixed(0)} Output=${avgOutput.toFixed(0)} Thinking=${avgThinking.toFixed(0)}`);
    console.log(`Remaining verses: ${remaining}`);

    // gemini-2.5-flash-lite pricing:
    // Input: $0.075/1M tokens
    // Output: $0.30/1M tokens  
    // No thinking tokens (flash-lite doesn't think)
    const inputCost = (avgInput * remaining / 1_000_000) * 0.075;
    const outputCost = (avgOutput * remaining / 1_000_000) * 0.30;
    const thinkingCost = (avgThinking * remaining / 1_000_000) * 0.35;
    const totalCost = inputCost + outputCost + thinkingCost;

    console.log(`\ngemini-2.5-flash-lite pricing:`);
    console.log(`  Input cost:    $${inputCost.toFixed(2)}`);
    console.log(`  Output cost:   $${outputCost.toFixed(2)}`);
    console.log(`  Thinking cost: $${thinkingCost.toFixed(2)}`);
    console.log(`  TOTAL for ${remaining} remaining: $${totalCost.toFixed(2)}`);

    // Also estimate what the original gemini-2.5-flash would have cost per verse
    // (using same token counts but flash pricing)
    // Input: $0.15/M, Output: $0.60/M, Thinking: $0.35/M
    const flashInputCost = (avgInput * total / 1_000_000) * 0.15;
    const flashOutputCost = (avgOutput * total / 1_000_000) * 0.60;
    // For flash, thinking tokens are much higher - estimate ~500-1000
    console.log(`\nFor comparison, gemini-2.5-flash for ALL ${total} verses:`);
    console.log(`  Input:    $${flashInputCost.toFixed(2)}`);
    console.log(`  Output:   $${flashOutputCost.toFixed(2)}`);
    console.log(`  (Thinking tokens unknown — this was likely the biggest cost driver)`);

    db.close();
}

main().catch(console.error);
