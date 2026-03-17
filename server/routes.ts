import type { Express } from "express";
import { processChatRequest } from "./ai/service";
import {
    getDb,
    checkDatabaseHealth,
    getHighlightsForChapter,
    setHighlight,
    removeHighlight,
    getNotesForChapter,
    saveNote,
    deleteNote,
    getReadingProgress,
    syncReadingProgress,
    getFavourites,
    addFavourite,
    removeFavourite,
    getReadingHistory,
    recordReadingHistory,
    getUserSettings,
    saveUserSettings,
    getDueMemoryCards,
    getMemoryStats,
    addMemoryCard,
    updateMemoryCard,
    deleteMemoryCard,
    getActivePlan,
    startPlan,
    updatePlanProgress,
    abandonPlan,
    getPrayerRequests,
    createPrayerRequest,
    updatePrayerRequest,
    deletePrayerRequest,
    getQuizResults,
    saveQuizResult,
    resetQuizResult,
    getUserLinks,
    addUserLink,
    removeUserLink,
    getStudyChainProgress,
    saveStudyChainProgress,
    resetStudyChainProgress
} from "./bible/reader";
import { insertPostSchema } from "@shared/schema";
import { sanitizeHtml, validateInt, checkRateLimit, ensureGuestUser, setCspHeaders, MAX_POST_LENGTH } from "./middleware";

