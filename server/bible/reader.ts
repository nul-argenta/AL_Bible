/**
 * Armor & Light — Bible Reader Service
 * 
 * Database query layer for Bible text, Strong's definitions, and cross-references.
 */
import { db, sqlite } from "../db";
import { eq, and, like, desc, sql } from "drizzle-orm";
import {
  books as booksTable,
  verses as versesTable,
  strongsDefinitions,
  crossReferences,
  commentaries,
  highlights,
  notes,
  readingProgress,
  favouriteVerses,
  memoryCards,
  planProgress,
  prayerRequests,
  readingHistory,
  userSettings,
  quizResults,
  userLinks,
  studyChainProgress,
  MemoryCard,
  PrayerRequest,
  QuizResult,
  UserLink,
  StudyChainProgress
} from "@shared/schema";

export function getDb() {
  return sqlite;
}

export function checkDatabaseHealth() {
  try {
    const result = sqlite.prepare("PRAGMA integrity_check").get() as { integrity_check: string };
    return {
      ok: result.integrity_check === "ok",
      message: result.integrity_check
    };
  } catch (error: any) {
    return { ok: false, message: error.message };
  }
}

// ─── Queries (Legacy better-sqlite3 for reading static data) ──────────

export async function getBooks() {
  const stmt = sqlite.prepare(`
    SELECT id, name, slug, testament,
      book_order AS bookOrder,
      chapter_count AS chapterCount
    FROM books ORDER BY book_order
  `);
  return stmt.all();
}

export async function getVerses(bookSlug: string, chapter: number) {
  const stmt = sqlite.prepare(`
    SELECT v.*, 
      COALESCE(v.text_web, v.text_kjv) as text_primary,
      b.name as book_name, b.slug as book_slug
    FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = ? AND v.chapter = ?
    ORDER BY v.verse
  `);
  const verses = stmt.all(bookSlug, chapter) as any[];

  // Hydrate interlinear data with original words from strongs_definitions
  // This avoids storing thousands of redundant greek/hebrew strings in the verses table
  const strongsStmt = sqlite.prepare("SELECT original_word FROM strongs_definitions WHERE strongs_number = ?");
  const strongsCache = new Map<string, string>();

  for (const v of verses) {
    if (v.interlinear_data) {
      try {
        const words = JSON.parse(v.interlinear_data) as { e: string, s: string }[];
        const hydrated = words.map(w => {
          if (!w.s) return w;
          let original = strongsCache.get(w.s);
          if (original === undefined) {
            const def = strongsStmt.get(w.s as string) as any;
            const newOrig = def ? def.original_word : "";
            strongsCache.set(w.s, newOrig);
            original = newOrig;
          }
          return { ...w, o: original }; // o = original script
        });
        v.interlinear_data = JSON.stringify(hydrated);
      } catch (e) {
        console.error("Failed to parse/hydrate interlinear data for verse", v.id, e);
      }
    }
  }

  return verses;
}

export async function searchVerses(query: string, limit = 50) {
  const stmt = sqlite.prepare(`
    SELECT v.*, 
      COALESCE(v.text_web, v.text_kjv) as text_primary,
      b.name as book_name, b.slug as book_slug
    FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE COALESCE(v.text_web, v.text_kjv) LIKE ?
    ORDER BY b.book_order, v.chapter, v.verse
    LIMIT ?
  `);
  return stmt.all(`%${query}%`, limit);
}

export async function getStrongsDefinition(strongsNumber: string) {
  const stmt = sqlite.prepare("SELECT * FROM strongs_definitions WHERE strongs_number = ?");
  return stmt.get((strongsNumber || "").toUpperCase());
}

export async function searchStrongs(query: string, limit = 50) {
  const searchTerm = `%${query}%`;
  const stmt = sqlite.prepare(`
    SELECT * FROM strongs_definitions 
    WHERE strongs_number LIKE ? 
       OR original_word LIKE ? 
       OR transliteration LIKE ? 
       OR definition LIKE ?
       OR kjv_usage LIKE ?
    ORDER BY strongs_number
    LIMIT ?
  `);
  return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit);
}

