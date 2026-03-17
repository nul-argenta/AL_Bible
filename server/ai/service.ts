import { GoogleGenAI } from "@google/genai";
import { tools, getGeminiTools } from "./tools";

// ─── Gemini Client ───────────────────────────────────────────────────

// Ensure API key is present or handle gracefully
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("⚠️  GEMINI_API_KEY is allowed to be missing during build, but required for runtime.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key-for-build" });

// ─── System Prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an advanced theological assistant for the "Armor & Light" Bible study platform.
Your goal is to help users deepen their understanding of Scripture by connecting them to the rich data available in the database.

### Core Capabilities:
1. **Scripture Knowledge**: You have access to the entire texts of the WEB and KJV translations.
2. **Original Languages**: You can look up Hebrew/Greek definitions via Strong's Concordance.
3. **Connectivity**: You can find cross-references to show how Scripture interprets Scripture.
4. **Theological Insight**: You have access to Matthew Henry's Concise Commentary.

### Guidelines:
- **Be Text-Centric**: Always ground your answers in specific Bible verses. Use the \`search_scripture\` tool to find valid references if you are unsure.
- **Use Tools Proactively**: 
  - If a user asks about a word's meaning, use \`lookup_strongs\`.
  - If a user asks "what else does the Bible say about this?", use \`get_cross_references\`.
  - If a user asks for interpretation, use \`get_commentary\` to provide Matthew Henry's perspective (but attribute it to him).
- **Style**: Scholarly yet accessible, warm, and encourage spiritual reflection.
- **Formatting**: Use Markdown. creating links to verses is encouraged (e.g., [Gen 1:1]).

### Tool Usage:
You have access to functions. When you need data, call the function. Do not guess verse text or definitions.
`;

// ─── Service Logic ───────────────────────────────────────────────────

export async function processChatRequest(messages: any[], userApiKey?: string) {
    try {
        let client = ai;
        if (userApiKey) {
            client = new GoogleGenAI({ apiKey: userApiKey });
        }

        // Gemini expects messages in the { role: "user" | "model", parts: [{text: ""}] } format, 
        // but the frontend might be sending OpenAI format { role: "user" | "assistant", content: "" }
        const geminiMessages = messages.map(m => ({
            role: m.role === "assistant" ? "model" : m.role,
            parts: [{ text: m.content || "" }]
        }));

        // 1. Initial Call to LLM
        const runner = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: geminiMessages,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                tools: getGeminiTools(),
                temperature: 0.7,
            }
        });

        // 2. Handle Tool Calls Loop
        // Find if the model asked to call a tool
        const functionCalls = runner.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
            const toolResults = [];

            // Execute all requested tools
            for (const call of functionCalls) {
                const toolName = call.name;
                const toolArgs = call.args;

                console.log(`🤖 AI Calling Tool: ${toolName}`, toolArgs);

                const tool = tools.find(t => t.name === toolName);
                if (!tool) {
                    toolResults.push({
                        functionResponse: {
                            name: toolName,
                            response: { error: `Tool ${toolName} not found` }
                        }
                    });
                    continue;
                }

                try {
                    // Execute the tool
                    const rawResult = await tool.execute(toolArgs as any);

                    // Gemini strictly requires the tool response to be an object (Record<string, unknown>)
                    // If a tool returns an array, wrap it in an object.
                    const finalResult = Array.isArray(rawResult)
                        ? { results: rawResult }
                        : (rawResult as Record<string, unknown>);

                    toolResults.push({
                        functionResponse: {
                            name: toolName,
                            response: finalResult
                        }
                    });
                } catch (err: any) {
                    console.error(`❌ Tool execution failed: ${err.message}`);
                    toolResults.push({
                        functionResponse: {
                            name: toolName,
                            response: { error: `Execution failed: ${err.message}` }
                        }
                    });
                }
            }

            // 3. Follow-up Call to LLM with tool results
            // We append the original model response containing the function calls, AND the results
            const assistantParts = runner.candidates?.[0]?.content?.parts || [];

            const followUpMessages = [
                ...geminiMessages,
                { role: "model", parts: assistantParts },
                { role: "user", parts: toolResults as any[] }
            ];

            const secondResponse = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: followUpMessages,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    tools: getGeminiTools(),
                    temperature: 0.7,
                }
            });

            // Convert back to OpenAI format for the frontend
            return {
                role: "assistant",
                content: secondResponse.text
            };
        }

        // No tool called, just return the response
        return {
            role: "assistant",
            content: runner.text
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}
