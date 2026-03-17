/**
 * Armor & Light — Database Schema
 * 
 * Drizzle ORM schema for the Bible study platform.
 * Tables: books, verses, strongs_definitions, cross_references, users, feedback
 */

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Books ───────────────────────────────────────────────────────────
export const books = sqliteTable("books", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),           // "Genesis", "Exodus", etc.
    slug: text("slug").notNull().unique(),   // "genesis", "exodus"
    testament: text("testament").notNull(),  // "OT" or "NT"
    bookOrder: integer("book_order").notNull(),
    chapterCount: integer("chapter_count").notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({ id: true });
export type Book = typeof books.$inferSelect;

// ─── Book Introductions ──────────────────────────────────────────────
export const bookIntroductions = sqliteTable("book_introductions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id").notNull().references(() => books.id),
    author: text("author"),
    overview: text("overview"),
    theme: text("theme"),
    keyVerses: text("key_verses"),
    outline: text("outline"),
});

export const insertBookIntroSchema = createInsertSchema(bookIntroductions).omit({ id: true });
export type BookIntroduction = typeof bookIntroductions.$inferSelect;

// ─── Verses ──────────────────────────────────────────────────────────
export const verses = sqliteTable("verses", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id").notNull().references(() => books.id),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),

    // Translations (WEB = primary, public domain)
    textWeb: text("text_web"),               // World English Bible (PRIMARY)
    textKjv: text("text_kjv"),               // King James Version
    textEsv: text("text_esv"),               // English Standard Version (requires license)

    // Original Languages
    textHebrew: text("text_hebrew"),         // Hebrew (OT)
    textGreek: text("text_greek"),           // Greek (NT)

    // Multi-language
    textKorean: text("text_korean"),         // Korean
    textChinese: text("text_chinese"),       // Chinese (Simplified)

    // Strong's Numbers (comma-separated list)
    strongsNumbers: text("strongs_numbers"),

    // Transliteration
    transliteration: text("transliteration"),

    // Interlinear Word Array (JSON stringified)
    interlinearData: text("interlinear_data"),
});

export const insertVerseSchema = createInsertSchema(verses).omit({ id: true });
export type Verse = typeof verses.$inferSelect;

// ─── Strong's Concordance Definitions ────────────────────────────────
export const strongsDefinitions = sqliteTable("strongs_definitions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    strongsNumber: text("strongs_number").notNull().unique(), // "H1", "G3056"
    language: text("language").notNull(),       // "hebrew" or "greek"
    originalWord: text("original_word"),        // The word in original script
    transliteration: text("transliteration"),   // Romanized pronunciation
    pronunciation: text("pronunciation"),
    definition: text("definition").notNull(),   // English definition
    kjvUsage: text("kjv_usage"),               // KJV translation usage
    outline: text("outline"),                  // Extended definition / usage notes
});

export const insertStrongsSchema = createInsertSchema(strongsDefinitions).omit({ id: true });
export type StrongsDefinition = typeof strongsDefinitions.$inferSelect;

// ─── Cross-References ────────────────────────────────────────────────
export const crossReferences = sqliteTable("cross_references", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fromVerseId: integer("from_verse_id").notNull().references(() => verses.id),
    toVerseId: integer("to_verse_id").notNull().references(() => verses.id),
    votes: integer("votes").default(0),        // Community-driven relevance
});

export const insertCrossRefSchema = createInsertSchema(crossReferences).omit({ id: true });
export type CrossReference = typeof crossReferences.$inferSelect;

// ─── Commentaries ───────────────────────────────────────────────────
export const commentaries = sqliteTable("commentaries", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    verseId: integer("verse_id").notNull().references(() => verses.id),
    author: text("author").notNull(),
    text: text("text").notNull(),
    source: text("source"),
});

export const insertCommentarySchema = createInsertSchema(commentaries).omit({ id: true });
export type Commentary = typeof commentaries.$inferSelect;

// ─── Users (for Auth & Community) ────────────────────────────────────
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").unique(), // Optional for legacy parity, but required for new active users
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),
    role: text("role").default("member"),       // "admin", "moderator", "member"
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;

// ─── AI Feedback ─────────────────────────────────────────────────────
export const feedback = sqliteTable("feedback", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    aiResponse: text("ai_response"),
    rating: integer("rating"),                  // 1 = positive, 0 = negative
    comment: text("comment"),
    context: text("context"),                   // JSON blob
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });
export type Feedback = typeof feedback.$inferSelect;

