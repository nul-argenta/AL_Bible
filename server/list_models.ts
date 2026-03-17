/**
 * List all available models from the Gemini API.
 */
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("❌ No API key"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey });

async function main() {
    console.log("Listing all available models...\n");

    const pager = await ai.models.list({ config: { pageSize: 100 } });

    for await (const model of pager) {
        const name = model.name || "???";
        const displayName = model.displayName || "";
        const methods = (model.supportedActions || []).join(", ");
        console.log(`  ${name} — ${displayName}`);
        if (methods) console.log(`    Methods: ${methods}`);
    }

    console.log("\nDone.");
}

main().catch(console.error);
