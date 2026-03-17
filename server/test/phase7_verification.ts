import { getCommunityStats, getBibleStats, logFeedback } from "../services/reporting";
import { getDb } from "../bible/reader";

async function verifyPhase7() {
    console.log("🔍 Starting Phase 7 Verification...");

    // 1. Test Bible Stats
    console.log("Testing Bible Stats...");
    const bibleStats = await getBibleStats();
    console.log("Bible Stats:", bibleStats);
    if (bibleStats.bookCount === 66 && bibleStats.verseCount > 30000) {
        console.log("✅ Bible Stats Verified");
    } else {
        console.error("❌ Bible Stats Mismatch");
    }

    // 2. Test Community Stats
    console.log("\nTesting Community Stats...");
    const commStats = await getCommunityStats();
    console.log("Community Stats:", commStats);
    if (typeof commStats.totalPosts === 'number') {
        console.log("✅ Community Stats Verified");
    } else {
        console.error("❌ Community Stats Error");
    }

    // 3. Test Feedback Logging
    console.log("\nTesting Feedback Logging...");

    // Ensure user 1 exists for the test
    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
    if (!user) {
        db.prepare(`
            INSERT INTO users (id, username, email, password_hash, display_name, role)
            VALUES (1, 'guest', 'guest@example.com', 'hash', 'Guest User', 'member')
        `).run();
    }

    await logFeedback(1, "Test AI Response", 1, "Great job!", "Test Context");

    // Verify insertion
    const feedback = db.prepare("SELECT * FROM feedback WHERE context = 'Test Context'").get() as any;
    if (feedback && feedback.rating === 1 && feedback.comment === "Great job!") {
        console.log("✅ Feedback Logged Successfully:", feedback);
    } else {
        console.error("❌ Feedback Logging Failed");
    }

    console.log("\nPhase 7 Verification Complete.");
}

verifyPhase7().catch(console.error);