// ─── Community Posts ─────────────────────────────────────────────────
export const posts = sqliteTable("posts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    verseId: integer("verse_id").references(() => verses.id),
    content: text("content").notNull(),
    parentId: integer("parent_id"),             // For threaded replies
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
export type Post = typeof posts.$inferSelect;

// ─── Post Likes ──────────────────────────────────────────────────────
export const postLikes = sqliteTable("post_likes", {
    userId: integer("user_id").notNull().references(() => users.id),
    postId: integer("post_id").notNull().references(() => posts.id),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ createdAt: true });
export type PostLike = typeof postLikes.$inferSelect;

// ─── Highlights ─────────────────────────────────────────────────────
export const highlights = sqliteTable("highlights", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(), // Tie to Clerk User ID
    verseId: integer("verse_id").notNull().references(() => verses.id),
    color: text("color").notNull().default("yellow"),
    label: text("label"), // Optional label for the highlight
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertHighlightSchema = createInsertSchema(highlights).omit({ id: true, createdAt: true });
export type Highlight = typeof highlights.$inferSelect;

// ─── Notes ──────────────────────────────────────────────────────────
export const notes = sqliteTable("notes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(), // Tie to Clerk User ID
    verseId: integer("verse_id").notNull().references(() => verses.id),
    text: text("text").notNull(),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export type Note = typeof notes.$inferSelect;

// ─── Reading Progress (Cloud Sync) ──────────────────────────────────
export const readingProgress = sqliteTable("reading_progress", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    bookSlug: text("book_slug").notNull(),
    chapter: integer("chapter").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({ id: true, updatedAt: true });
export type ReadingProgress = typeof readingProgress.$inferSelect;

// ─── Favourite Verses (Cloud Sync) ──────────────────────────────────
export const favouriteVerses = sqliteTable("favourite_verses", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    verseId: integer("verse_id").notNull().references(() => verses.id),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertFavouriteVerseSchema = createInsertSchema(favouriteVerses).omit({ id: true, createdAt: true });
export type FavouriteVerse = typeof favouriteVerses.$inferSelect;

// ─── Memory Cards (Verse Memory Trainer) ─────────────────────────────
export const memoryCards = sqliteTable("memory_cards", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    verseId: integer("verse_id").notNull().references(() => verses.id),
    easeFactor: integer("ease_factor").notNull().default(2.5),
    interval: integer("interval").notNull().default(1),
    repetitions: integer("repetitions").notNull().default(0),
    nextReview: text("next_review").notNull(),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertMemoryCardSchema = createInsertSchema(memoryCards).omit({ id: true, createdAt: true });
export type MemoryCard = typeof memoryCards.$inferSelect;

// ─── Devotional Reading Plans ────────────────────────────────────────
export const planProgress = sqliteTable("plan_progress", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    planId: text("plan_id").notNull(),
    startDate: text("start_date").notNull(),
    completedDays: text("completed_days").notNull().default("[]"), // JSON array
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertPlanProgressSchema = createInsertSchema(planProgress).omit({ id: true, createdAt: true });
export type PlanProgress = typeof planProgress.$inferSelect;

// ─── Prayer Journal ──────────────────────────────────────────────────
export const prayerRequests = sqliteTable("prayer_requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    category: text("category").default("personal"),
    verseRef: text("verse_ref"),
    isAnswered: integer("is_answered", { mode: "boolean" }).default(false),
    answeredDate: text("answered_date"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({ id: true, createdAt: true, updatedAt: true });
export type PrayerRequest = typeof prayerRequests.$inferSelect;

// ─── Quiz Results ────────────────────────────────────────────────────
export const quizResults = sqliteTable("quiz_results", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    bookSlug: text("book_slug").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    correctAnswers: integer("correct_answers").notNull(),
    bestScore: integer("best_score").notNull(),
    attempts: integer("attempts").notNull(),
    lastAttempt: integer("last_attempt").notNull(),
    answeredQuestionsJson: text("answered_questions_json"),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true, createdAt: true });
export type QuizResult = typeof quizResults.$inferSelect;

// ─── User Links ──────────────────────────────────────────────────────
export const userLinks = sqliteTable("user_links", {
    id: text("id").primaryKey(), // UUID
    clerkId: text("clerk_id").notNull(),
    fromVerseId: integer("from_verse_id").notNull(),
    toVerseId: integer("to_verse_id").notNull(),
    toVerseRef: text("to_verse_ref").notNull(),
    toBookSlug: text("to_book_slug").notNull(),
    toChapter: integer("to_chapter").notNull(),
    toVerse: integer("to_verse").notNull(),
    toText: text("to_text").notNull(),
    createdAt: integer("created_at").notNull(),
});

export type UserLink = typeof userLinks.$inferSelect;

// ─── Study Chain Progress ──────────────────────────────────────────
export const studyChainProgress = sqliteTable("study_chain_progress", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    chainId: text("chain_id").notNull(),
    passageIndicesJson: text("passage_indices_json").notNull(), // JSON array of indices
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type StudyChainProgress = typeof studyChainProgress.$inferSelect;

// ─── Reading History ────────────────────────────────────────────────
export const readingHistory = sqliteTable("reading_history", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull(),
    bookSlug: text("book_slug").notNull(),
    bookName: text("book_name").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse"),
    timestamp: integer("timestamp").notNull(),
});

export const insertReadingHistorySchema = createInsertSchema(readingHistory).omit({ id: true });
export type ReadingHistory = typeof readingHistory.$inferSelect;

// ─── User Settings ──────────────────────────────────────────────────
export const userSettings = sqliteTable("user_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clerkId: text("clerk_id").notNull().unique(),
    settingsJson: text("settings_json").notNull(), // JSON blob for flexible settings
    updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, updatedAt: true });
export type UserSettings = typeof userSettings.$inferSelect;
