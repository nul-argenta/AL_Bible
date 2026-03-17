import { useMemo } from "react";
import { AT_BIBLE_BOOKS, BIBLE_CATEGORIES, getCategoryBooks } from "@/lib/bibleData";
import { useReadingProgress, type ReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingHistory, type ReadingHistoryEntry } from "@/hooks/useReadingHistory";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { getBooksWithQuestions } from "@/lib/quizData";

export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    tier: "bronze" | "silver" | "gold" | "diamond";
    earned: boolean;
    progress?: { current: number; total: number };
}

// Streak calculation from reading history
function calculateStreak(history: ReadingHistoryEntry[]): { current: number; best: number } {
    if (history.length === 0) return { current: 0, best: 0 };

    // Group unique reading days
    const readDays = new Set<string>();
    history.forEach(entry => {
        const date = new Date(entry.timestamp).toISOString().split("T")[0];
        readDays.add(date);
    });

    const sortedDays = Array.from(readDays).sort().reverse(); // Most recent first
    if (sortedDays.length === 0) return { current: 0, best: 0 };

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Current streak: consecutive days ending today or yesterday
    let currentStreak = 0;
    if (sortedDays[0] === today || sortedDays[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
            const prevDate = new Date(sortedDays[i - 1]);
            const currDate = new Date(sortedDays[i]);
            const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
            if (Math.round(diffDays) === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Best streak: find longest consecutive run
    let bestStreak = 1;
    let runLength = 1;
    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
        if (Math.round(diffDays) === 1) {
            runLength++;
            bestStreak = Math.max(bestStreak, runLength);
        } else {
            runLength = 1;
        }
    }

    return { current: currentStreak, best: Math.max(bestStreak, currentStreak) };
}

function getCompletedBooks(progress: ReadingProgress): string[] {
    return AT_BIBLE_BOOKS
        .filter(book => (progress[book.slug] || []).length === book.chapters)
        .map(book => book.slug);
}

export function useAchievements() {
    const { progress, getStats } = useReadingProgress();
    const { history } = useReadingHistory();
    const { progress: quizProgress, getStats: getQuizStats } = useQuizProgress();

    const streak = useMemo(() => calculateStreak(history), [history]);
    const stats = getStats();
    const quizStats = getQuizStats();
    const completedBooks = useMemo(() => getCompletedBooks(progress), [progress]);

    const achievements = useMemo((): Achievement[] => {
        const totalRead = stats.totalRead;
        const booksComplete = completedBooks.length;

        // Category completion
        const categoryComplete = (catId: string) => {
            const catBooks = getCategoryBooks(catId);
            return catBooks.every(b => completedBooks.includes(b.slug));
        };

        const otBooks = AT_BIBLE_BOOKS.filter(b => BIBLE_CATEGORIES.find(c => c.id === b.category)?.testament === "OT");
        const ntBooks = AT_BIBLE_BOOKS.filter(b => BIBLE_CATEGORIES.find(c => c.id === b.category)?.testament === "NT");
        const otComplete = otBooks.every(b => completedBooks.includes(b.slug));
        const ntComplete = ntBooks.every(b => completedBooks.includes(b.slug));

        return [
            // ─── Streak Achievements ───
            {
                id: "streak-3",
                title: "Faithful Reader",
                description: "Read for 3 consecutive days",
                emoji: "🔥",
                tier: "bronze",
                earned: streak.current >= 3 || streak.best >= 3,
                progress: { current: Math.min(streak.current, 3), total: 3 },
            },
            {
                id: "streak-7",
                title: "Weekly Warrior",
                description: "Read for 7 consecutive days",
                emoji: "⚔️",
                tier: "silver",
                earned: streak.current >= 7 || streak.best >= 7,
                progress: { current: Math.min(streak.current, 7), total: 7 },
            },
            {
                id: "streak-30",
                title: "Monthly Devotion",
                description: "Read for 30 consecutive days",
                emoji: "🛡️",
                tier: "gold",
                earned: streak.current >= 30 || streak.best >= 30,
                progress: { current: Math.min(streak.current, 30), total: 30 },
            },
            {
                id: "streak-365",
                title: "Year of Faith",
                description: "Read for 365 consecutive days",
                emoji: "👑",
                tier: "diamond",
                earned: streak.current >= 365 || streak.best >= 365,
                progress: { current: Math.min(streak.current, 365), total: 365 },
            },

            // ─── Chapter Milestones ───
            {
                id: "chapters-10",
                title: "First Steps",
                description: "Read 10 chapters",
                emoji: "📖",
                tier: "bronze",
                earned: totalRead >= 10,
                progress: { current: Math.min(totalRead, 10), total: 10 },
            },
            {
                id: "chapters-100",
                title: "Centurion",
                description: "Read 100 chapters",
                emoji: "💯",
                tier: "silver",
                earned: totalRead >= 100,
                progress: { current: Math.min(totalRead, 100), total: 100 },
            },
            {
                id: "chapters-500",
                title: "Scholar",
                description: "Read 500 chapters",
                emoji: "🎓",
                tier: "gold",
                earned: totalRead >= 500,
                progress: { current: Math.min(totalRead, 500), total: 500 },
            },
            {
                id: "chapters-1189",
                title: "Scripture Master",
                description: "Read all 1,189 chapters",
                emoji: "✨",
                tier: "diamond",
                earned: totalRead >= 1189,
                progress: { current: Math.min(totalRead, 1189), total: 1189 },
            },

            // ─── Book Completion ───
            {
                id: "books-1",
                title: "First Book",
                description: "Complete an entire book",
                emoji: "📘",
                tier: "bronze",
                earned: booksComplete >= 1,
                progress: { current: Math.min(booksComplete, 1), total: 1 },
            },
            {
                id: "books-10",
                title: "Library Builder",
                description: "Complete 10 books",
                emoji: "📚",
                tier: "silver",
                earned: booksComplete >= 10,
                progress: { current: Math.min(booksComplete, 10), total: 10 },
            },
            {
                id: "books-39",
                title: "Old Covenant Master",
                description: "Complete the entire Old Testament",
                emoji: "📜",
                tier: "gold",
                earned: otComplete,
                progress: { current: otBooks.filter(b => completedBooks.includes(b.slug)).length, total: 39 },
            },
            {
                id: "books-27",
                title: "New Covenant Master",
                description: "Complete the entire New Testament",
                emoji: "✝️",
                tier: "gold",
                earned: ntComplete,
                progress: { current: ntBooks.filter(b => completedBooks.includes(b.slug)).length, total: 27 },
            },
            {
                id: "books-66",
                title: "Whole Armor of God",
                description: "Complete every book of the Bible",
                emoji: "🏆",
                tier: "diamond",
                earned: booksComplete >= 66,
                progress: { current: booksComplete, total: 66 },
            },

            // ─── Category Completion ───
            {
                id: "cat-law",
                title: "Keeper of the Law",
                description: "Complete the Torah (Genesis–Deuteronomy)",
                emoji: "📜",
                tier: "silver",
                earned: categoryComplete("law"),
            },
            {
                id: "cat-wisdom",
                title: "Wise as Solomon",
                description: "Complete all Wisdom & Poetry books",
                emoji: "🕊️",
                tier: "silver",
                earned: categoryComplete("wisdom"),
            },
            {
                id: "cat-gospels",
                title: "Gospel Bearer",
                description: "Complete all four Gospels",
                emoji: "✝️",
                tier: "silver",
                earned: categoryComplete("gospels"),
            },
            {
                id: "cat-pauline",
                title: "Apostle's Student",
                description: "Complete all of Paul's letters",
                emoji: "✉️",
                tier: "gold",
                earned: categoryComplete("pauline"),
            },
            {
                id: "cat-prophets",
                title: "Voice of the Prophets",
                description: "Complete all Major & Minor Prophets",
                emoji: "🔥",
                tier: "gold",
                earned: categoryComplete("major-prophets") && categoryComplete("minor-prophets"),
            },

            // ─── Quiz Achievements ───
            {
                id: "quiz-1",
                title: "Quiz Starter",
                description: "Complete your first book quiz",
                emoji: "❓",
                tier: "bronze",
                earned: quizStats.booksAttempted >= 1,
                progress: { current: Math.min(quizStats.booksAttempted, 1), total: 1 },
            },
            {
                id: "quiz-10",
                title: "Quiz Enthusiast",
                description: "Complete quizzes for 10 different books",
                emoji: "🧠",
                tier: "silver",
                earned: quizStats.booksAttempted >= 10,
                progress: { current: Math.min(quizStats.booksAttempted, 10), total: 10 },
            },
            {
                id: "quiz-all",
                title: "Quiz Master",
                description: "Complete quizzes for all available books",
                emoji: "🎯",
                tier: "gold",
                earned: quizStats.booksAttempted >= getBooksWithQuestions().length,
                progress: { current: quizStats.booksAttempted, total: getBooksWithQuestions().length },
            },
            {
                id: "quiz-perfect-1",
                title: "Perfect Score",
                description: "Get 100% on any book quiz",
                emoji: "💯",
                tier: "silver",
                earned: quizStats.booksPerfect >= 1,
                progress: { current: Math.min(quizStats.booksPerfect, 1), total: 1 },
            },
            {
                id: "quiz-perfect-10",
                title: "Testament Scholar",
                description: "Get 100% on 10 different book quizzes",
                emoji: "🏅",
                tier: "gold",
                earned: quizStats.booksPerfect >= 10,
                progress: { current: Math.min(quizStats.booksPerfect, 10), total: 10 },
            },
            {
                id: "quiz-perfect-all",
                title: "Bible Brain",
                description: "Get 100% on every book quiz",
                emoji: "🧬",
                tier: "diamond",
                earned: quizStats.booksPerfect >= getBooksWithQuestions().length,
                progress: { current: quizStats.booksPerfect, total: getBooksWithQuestions().length },
            },
        ];
    }, [stats, completedBooks, streak, quizStats]);

    const earned = achievements.filter(a => a.earned);
    const inProgress = achievements.filter(a => !a.earned && a.progress && a.progress.current > 0);

    return {
        achievements,
        earned,
        inProgress,
        streak,
        completedBooks,
    };
}
