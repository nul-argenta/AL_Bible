/**
 * Armor & Light — Server Entry Point
 */
import express from "express";
import { createServer } from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";
import { validateInt } from "./middleware";

dotenv.config();

const highlightSchema = z.object({
    verse_id: z.number(),
    color: z.string().min(1),
    label: z.string().optional()
});

const noteSchema = z.object({
    verse_id: z.number(),
    text: z.string().optional()
});

// Shim for dual ESM/CJS support (Vite Dev vs Electron Prod)
const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : dirname(currentFilename);

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Attach Clerk Auth state to req.auth (only when real keys are configured)
const clerkKey = process.env.CLERK_SECRET_KEY || "";
const isClerkConfigured = clerkKey.length > 10 && !clerkKey.includes("placeholder");

if (isClerkConfigured) {
    app.use(ClerkExpressWithAuth());
    console.log("🔐 Clerk auth middleware active");
} else {
    console.log("⚠️  Clerk keys not configured — running without auth (local/desktop mode)");
    app.use((req: any, _res: any, next: any) => {
        req.auth = { userId: null };
        next();
    });
}

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.path.startsWith("/api")) {
            console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        }
    });
    next();
});

// Security Headers
app.use((req, res, next) => {
    // Content Security Policy
    // Allow scripts from self, unsafe-inline (for React/Vite dev), and trusted external sources if needed
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://api.openai.com;"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // HSTS (Strict-Transport-Security) - relevant if serving over HTTPS, but good practice
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
});

// ─── API Routes ──────────────────────────────────────────────────────

// Bible Routes
app.get("/api/bible/:book/:chapter", async (req, res) => {
    try {
        const { book, chapter } = req.params;
        const chapterNum = validateInt(chapter);
        if (isNaN(chapterNum)) return res.status(400).json({ error: "Invalid chapter number" });
        const { getVerses } = await import("./bible/reader");
        const verses = await getVerses(book, chapterNum);
        res.json(verses);
    } catch (error) {
        console.error("Error fetching verses:", error);
        res.status(500).json({ error: "Failed to fetch verses" });
    }
});