export function registerRoutes(app: Express) {
    app.use(setCspHeaders);

    // ─── AI Routes ──────────────────────────────────────────────────────

    app.post("/api/ai/chat", async (req, res) => {
        try {
            const { messages, apiKey } = req.body;
            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ error: "messages array is required" });
            }

            // Rate Limiting
            const ip = req.ip || "unknown";
            if (!checkRateLimit(ip)) {
                return res.status(429).json({ error: "Too many requests. Please try again later." });
            }

            const responseMessage = await processChatRequest(messages, apiKey);
            res.json(responseMessage);

        } catch (error: any) {
            console.error("AI Chat Error:", error);
            res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    });

    // ─── Community Routes ────────────────────────────────────────────────

    // ─── Cloud Sync Tables ──────────────────────────────────────────────
    // Manual table creation removed in favor of Drizzle management

    app.get("/api/community/posts", (req, res) => {
        try {
            const db = getDb();
            // Fetch posts, counting total likes, and checking if the "current user" (id: 1) has liked it
            const currentUserId = 1; // Hardcoded to Guest for local version

            const posts = db.prepare(`
                SELECT 
                    p.*, 
                    u.username, u.display_name,
                    (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
                    (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as has_liked,
                    v.chapter as verse_chapter, v.verse as verse_num, b.name as book_name
                FROM posts p
                LEFT JOIN users u ON p.user_id = u.id
                LEFT JOIN verses v ON p.verse_id = v.id
                LEFT JOIN books b ON v.book_id = b.id
                ORDER BY p.created_at DESC
                LIMIT 100
            `).all(currentUserId);

            res.json(posts);
        } catch (error) {
            console.error("Fetch posts error:", error);
            res.status(500).json({ error: "Failed to fetch posts" });
        }
    });

    app.post("/api/community/posts", async (req, res) => {
        try {
            // Rate limiting
            const ip = req.ip || "unknown";
            if (!checkRateLimit(ip)) {
                return res.status(429).json({ status: "error", message: "Too many posts. Please wait a moment." });
            }

            // Basic validation
            const body = insertPostSchema.parse(req.body);
            let { content, verseId, parentId } = body;

            // Sanitize and validate content
            content = sanitizeHtml(content);
            if (!content || content.length === 0) {
                return res.status(400).json({ status: "error", message: "Post content cannot be empty." });
            }
            if (content.length > MAX_POST_LENGTH) {
                return res.status(400).json({ status: "error", message: `Post cannot exceed ${MAX_POST_LENGTH} characters.` });
            }

            // ─── AI Moderation Gate ──────────────────────────────────────
            const { moderatePost } = await import("./ai/moderator");
            const moderation = await moderatePost(content);

            if (!moderation.approved) {
                return res.status(403).json({
                    status: "rejected",
                    message: moderation.reason,
                    flags: moderation.flags,
                });
            }
            // ─────────────────────────────────────────────────────────────

            const db = getDb();
            ensureGuestUser();

            const result = db.prepare(`
                INSERT INTO posts (user_id, verse_id, content, parent_id)
                VALUES (?, ?, ?, ?)
            `).run(1, verseId || null, content, parentId || null);

            const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
            res.json(newPost);
        } catch (error) {
            console.error("Create post error:", error);
            res.status(500).json({ status: "error", message: "Failed to create post" });
        }
    });

    app.post("/api/community/posts/:id/like", (req, res) => {
        try {
            const postId = validateInt(req.params.id);
            if (isNaN(postId)) return res.status(400).json({ status: "error", message: "Invalid post ID" });
            const currentUserId = 1; // Guest
            const db = getDb();

            db.prepare(`
                INSERT OR IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)
            `).run(currentUserId, postId);

            res.json({ success: true });
        } catch (error) {
            console.error("Like post error:", error);
            res.status(500).json({ status: "error", message: "Failed to like post" });
        }
    });

    app.delete("/api/community/posts/:id/like", (req, res) => {
        try {
            const postId = validateInt(req.params.id);
            if (isNaN(postId)) return res.status(400).json({ status: "error", message: "Invalid post ID" });
            const currentUserId = 1; // Guest
            const db = getDb();

            db.prepare(`
                DELETE FROM post_likes WHERE user_id = ? AND post_id = ?
            `).run(currentUserId, postId);

            res.json({ success: true });
        } catch (error) {
            console.error("Unlike post error:", error);
            res.status(500).json({ status: "error", message: "Failed to unlike post" });
        }
    });

    // ─── Cloud Sync Routes (Clerk Auth Required) ─────────────────────────

    app.get("/api/sync/progress", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const progress = getReadingProgress(clerkId);
            res.json(progress);
        } catch (error) {
            console.error("Fetch progress error:", error);
            res.status(500).json({ error: "Failed to fetch reading progress" });
        }
    });

    app.post("/api/sync/progress", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { bookSlug, chapter, isRead } = req.body;
            if (!bookSlug || chapter === undefined) return res.status(400).json({ error: "bookSlug and chapter required" });

            syncReadingProgress(clerkId, bookSlug, chapter, !!isRead);
            res.json({ success: true });
        } catch (error) {
            console.error("Sync progress error:", error);
            res.status(500).json({ error: "Failed to sync reading progress" });
        }
    });

    app.get("/api/sync/favourites", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const favourites = getFavourites(clerkId);
            // Transform to match legacy expected format if needed
            const transformed = favourites.map(f => ({
                id: f.id,
                clerk_id: clerkId,
                verse_id: f.verseId,
                created_at: f.createdAt,
                book_id: f.bookId,
                verse_chapter: f.verseChapter,
                verse_num: f.verseNum,
                book_name: f.bookName,
                text_web: f.textWeb
            }));
            res.json(transformed);
        } catch (error) {
            console.error("Fetch favourites error:", error);
            res.status(500).json({ error: "Failed to fetch favourites" });
        }
    });

    app.post("/api/sync/favourites", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { verseId } = req.body;
            if (!verseId || isNaN(validateInt(String(verseId)))) return res.status(400).json({ error: "Valid numeric verseId required" });

            addFavourite(clerkId, validateInt(String(verseId)));
            res.json({ success: true });
        } catch (error) {
            console.error("Add favourite error:", error);
            res.status(500).json({ error: "Failed to add favourite verse" });
        }
    });

    app.delete("/api/sync/favourites/:verseId", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const verseId = validateInt(req.params.verseId);
            if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verseId" });

            removeFavourite(clerkId, verseId);
            res.json({ success: true });
        } catch (error) {
            console.error("Remove favourite error:", error);
            res.status(500).json({ error: "Failed to remove favourite verse" });
        }
    });

    // ─── Health Check Routes ─────────────────────────────────────────────

    app.get("/api/health", (_req, res) => {
        res.json({ status: "ok", app: "armor-light", timestamp: new Date().toISOString() });
    });

    app.get("/api/health/db", (_req, res) => {
        const health = checkDatabaseHealth();
        if (!health.ok) {
            res.status(503).json(health);
        } else {
            res.json(health);
        }
    });

    app.get("/api/memory/due", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const today = new Date().toISOString().slice(0, 10);
            const cards = getDueMemoryCards(clerkId, today);

            const transformed = cards.map(c => ({
                ...c.mc,
                chapter: c.verse.chapter,
                verse: c.verse.verse,
                text_primary: c.verse.textWeb || c.verse.textKjv,
                book_name: c.bookName,
                book_slug: c.bookSlug
            }));
            res.json(transformed);
        } catch (error) {
            console.error("Memory due error:", error);
            res.status(500).json({ error: "Failed to fetch due cards" });
        }
    });

    app.get("/api/memory/stats", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const today = new Date().toISOString().slice(0, 10);
            const stats = getMemoryStats(clerkId, today);
            res.json(stats);
        } catch (error) {
            console.error("Memory stats error:", error);
            res.status(500).json({ error: "Failed to fetch stats" });
        }
    });

    app.post("/api/memory/add", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { verseId } = req.body;
            if (!verseId) return res.status(400).json({ error: "verseId is required" });
            const today = new Date().toISOString().slice(0, 10);
            addMemoryCard(clerkId, verseId, today);
            res.json({ success: true });
        } catch (error) {
            console.error("Memory add error:", error);
            res.status(500).json({ error: "Failed to add card" });
        }
    });

    app.post("/api/memory/review", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { verseId, quality } = req.body;
            if (verseId == null || quality == null) return res.status(400).json({ error: "verseId and quality required" });

            // SM-2 Algorithm is complex so keep logic here or in reader. 
            // For now, let's keep it here but using ORM for update.
            const card = getDb().prepare(`SELECT * FROM memory_cards WHERE clerk_id = ? AND verse_id = ?`).get(clerkId, verseId) as any;
            if (!card) return res.status(404).json({ error: "Card not found" });

            let { ease_factor: ef, interval, repetitions } = card;
            const q = Math.max(0, Math.min(5, Number(quality)));

            if (q < 3) {
                repetitions = 0;
                interval = 1;
            } else {
                repetitions += 1;
                if (repetitions === 1) interval = 1;
                else if (repetitions === 2) interval = 6;
                else interval = Math.round(interval * ef);
            }

            ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
            if (ef < 1.3) ef = 1.3;

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + interval);
            const nextReview = nextDate.toISOString().slice(0, 10);

            updateMemoryCard(clerkId, verseId, {
                easeFactor: ef,
                interval,
                repetitions,
                nextReview
            });

            res.json({ success: true, nextReview, interval, repetitions, easeFactor: ef });
        } catch (error) {
            console.error("Memory review error:", error);
            res.status(500).json({ error: "Failed to submit review" });
        }
    });

    app.delete("/api/memory/:verseId", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const verseId = validateInt(req.params.verseId);
            if (isNaN(verseId)) return res.status(400).json({ error: "Invalid verseId" });
            deleteMemoryCard(clerkId, verseId);
            res.json({ success: true });
        } catch (error) {
            console.error("Memory delete error:", error);
            res.status(500).json({ error: "Failed to delete card" });
        }
    });

    app.get("/api/plans/active", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const plan = getActivePlan(clerkId);
            res.json(plan || null);
        } catch (error) {
            console.error("Plans active error:", error);
            res.status(500).json({ error: "Failed to fetch active plan" });
        }
    });

    app.post("/api/plans/start", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { planId } = req.body;
            if (!planId) return res.status(400).json({ error: "planId is required" });
            const today = new Date().toISOString().slice(0, 10);
            startPlan(clerkId, planId, today);
            res.json({ success: true });
        } catch (error) {
            console.error("Plans start error:", error);
            res.status(500).json({ error: "Failed to start plan" });
        }
    });

    app.post("/api/plans/complete-day", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { planId, day } = req.body;
            if (!planId || day == null) return res.status(400).json({ error: "planId and day required" });

            const plan = getActivePlan(clerkId) as any;
            if (!plan || plan.planId !== planId) return res.status(404).json({ error: "Active plan not found" });

            const completedDays: number[] = JSON.parse(plan.completedDays || "[]");
            if (!completedDays.includes(Number(day))) {
                completedDays.push(Number(day));
                completedDays.sort((a, b) => a - b);
            }

            updatePlanProgress(clerkId, planId, JSON.stringify(completedDays));
            res.json({ success: true, completedDays });
        } catch (error) {
            console.error("Plans complete-day error:", error);
            res.status(500).json({ error: "Failed to complete day" });
        }
    });

    app.delete("/api/plans/:planId", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { planId } = req.params;
            abandonPlan(clerkId, planId);
            res.json({ success: true });
        } catch (error) {
            console.error("Plans abandon error:", error);
            res.status(500).json({ error: "Failed to abandon plan" });
        }
    });

    // ─── Prayer Journal ──────────────────────────────────────────────────

    app.get("/api/prayers", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const rows = getPrayerRequests(clerkId);
            res.json(rows);
        } catch (error) {
            console.error("Prayers list error:", error);
            res.status(500).json({ error: "Failed to fetch prayers" });
        }
    });

    app.post("/api/prayers", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { title, body, category, verseRef } = req.body;
            if (!title || typeof title !== "string") return res.status(400).json({ error: "Title is required" });

            const result = createPrayerRequest(clerkId, {
                title: title.trim(),
                body: body?.trim() || null,
                category: category || "personal",
                verseRef: verseRef || null
            });
            res.json({ id: result.lastInsertRowid });
        } catch (error) {
            console.error("Prayers create error:", error);
            res.status(500).json({ error: "Failed to create prayer" });
        }
    });

    app.patch("/api/prayers/:id/answer", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

            const rows = getPrayerRequests(clerkId) as any[];
            const row = rows.find(r => r.id === id);
            if (!row) return res.status(404).json({ error: "Not found" });

            const newStatus = !row.isAnswered;
            const answeredDate = newStatus ? new Date().toISOString() : null;

            updatePrayerRequest(clerkId, id, {
                isAnswered: newStatus,
                answeredDate
            });
            res.json({ success: true, is_answered: newStatus });
        } catch (error) {
            console.error("Prayers answer error:", error);
            res.status(500).json({ error: "Failed to update prayer" });
        }
    });

    app.patch("/api/prayers/:id", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
            const { title, body, category, verseRef } = req.body;

            updatePrayerRequest(clerkId, id, {
                title,
                body,
                category,
                verseRef
            });
            res.json({ success: true });
        } catch (error) {
            console.error("Prayers update error:", error);
            res.status(500).json({ error: "Failed to update prayer" });
        }
    });

    app.delete("/api/prayers/:id", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const id = Number(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
            deletePrayerRequest(clerkId, id);
            res.json({ success: true });
        } catch (error) {
            console.error("Prayers delete error:", error);
            res.status(500).json({ error: "Failed to delete prayer" });
        }
    });

    // ─── Stats / Year in Review ──────────────────────────────────────────

    app.get("/api/stats/year-review", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const db = getDb();
            const year = new Date().getFullYear();

            // Reading stats
            const chaptersRead = db.prepare(
                `SELECT COUNT(*) as cnt FROM reading_progress WHERE clerk_id = ? AND read_at >= ?`
            ).get(clerkId, `${year}-01-01`) as any;

            // Streak
            const allDates = db.prepare(
                `SELECT DISTINCT DATE(read_at) as d FROM reading_progress WHERE clerk_id = ? ORDER BY d DESC`
            ).all(clerkId) as any[];

            let currentStreak = 0;
            const today = new Date();
            for (let i = 0; i < allDates.length; i++) {
                const expected = new Date(today);
                expected.setDate(expected.getDate() - i);
                const dateStr = expected.toISOString().split("T")[0];
                if (allDates[i]?.d === dateStr) {
                    currentStreak++;
                } else break;
            }

            // Favourites count
            const favCount = db.prepare(
                `SELECT COUNT(*) as cnt FROM favourite_verses WHERE clerk_id = ?`
            ).get(clerkId) as any;

            // Prayers answered this year
            const prayersAnswered = db.prepare(
                `SELECT COUNT(*) as cnt FROM prayer_requests WHERE clerk_id = ? AND is_answered = 1 AND answered_date >= ?`
            ).get(clerkId, `${year}-01-01`) as any;

            const totalPrayers = db.prepare(
                `SELECT COUNT(*) as cnt FROM prayer_requests WHERE clerk_id = ?`
            ).get(clerkId) as any;

            // Memory cards mastered
            const cardsMastered = db.prepare(
                `SELECT COUNT(*) as cnt FROM memory_cards WHERE clerk_id = ? AND ease_factor >= 2.5 AND repetitions >= 3`
            ).get(clerkId) as any;

            res.json({
                chaptersRead: chaptersRead?.cnt || 0,
                currentStreak,
                favourites: favCount?.cnt || 0,
                prayersAnswered: prayersAnswered?.cnt || 0,
                totalPrayers: totalPrayers?.cnt || 0,
                cardsMastered: cardsMastered?.cnt || 0,
                year,
            });
        } catch (error) {
            console.error("Stats error:", error);
            res.status(500).json({ error: "Failed to fetch stats" });
        }
    });

    // ─── Export User Data ─────────────────────────────────────────────────

    app.get("/api/export", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const favourites = getFavourites(clerkId);
            const readingProgress = getReadingProgress(clerkId);
            const prayers = getPrayerRequests(clerkId);
            const activePlan = getActivePlan(clerkId);
            const history = getReadingHistory(clerkId);

            res.json({
                exportedAt: new Date().toISOString(),
                version: "1.1",
                data: { favourites, readingProgress, prayers, activePlan, history }
            });
        } catch (error) {
            console.error("Export error:", error);
            res.status(500).json({ error: "Failed to export data" });
        }
    });

    // ─── Reading History & Settings ──────────────────────────────────────

    app.get("/api/history", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const history = getReadingHistory(clerkId);
            res.json(history);
        } catch (error) {
            console.error("Fetch history error:", error);
            res.status(500).json({ error: "Failed to fetch history" });
        }
    });

    app.post("/api/history", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { bookSlug, bookName, chapter, verse } = req.body;
            if (!bookSlug || chapter === undefined) return res.status(400).json({ error: "bookSlug and chapter required" });

            recordReadingHistory(clerkId, { bookSlug, bookName, chapter, verse });
            res.json({ success: true });
        } catch (error) {
            console.error("Record history error:", error);
            res.status(500).json({ error: "Failed to record history" });
        }
    });

    app.get("/api/settings", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const settings = getUserSettings(clerkId);
            res.json(settings ? JSON.parse(settings.settingsJson) : null);
        } catch (error) {
            console.error("Fetch settings error:", error);
            res.status(500).json({ error: "Failed to fetch settings" });
        }
    });

    app.post("/api/settings", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const settings = req.body;
            saveUserSettings(clerkId, JSON.stringify(settings));
            res.json({ success: true });
        } catch (error) {
            console.error("Save settings error:", error);
            res.status(500).json({ error: "Failed to save settings" });
        }
    });

    // ─── Quiz Results ──────────────────────────────────────────────────

    app.get("/api/quiz", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const results = getQuizResults(clerkId);
            res.json(results);
        } catch (error) {
            console.error("Fetch quiz error:", error);
            res.status(500).json({ error: "Failed to fetch quiz results" });
        }
    });

    app.post("/api/quiz", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const result = req.body;
            if (!result.bookSlug) return res.status(400).json({ error: "bookSlug is required" });

            saveQuizResult(clerkId, result);
            res.json({ success: true });
        } catch (error) {
            console.error("Save quiz error:", error);
            res.status(500).json({ error: "Failed to save quiz result" });
        }
    });

    app.delete("/api/quiz/:bookSlug", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { bookSlug } = req.params;
            resetQuizResult(clerkId, bookSlug);
            res.json({ success: true });
        } catch (error) {
            console.error("Reset quiz error:", error);
            res.status(500).json({ error: "Failed to reset quiz result" });
        }
    });

    // ─── User Links ──────────────────────────────────────────────────────

    app.get("/api/user-links", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const fromVerseId = req.query.fromVerseId ? Number(req.query.fromVerseId) : undefined;
            const links = getUserLinks(clerkId, fromVerseId);
            res.json(links);
        } catch (error) {
            console.error("Fetch user links error:", error);
            res.status(500).json({ error: "Failed to fetch user links" });
        }
    });

    app.post("/api/user-links", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const link = req.body;
            addUserLink(clerkId, link);
            res.json({ success: true });
        } catch (error) {
            console.error("Add user link error:", error);
            res.status(500).json({ error: "Failed to add user link" });
        }
    });

    app.delete("/api/user-links/:id", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { id } = req.params;
            removeUserLink(clerkId, id);
            res.json({ success: true });
        } catch (error) {
            console.error("Remove user link error:", error);
            res.status(500).json({ error: "Failed to remove user link" });
        }
    });

    // ─── Study Chain Progress ──────────────────────────────────────────

    app.get("/api/study-chains", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const chainId = req.query.chainId as string;
            const progress = getStudyChainProgress(clerkId, chainId);
            res.json(progress);
        } catch (error) {
            console.error("Fetch study chains error:", error);
            res.status(500).json({ error: "Failed to fetch study chain progress" });
        }
    });

    app.post("/api/study-chains", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { chainId, passageIndices } = req.body;
            saveStudyChainProgress(clerkId, chainId, JSON.stringify(passageIndices));
            res.json({ success: true });
        } catch (error) {
            console.error("Save study chains error:", error);
            res.status(500).json({ error: "Failed to save study chain progress" });
        }
    });

    app.delete("/api/study-chains/:chainId", (req: any, res) => {
        try {
            const clerkId = req.auth?.userId || "guest";
            const { chainId } = req.params;
            resetStudyChainProgress(clerkId, chainId);
            res.json({ success: true });
        } catch (error) {
            console.error("Reset study chains error:", error);
            res.status(500).json({ error: "Failed to reset study chain progress" });
        }
    });
}
