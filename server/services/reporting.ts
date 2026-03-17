import { getDb } from "../bible/reader";

interface CountResult {
    c: number;
}

export async function getCommunityStats() {
    const db = getDb();
    const totalPosts = (db.prepare("SELECT COUNT(*) as c FROM posts").get() as CountResult).c;
    // Threads are posts that have children, or maybe just unique parent_ids?
    // Let's count unique parent_ids to see how many "threads" are active (excluding top-level if they have no replies? no, let's just count top-level posts)
    // Actually, "active threads" implies conversation. Let's just count total posts for now and recent activity.

    const recentPosts = db.prepare(`
        SELECT p.content, u.username, b.name as book, v.chapter, v.verse
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN verses v ON p.verse_id = v.id
        LEFT JOIN books b ON v.book_id = b.id
        ORDER BY p.created_at DESC
        LIMIT 5
    `).all();

    return { totalPosts, recentPosts };
}

export async function getBibleStats() {
    const db = getDb();
    const bookCount = (db.prepare("SELECT COUNT(*) as c FROM books").get() as CountResult).c;
    const verseCount = (db.prepare("SELECT COUNT(*) as c FROM verses").get() as CountResult).c;
    const crossRefCount = (db.prepare("SELECT COUNT(*) as c FROM cross_references").get() as CountResult).c;
    const commentaryCount = (db.prepare("SELECT COUNT(*) as c FROM commentaries").get() as CountResult).c;

    return { bookCount, verseCount, crossRefCount, commentaryCount };
}

export async function logFeedback(userId: number | null, aiResponse: string, rating: number, comment: string, context: string) {
    const db = getDb();
    db.prepare(`
        INSERT INTO feedback (user_id, ai_response, rating, comment, context)
        VALUES (?, ?, ?, ?, ?)
    `).run(userId, aiResponse, rating, comment, context);
    return { success: true };
}