app.get("/api/bible/search", async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });
        const { searchVerses } = await import("./bible/reader");
        const results = await searchVerses(query);
        res.json(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

app.get("/api/strongs/search", async (req, res) => {
    try {
        const query = req.query.q as string;
        if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });
        const { searchStrongs } = await import("./bible/reader");
        const results = await searchStrongs(query);
        res.json(results);
    } catch (error) {
        console.error("Strong's search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

app.get("/api/strongs/:number", async (req, res) => {
    try {
        const { getStrongsDefinition } = await import("./bible/reader");
        const def = await getStrongsDefinition(req.params.number);
        if (!def) return res.status(404).json({ error: "Strong's number not found" });
        res.json(def);
    } catch (error) {
        console.error("Strong's lookup error:", error);
        res.status(500).json({ error: "Lookup failed" });
    }
});


app.get("/api/commentary/:id", async (req, res) => {
    try {
        const id = validateInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid commentary ID" });
        const { getCommentary } = await import("./bible/reader");
        const comms = await getCommentary(id);
        res.json(comms);
    } catch (error) {
        console.error("Commentary error:", error);
        res.status(500).json({ error: "Failed to fetch commentary" });
    }
});

app.get("/api/books", async (_req, res) => {
    try {
        const { getBooks } = await import("./bible/reader");
        const bookList = await getBooks();
        res.json(bookList);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.get("/api/cross-references/:verseId", async (req, res) => {
    try {
        const verseId = validateInt(req.params.verseId);
        if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verse ID" });
        const { getCrossReferences } = await import("./bible/reader");
        const refs = await getCrossReferences(verseId);
        res.json(refs);
    } catch (error) {
        console.error("Error fetching cross-references:", error);
        res.status(500).json({ error: "Failed to fetch cross-references" });
    }
});

// ─── Highlights Routes ──────────────────────────────────────────────

app.get("/api/highlights/:book/:chapter", async (req: any, res) => {
    try {
        const chapterNum = validateInt(req.params.chapter);
        if (isNaN(chapterNum)) return res.status(400).json({ error: "Invalid chapter number" });
        const clerkId = req.auth?.userId || "guest";
        const { getHighlightsForChapter } = await import("./bible/reader");
        const highlights = await getHighlightsForChapter(req.params.book, chapterNum, clerkId);
        res.json(highlights);
    } catch (error) {
        console.error("Error fetching highlights:", error);
        res.status(500).json({ error: "Failed to fetch highlights" });
    }
});

app.post("/api/highlights", async (req: any, res) => {
    try {
        const clerkId = req.auth?.userId || "guest";
        const { verse_id, color, label } = highlightSchema.parse(req.body);
        const { setHighlight } = await import("./bible/reader");
        await setHighlight(verse_id, color, clerkId, label);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error saving highlight:", error);
        res.status(500).json({ error: "Failed to save highlight" });
    }
});

app.delete("/api/highlights/:verseId", async (req: any, res) => {
    try {
        const verseId = validateInt(req.params.verseId);
        if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verse ID" });
        const clerkId = req.auth?.userId || "guest";
        const { removeHighlight } = await import("./bible/reader");
        await removeHighlight(verseId, clerkId);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error removing highlight:", error);
        res.status(500).json({ error: "Failed to remove highlight" });
    }
});

// ─── Notes Routes ───────────────────────────────────────────────────

// IMPORTANT: /api/notes/all must come BEFORE /api/notes/:book/:chapter
// otherwise Express matches "all" as a :book parameter.
app.get("/api/notes/all", async (_req, res) => {
    try {
        const { getAllNotes } = await import("./bible/reader");
        const notes = await getAllNotes();
        res.json(notes);
    } catch (error) {
        console.error("Error fetching all notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.get("/api/notes/:book/:chapter", async (req: any, res) => {
    try {
        const chapterNum = validateInt(req.params.chapter);
        if (isNaN(chapterNum)) return res.status(400).json({ error: "Invalid chapter number" });
        const clerkId = req.auth?.userId || "guest";
        const { getNotesForChapter } = await import("./bible/reader");
        const notes = await getNotesForChapter(req.params.book, chapterNum, clerkId);
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.get("/api/notes/verse/:verseId", async (req: any, res) => {
    try {
        const verseId = validateInt(req.params.verseId);
        if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verse ID" });
        const clerkId = req.auth?.userId || "guest";
        const { getNoteForVerse } = await import("./bible/reader");
        const note = await getNoteForVerse(verseId, clerkId);
        res.json(note || null);
    } catch (error) {
        console.error("Error fetching note:", error);
        res.status(500).json({ error: "Failed to fetch note" });
    }
});

app.post("/api/notes", async (req: any, res) => {
    try {
        const clerkId = req.auth?.userId || "guest";
        const { verse_id, text } = noteSchema.parse(req.body);
        const { saveNote } = await import("./bible/reader");
        await saveNote(verse_id, text || "", clerkId);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error saving note:", error);
        res.status(500).json({ error: "Failed to save note" });
    }
});

app.delete("/api/notes/:verseId", async (req: any, res) => {
    try {
        const verseId = validateInt(req.params.verseId);
        if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verse ID" });
        const clerkId = req.auth?.userId || "guest";
        const { deleteNote } = await import("./bible/reader");
        await deleteNote(verseId, clerkId);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

// Health check - Moved to routes.ts

// ─── AI & Community Routes ──────────────────────────────────────────
// MUST be registered BEFORE the SPA catch-all
import { registerRoutes } from "./routes";
registerRoutes(app);

// ─── Error Handling ─────────────────────────────────────────────────
// Prevent Clerk Auth errors from crashing the Node.js process
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express Error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ─── Static Files / SPA Fallback ─────────────────────────────────────
const server = createServer(app);

(async () => {
    if (app.get("env") === "development" && !process.env.ELECTRON_RUN) {
        const { setupVite } = await import("./vite");
        await setupVite(app, server);
    } else {
        const { serveStatic } = await import("./vite");
        serveStatic(app);
    }

    // ─── Start ───────────────────────────────────────────────────────────
    const PORT = parseInt(process.env.PORT || "0", 10);

    server.listen(PORT, "127.0.0.1", () => {
        const address = server.address();
        if (typeof address === 'object' && address) {
            console.log(`SERVER_PORT:${address.port}`);
        }
        console.log(`\n  ⚔️  Armor & Light running on port ${typeof address === 'object' ? address?.port : PORT}\n`);
    });
})();
