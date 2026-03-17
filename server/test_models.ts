/**
 * Test specific models that are listed as available.
 */
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("❌ No API key"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey });

const MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-2.5-pro",
    "gemini-3-flash-preview",
];

async function test(model: string) {
    try {
        const t = Date.now();
        const r = await ai.models.generateContent({
            model,
            contents: "Reply with exactly: 'OK'",
        });
        console.log(`  ✅ ${model} — ${Date.now() - t}ms — "${r.text?.trim()}" — tokens: in=${r.usageMetadata?.promptTokenCount} out=${r.usageMetadata?.candidatesTokenCount} think=${(r.usageMetadata as any)?.thoughtsTokenCount || 0}`);
    } catch (e: any) {
        console.log(`  ❌ ${model} — ${e.status} — ${e.message?.substring(0, 100)}`);
    }
}

(async () => {
    for (const m of MODELS) await test(m);
    console.log("\nDone.");
})();