export async function getCrossReferences(verseId: number) {
  const stmt = sqlite.prepare(`
    SELECT cr.*, 
      v.chapter as to_chapter, v.verse as to_verse, COALESCE(v.text_web, v.text_kjv) as to_text,
      b.name as to_book_name, b.slug as to_book_slug
    FROM cross_references cr
    JOIN verses v ON cr.to_verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE cr.from_verse_id = ?
    ORDER BY b.book_order, v.chapter, v.verse
  `);
  return stmt.all(verseId);
}

export async function getVerseById(verseId: number) {
  const stmt = sqlite.prepare(`
    SELECT v.*, b.name as book_name, b.slug as book_slug
    FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE v.id = ?
  `);
  return stmt.get(verseId);
}

export async function getCommentary(verseId: number) {
  const stmt = sqlite.prepare(`
    SELECT c.* 
    FROM commentaries c
    WHERE c.verse_id = ?
  `);
  return stmt.all(verseId);
}

export async function getVersesByStrongs(strongsNumber: string) {
  const stmt = sqlite.prepare(`
    SELECT v.*, 
      COALESCE(v.text_web, v.text_kjv) as text_primary,
      b.name as book_name, b.slug as book_slug
    FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE v.strongs_numbers LIKE ?
    ORDER BY b.book_order, v.chapter, v.verse
    LIMIT 50
  `);
  return stmt.all(`%${strongsNumber}%`);
}

// ─── Highlights (Migrated to Drizzle) ───────────────────────────────

export function getHighlightsForChapter(bookSlug: string, chapter: number, clerkId: string) {
  return db.select({
    verseId: highlights.verseId,
    color: highlights.color,
    label: highlights.label
  })
    .from(highlights)
    .innerJoin(versesTable, eq(highlights.verseId, versesTable.id))
    .innerJoin(booksTable, eq(versesTable.bookId, booksTable.id))
    .where(
      and(
        eq(booksTable.slug, bookSlug),
        eq(versesTable.chapter, chapter),
        eq(highlights.clerkId, clerkId)
      )
    )
    .all();
}

export function setHighlight(verseId: number, color: string, clerkId: string, label?: string) {
  // First we need to check if there is an existing highlight for this user + verse
  const existing = db.select().from(highlights).where(and(eq(highlights.verseId, verseId), eq(highlights.clerkId, clerkId))).get();

  if (existing) {
    return db.update(highlights).set({ color, label }).where(eq(highlights.id, existing.id)).run();
  }

  return db.insert(highlights)
    .values({ verseId, color, clerkId, label })
    .run();
}

export function removeHighlight(verseId: number, clerkId: string) {
  return db.delete(highlights)
    .where(and(eq(highlights.verseId, verseId), eq(highlights.clerkId, clerkId)))
    .run();
}

// ─── Notes (Migrated to Drizzle) ───────────────────────────────────

export function getNotesForChapter(bookSlug: string, chapter: number, clerkId: string) {
  return db.select({
    verseId: notes.verseId,
    text: notes.text,
    createdAt: notes.createdAt,
    updatedAt: notes.updatedAt
  })
    .from(notes)
    .innerJoin(versesTable, eq(notes.verseId, versesTable.id))
    .innerJoin(booksTable, eq(versesTable.bookId, booksTable.id))
    .where(
      and(
        eq(booksTable.slug, bookSlug),
        eq(versesTable.chapter, chapter),
        eq(notes.clerkId, clerkId)
      )
    )
    .all();
}

export function getNoteForVerse(verseId: number, clerkId: string) {
  return db.select()
    .from(notes)
    .where(and(eq(notes.verseId, verseId), eq(notes.clerkId, clerkId)))
    .get();
}

export function saveNote(verseId: number, text: string, clerkId: string) {
  if (!text || !text.trim()) {
    return deleteNote(verseId, clerkId);
  }

  const existing = db.select().from(notes).where(and(eq(notes.verseId, verseId), eq(notes.clerkId, clerkId))).get();

  if (existing) {
    return db.update(notes).set({ text: text.trim(), updatedAt: sql`datetime('now')` }).where(eq(notes.id, existing.id)).run();
  }

  return db.insert(notes)
    .values({ verseId, text: text.trim(), clerkId })
    .run();
}

export function deleteNote(verseId: number, clerkId: string) {
  return db.delete(notes)
    .where(and(eq(notes.verseId, verseId), eq(notes.clerkId, clerkId)))
    .run();
}

