import { z } from "zod";
import { Type } from "@google/genai";
import {
    searchVerses,
    getStrongsDefinition,
    getCrossReferences,
    getCommentary
} from "../bible/reader";

import { findContextualLinks } from "./context";

// ─── Tool Definitions ────────────────────────────────────────────────

export const tools = [
    {
        name: "find_contextual_links",
        description: "Analyze the chosen verse to find thematic clusters based on cross-references and shared original language words (Strong's). Use this to 'deep dive' into a verse.",
        parameters: z.object({
            verseId: z.number().describe("The unique ID of the verse")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                verseId: { type: Type.NUMBER, description: "The unique ID of the verse" }
            },
            required: ["verseId"]
        },
        execute: async ({ verseId }: { verseId: number }) => {
            return await findContextualLinks(verseId);
        }
    },
    {
        name: "search_scripture",
        description: "Search for Bible verses based on keywords or semantic meaning. Use this to find relevant scripture for a topic.",
        parameters: z.object({
            query: z.string().describe("The search query (e.g., 'love is patient', 'David and Goliath')"),
            limit: z.number().optional().describe("Number of results to return (default: 10)")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The search query (e.g., 'love is patient', 'David and Goliath')" },
                limit: { type: Type.NUMBER, description: "Number of results to return (default: 10)" }
            },
            required: ["query"]
        },
        execute: async ({ query, limit = 10 }: { query: string, limit?: number }) => {
            const results = await searchVerses(query, limit) as any[];
            return results.map(v => ({
                ref: `${v.book_name} ${v.chapter}:${v.verse}`,
                text: v.text_primary,
                slug: `${v.book_slug}/${v.chapter}/${v.verse}`
            }));
        }
    },
    {
        name: "lookup_strongs",
        description: "Look up a Strong's Concordance definition for a Hebrew or Greek word.",
        parameters: z.object({
            strongsNumber: z.string().describe("The Strong's number (e.g., 'H1234', 'G25')")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                strongsNumber: { type: Type.STRING, description: "The Strong's number (e.g., 'H1234', 'G25')" }
            },
            required: ["strongsNumber"]
        },
        execute: async ({ strongsNumber }: { strongsNumber: string }) => {
            const def = await getStrongsDefinition(strongsNumber) as any;
            if (!def) return { error: "Definition not found" };
            return {
                number: def.strongsNumber,
                word: def.originalWord,
                pronunciation: def.pronunciation,
                definition: def.definition,
                usage: def.kjvUsage
            };
        }
    },
    {
        name: "get_cross_references",
        description: "Find cross-references for a specific verse to see how it connects to other parts of the Bible.",
        parameters: z.object({
            verseId: z.number().describe("The unique ID of the verse")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                verseId: { type: Type.NUMBER, description: "The unique ID of the verse" }
            },
            required: ["verseId"]
        },
        execute: async ({ verseId }: { verseId: number }) => {
            const refs = await getCrossReferences(verseId) as any[];
            return refs.map(r => ({
                ref: `${r.to_book_name} ${r.to_chapter}:${r.to_verse}`,
                text: r.to_text,
                votes: r.votes
            }));
        }
    },
    {
        name: "get_commentary",
        description: "Retrieve Matthew Henry's Concise Commentary for a specific verse to get theological insights.",
        parameters: z.object({
            verseId: z.number().describe("The unique ID of the verse")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                verseId: { type: Type.NUMBER, description: "The unique ID of the verse" }
            },
            required: ["verseId"]
        },
        execute: async ({ verseId }: { verseId: number }) => {
            const comms = await getCommentary(verseId) as any[];
            return comms.map(c => ({
                author: c.author,
                text: c.text
            }));
        }
    },
    {
        name: "generate_insight",
        description: "Generate a natural language report on the status of the community or the Bible database.",
        parameters: z.object({
            type: z.enum(["community", "bible"]).describe("The type of insight to generate")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: ["community", "bible"], description: "The type of insight to generate" }
            },
            required: ["type"]
        },
        execute: async ({ type }: { type: "community" | "bible" }) => {
            const { getCommunityStats, getBibleStats } = await import("../services/reporting");
            if (type === "community") {
                return await getCommunityStats();
            } else {
                return await getBibleStats();
            }
        }
    },
    {
        name: "log_feedback",
        description: "Log user feedback on an AI response to improve future performance.",
        parameters: z.object({
            rating: z.number().min(0).max(1).describe("1 for Helpful (Thumbs Up), 0 for Not Helpful (Thumbs Down)"),
            comment: z.string().describe("Optional comment from the user"),
            context: z.string().describe("Context of the feedback (e.g., the query)")
        }),
        jsonSchema: {
            type: Type.OBJECT,
            properties: {
                rating: { type: Type.NUMBER, description: "1 for Helpful (Thumbs Up), 0 for Not Helpful (Thumbs Down)" },
                comment: { type: Type.STRING, description: "Optional comment from the user" },
                context: { type: Type.STRING, description: "Context of the feedback (e.g., the query)" }
            },
            required: ["rating", "context"]
        },
        execute: async ({ rating, comment, context }: { rating: number, comment?: string, context: string }) => {
            const { logFeedback } = await import("../services/reporting");
            // Hardcode Guest User ID 1 for MVP context
            return await logFeedback(1, "AI Tool Feedback", rating, comment || "", context);
        }
    }
];

export function getGeminiTools() {
    return [{
        functionDeclarations: tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.jsonSchema
        })) as any
    }];
}
