/**
 * AI Community Post Moderation Agent
 * Uses Gemini to evaluate community posts for relevance and appropriateness
 * before they are published to the feed.
 */
import { GoogleGenAI } from "@google/genai";

export interface ModerationResult {
    approved: boolean;
    reason: string;
    flags: string[];
}

const MODERATION_PROMPT = `
You are the content moderation agent for "Armor & Light", a reverent Bible study application.
Your job is to evaluate community discussion posts and decide whether they should be published.

### Approval Criteria (ALL must be met):
1. **Relevant**: The post relates to Scripture, theology, faith, spirituality, or the Bible study community.
2. **Respectful**: No hate speech, personal attacks, harassment, or discriminatory language.
3. **Clean**: No profanity, vulgarity, or sexually explicit content.
4. **Genuine**: No spam, advertisements, self-promotion, or bot-generated gibberish.
5. **Honest**: No deliberate misinformation being presented as established doctrine.

### Leniency Guidelines:
- Personal prayer requests and testimonies ARE allowed.
- Questions and doubts about faith ARE allowed (these are part of genuine seeking).
- Denominational perspectives ARE allowed as long as they are respectful.
- Brief, low-effort posts (e.g., "Amen!") ARE allowed — they are simple community engagement.

### Response Format:
You MUST respond with ONLY a valid JSON object, no markdown, no code fences:
{"approved": true, "reason": "Content is a relevant theological reflection.", "flags": []}

If rejecting:
{"approved": false, "reason": "Post contains promotional content unrelated to Scripture.", "flags": ["spam", "off-topic"]}

Valid flag values: "off-topic", "spam", "profanity", "harassment", "misinformation", "explicit"
`;

/**
 * Evaluate a community post using Gemini AI.
 * Returns a ModerationResult indicating whether the post should be published.
 * If the AI service is unavailable, posts are approved by default (fail-open).
 */
export async function moderatePost(content: string, apiKey?: string): Promise<ModerationResult> {
    const key = apiKey || process.env.GEMINI_API_KEY;

    // Fail-open: if no API key, approve by default
    if (!key || key === "dummy-key-for-build") {
        return { approved: true, reason: "Moderation skipped (no API key configured).", flags: [] };
    }

    // Guard: reject extremely long content before sending to AI
    if (content.length > 5000) {
        return { approved: false, reason: "Post exceeds maximum allowed length.", flags: ["spam"] };
    }

    // Guard: strip content that could manipulate the system prompt
    const sanitized = content
        .replace(/```/g, "")           // Strip code fences
        .replace(/\bsystem\b/gi, "")   // Strip "system" keyword
        .replace(/\bignore\b/gi, "")   // Strip "ignore" keyword
        .substring(0, 3000);           // Hard cap

    try {
        const ai = new GoogleGenAI({ apiKey: key });

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: `Evaluate this community post:\n\n"${sanitized}"` }],
                },
            ],
            config: {
                systemInstruction: MODERATION_PROMPT,
                temperature: 0.1, // Low temperature for consistent, deterministic moderation
            },
        });

        const raw = result.text?.trim();
        if (!raw) {
            console.warn("⚠️ Moderation: Empty response from AI, approving by default.");
            return { approved: true, reason: "Moderation response empty, approved by default.", flags: [] };
        }

        // Parse the JSON response — strip markdown fences if present
        const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned);

        // Validate response shape
        if (typeof parsed.approved !== "boolean" || typeof parsed.reason !== "string") {
            console.warn("⚠️ Moderation: Malformed AI response, approving by default.");
            return { approved: true, reason: "Moderation response malformed, approved by default.", flags: [] };
        }

        const modResult: ModerationResult = {
            approved: parsed.approved,
            reason: String(parsed.reason).substring(0, 500),
            flags: Array.isArray(parsed.flags) ? parsed.flags.map(String) : [],
        };

        console.log(`🛡️  Moderation: ${modResult.approved ? "APPROVED" : "REJECTED"} — ${modResult.reason}`);
        return modResult;
    } catch (error: any) {
        // Fail-open on errors — don't block users if AI is temporarily unavailable
        console.error("⚠️ Moderation error (approving by default):", error.message);
        return { approved: true, reason: "Moderation unavailable, approved by default.", flags: [] };
    }
}