export function getAllNotes() {
  // Note: Drizzle raw result for complex joins might need better typing
  return db.select({
    id: notes.id,
    verseId: notes.verseId,
    text: notes.text,
    createdAt: notes.createdAt,
    updatedAt: notes.updatedAt,
    verse: versesTable.verse,
    chapter: versesTable.chapter,
    verse_text: sql<string>`COALESCE(${versesTable.textWeb}, ${versesTable.textKjv})`,
    book_name: booksTable.name,
    book_slug: booksTable.slug
  })
    .from(notes)
    .innerJoin(versesTable, eq(notes.verseId, versesTable.id))
    .innerJoin(booksTable, eq(versesTable.bookId, booksTable.id))
    .orderBy(desc(notes.updatedAt))
    .all();
}

// ─── Reading Progress ──────────────────────────────────────────────

export function getReadingProgress(clerkId: string) {
  return db.select().from(readingProgress).where(eq(readingProgress.clerkId, clerkId)).all();
}

export function syncReadingProgress(clerkId: string, bookSlug: string, chapter: number, isRead: boolean) {
  const existing = db.select()
    .from(readingProgress)
    .where(and(
      eq(readingProgress.clerkId, clerkId),
      eq(readingProgress.bookSlug, bookSlug),
      eq(readingProgress.chapter, chapter)
    ))
    .get();

  if (existing) {
    return db.update(readingProgress)
      .set({ isRead, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(readingProgress.id, existing.id))
      .run();
  }

  return db.insert(readingProgress)
    .values({ clerkId, bookSlug, chapter, isRead })
    .run();
}

// ─── Favourites ────────────────────────────────────────────────────

export function getFavourites(clerkId: string) {
  return db.select({
    id: favouriteVerses.id,
    verseId: favouriteVerses.verseId,
    createdAt: favouriteVerses.createdAt,
    bookId: versesTable.bookId,
    verseChapter: versesTable.chapter,
    verseNum: versesTable.verse,
    bookName: booksTable.name,
    textWeb: versesTable.textWeb
  })
    .from(favouriteVerses)
    .innerJoin(versesTable, eq(favouriteVerses.verseId, versesTable.id))
    .innerJoin(booksTable, eq(versesTable.bookId, booksTable.id))
    .where(eq(favouriteVerses.clerkId, clerkId))
    .orderBy(desc(favouriteVerses.createdAt))
    .all();
}

export function addFavourite(clerkId: string, verseId: number) {
  const existing = db.select()
    .from(favouriteVerses)
    .where(and(eq(favouriteVerses.clerkId, clerkId), eq(favouriteVerses.verseId, verseId)))
    .get();

  if (existing) return { success: true };

  return db.insert(favouriteVerses)
    .values({ clerkId, verseId })
    .run();
}

export function removeFavourite(clerkId: string, verseId: number) {
  return db.delete(favouriteVerses)
    .where(and(eq(favouriteVerses.clerkId, clerkId), eq(favouriteVerses.verseId, verseId)))
    .run();
}

// ─── Reading History ────────────────────────────────────────────────

export function getReadingHistory(clerkId: string, limit = 20) {
  return db.select()
    .from(readingHistory)
    .where(eq(readingHistory.clerkId, clerkId))
    .orderBy(desc(readingHistory.timestamp))
    .limit(limit)
    .all();
}

export function recordReadingHistory(clerkId: string, entry: { bookSlug: string, bookName: string, chapter: number, verse?: number }) {
  // Dedupe: one entry per book+chapter
  const existing = db.select()
    .from(readingHistory)
    .where(and(
      eq(readingHistory.clerkId, clerkId),
      eq(readingHistory.bookSlug, entry.bookSlug),
      eq(readingHistory.chapter, entry.chapter)
    ))
    .get();

  if (existing) {
    return db.update(readingHistory)
      .set({ timestamp: Date.now(), verse: entry.verse })
      .where(eq(readingHistory.id, existing.id))
      .run();
  }

  return db.insert(readingHistory)
    .values({ ...entry, clerkId, timestamp: Date.now() })
    .run();
}

// ─── User Settings ──────────────────────────────────────────────────

export function getUserSettings(clerkId: string) {
  return db.select().from(userSettings).where(eq(userSettings.clerkId, clerkId)).get();
}

export function saveUserSettings(clerkId: string, settingsJson: string) {
  const existing = db.select().from(userSettings).where(eq(userSettings.clerkId, clerkId)).get();

  if (existing) {
    return db.update(userSettings)
      .set({ settingsJson, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(userSettings.id, existing.id))
      .run();
  }

  return db.insert(userSettings)
    .values({ clerkId, settingsJson })
    .run();
}

// ─── Memory Cards ──────────────────────────────────────────────────

export function getDueMemoryCards(clerkId: string, today: string) {
  return db.select({
    mc: memoryCards,
    verse: versesTable,
    bookName: booksTable.name,
    bookSlug: booksTable.slug
  })
    .from(memoryCards)
    .innerJoin(versesTable, eq(memoryCards.verseId, versesTable.id))
    .innerJoin(booksTable, eq(versesTable.bookId, booksTable.id))
    .where(and(eq(memoryCards.clerkId, clerkId), sql`${memoryCards.nextReview} <= ${today}`))
    .orderBy(memoryCards.nextReview)
    .all();
}

export function getMemoryStats(clerkId: string, today: string) {
  const total = db.select({ count: sql<number>`count(*)` }).from(memoryCards).where(eq(memoryCards.clerkId, clerkId)).get();
  const due = db.select({ count: sql<number>`count(*)` }).from(memoryCards).where(and(eq(memoryCards.clerkId, clerkId), sql`${memoryCards.nextReview} <= ${today}`)).get();
  const mastered = db.select({ count: sql<number>`count(*)` }).from(memoryCards).where(and(eq(memoryCards.clerkId, clerkId), sql`${memoryCards.repetitions} >= 5`)).get();

  return {
    total: total?.count || 0,
    due: due?.count || 0,
    mastered: mastered?.count || 0
  };
}

export function addMemoryCard(clerkId: string, verseId: number, nextReview: string) {
  const existing = db.select().from(memoryCards).where(and(eq(memoryCards.clerkId, clerkId), eq(memoryCards.verseId, verseId))).get();
  if (existing) return { success: true };

  return db.insert(memoryCards)
    .values({ clerkId, verseId, nextReview })
    .run();
}

export function updateMemoryCard(clerkId: string, verseId: number, data: Partial<MemoryCard>) {
  return db.update(memoryCards)
    .set(data)
    .where(and(eq(memoryCards.clerkId, clerkId), eq(memoryCards.verseId, verseId)))
    .run();
}

export function deleteMemoryCard(clerkId: string, verseId: number) {
  return db.delete(memoryCards)
    .where(and(eq(memoryCards.clerkId, clerkId), eq(memoryCards.verseId, verseId)))
    .run();
}

// ─── Reading Plans ───────────────────────────────────────────────

export function getActivePlan(clerkId: string) {
  return db.select().from(planProgress).where(and(eq(planProgress.clerkId, clerkId), eq(planProgress.isActive, true))).get();
}

export function startPlan(clerkId: string, planId: string, startDate: string) {
  // Deactivate any existing active plan
  db.update(planProgress).set({ isActive: false }).where(and(eq(planProgress.clerkId, clerkId), eq(planProgress.isActive, true))).run();

  const existing = db.select().from(planProgress).where(and(eq(planProgress.clerkId, clerkId), eq(planProgress.planId, planId))).get();

  if (existing) {
    return db.update(planProgress)
      .set({ startDate, completedDays: "[]", isActive: true })
      .where(eq(planProgress.id, existing.id))
      .run();
  }

  return db.insert(planProgress)
    .values({ clerkId, planId, startDate, completedDays: "[]", isActive: true })
    .run();
}

export function updatePlanProgress(clerkId: string, planId: string, completedDaysJson: string) {
  return db.update(planProgress)
    .set({ completedDays: completedDaysJson })
    .where(and(eq(planProgress.clerkId, clerkId), eq(planProgress.planId, planId), eq(planProgress.isActive, true)))
    .run();
}

export function abandonPlan(clerkId: string, planId: string) {
  return db.update(planProgress)
    .set({ isActive: false })
    .where(and(eq(planProgress.clerkId, clerkId), eq(planProgress.planId, planId)))
    .run();
}

// ─── Prayer Requests ────────────────────────────────────────────────

export function getPrayerRequests(clerkId: string) {
  return db.select()
    .from(prayerRequests)
    .where(eq(prayerRequests.clerkId, clerkId))
    .orderBy(prayerRequests.isAnswered, desc(prayerRequests.createdAt))
    .all();
}

export function createPrayerRequest(clerkId: string, data: any) {
  return db.insert(prayerRequests)
    .values({ ...data, clerkId })
    .run();
}

export function updatePrayerRequest(clerkId: string, id: number, data: Partial<PrayerRequest>) {
  return db.update(prayerRequests)
    .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(and(eq(prayerRequests.id, id), eq(prayerRequests.clerkId, clerkId)))
    .run();
}

export function deletePrayerRequest(clerkId: string, id: number) {
  return db.delete(prayerRequests)
    .where(and(eq(prayerRequests.id, id), eq(prayerRequests.clerkId, clerkId)))
    .run();
}

// ─── Quiz Results ──────────────────────────────────────────────────

export function getQuizResults(clerkId: string) {
  return db.select()
    .from(quizResults)
    .where(eq(quizResults.clerkId, clerkId))
    .all();
}

export function saveQuizResult(clerkId: string, data: any) {
  const existing = db.select().from(quizResults).where(and(eq(quizResults.clerkId, clerkId), eq(quizResults.bookSlug, data.bookSlug))).get();

  if (existing) {
    return db.update(quizResults)
      .set({
        ...data,
        bestScore: Math.max(data.correctAnswers, existing.bestScore),
        attempts: existing.attempts + 1,
        lastAttempt: Date.now()
      })
      .where(eq(quizResults.id, existing.id))
      .run();
  }

  return db.insert(quizResults)
    .values({
      ...data,
      clerkId,
      bestScore: data.correctAnswers,
      attempts: 1,
      lastAttempt: Date.now()
    })
    .run();
}

export function resetQuizResult(clerkId: string, bookSlug: string) {
  return db.delete(quizResults)
    .where(and(eq(quizResults.clerkId, clerkId), eq(quizResults.bookSlug, bookSlug)))
    .run();
}

// ─── User Links ──────────────────────────────────────────────────────

export function getUserLinks(clerkId: string, fromVerseId?: number) {
  let query = db.select().from(userLinks).where(eq(userLinks.clerkId, clerkId));
  if (fromVerseId != null) {
    query = db.select().from(userLinks).where(and(eq(userLinks.clerkId, clerkId), eq(userLinks.fromVerseId, fromVerseId))) as any;
  }
  return query.all();
}

export function addUserLink(clerkId: string, link: any) {
  return db.insert(userLinks)
    .values({ ...link, clerkId })
    .run();
}

export function removeUserLink(clerkId: string, id: string) {
  return db.delete(userLinks)
    .where(and(eq(userLinks.clerkId, clerkId), eq(userLinks.id, id)))
    .run();
}

// ─── Study Chain Progress ──────────────────────────────────────────

export function getStudyChainProgress(clerkId: string, chainId?: string) {
  const query = db.select().from(studyChainProgress).where(eq(studyChainProgress.clerkId, clerkId));
  if (chainId) {
    return db.select().from(studyChainProgress).where(and(eq(studyChainProgress.clerkId, clerkId), eq(studyChainProgress.chainId, chainId))).get();
  }
  return query.all();
}

export function saveStudyChainProgress(clerkId: string, chainId: string, passageIndicesJson: string) {
  const existing = db.select().from(studyChainProgress).where(and(eq(studyChainProgress.clerkId, clerkId), eq(studyChainProgress.chainId, chainId))).get();

  if (existing) {
    return db.update(studyChainProgress)
      .set({ passageIndicesJson, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(studyChainProgress.id, existing.id))
      .run();
  }

  return db.insert(studyChainProgress)
    .values({ clerkId, chainId, passageIndicesJson })
    .run();
}

export function resetStudyChainProgress(clerkId: string, chainId: string) {
  return db.delete(studyChainProgress)
    .where(and(eq(studyChainProgress.clerkId, clerkId), eq(studyChainProgress.chainId, chainId)))
    .run();
}
