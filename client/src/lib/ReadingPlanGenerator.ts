import { AT_BIBLE_BOOKS, BookMeta } from "./bibleData";

export interface ReadingSegment {
    bookSlug: string;
    bookName: string;
    startChapter: number;
    endChapter: number;
}

export interface PlanDay {
    dayIndex: number;
    segments: ReadingSegment[];
}

export interface ReadingPlan {
    id: string;
    targetDays: number;
    days: PlanDay[];
}

export class ReadingPlanGenerator {
    /**
     * Generate a reading plan spanning a specific number of days,
     * given an array of book slugs. It attempts to balance chapters per day.
     */
    static generatePlan(planId: string, bookSlugs: string[], targetDays: number): ReadingPlan {
        const selectedBooks = AT_BIBLE_BOOKS.filter(b => bookSlugs.includes(b.slug));
        
        if (selectedBooks.length === 0) {
            throw new Error("No valid books selected for reading plan");
        }

        const totalChapters = selectedBooks.reduce((sum, book) => sum + book.chapters, 0);
        const chaptersPerDay = Math.max(1, Math.round(totalChapters / targetDays));
        
        const days: PlanDay[] = [];
        let currentDayIndex = 1;
        let currentDaySegments: ReadingSegment[] = [];
        let chaptersAssignedToday = 0;

        for (const book of selectedBooks) {
            let chaptersRemainingInBook = book.chapters;
            let currentChapter = 1;

            while (chaptersRemainingInBook > 0) {
                // How much capacity do we have left today?
                const dailyCapacity = chaptersPerDay - chaptersAssignedToday;
                
                if (dailyCapacity <= 0) {
                    // Start a new day
                    days.push({ dayIndex: currentDayIndex, segments: currentDaySegments });
                    currentDayIndex++;
                    currentDaySegments = [];
                    chaptersAssignedToday = 0;
                    continue;
                }

                const chaptersToTake = Math.min(dailyCapacity, chaptersRemainingInBook);
                
                currentDaySegments.push({
                    bookSlug: book.slug,
                    bookName: book.name,
                    startChapter: currentChapter,
                    endChapter: currentChapter + chaptersToTake - 1
                });

                currentChapter += chaptersToTake;
                chaptersRemainingInBook -= chaptersToTake;
                chaptersAssignedToday += chaptersToTake;
            }
        }

        // Push any remaining segments into the final day
        if (currentDaySegments.length > 0) {
            days.push({ dayIndex: currentDayIndex, segments: currentDaySegments });
        }

        return {
            id: planId,
            targetDays: days.length, // May slightly deviate from targetDays depending on rounding, so we return actual length
            days
        };
    }

    /**
     * Generates a preset "Whole Bible in 1 Year" plan
     */
    static generateWholeBible1Year(): ReadingPlan {
        return this.generatePlan("whole-bible-365", AT_BIBLE_BOOKS.map(b => b.slug), 365);
    }

    /**
     * Generates a "Gospels in 30 Days" plan
     */
    static generateGospels30Days(): ReadingPlan {
        const gospelSlugs = ["matthew", "mark", "luke", "john"];
        return this.generatePlan("gospels-30", gospelSlugs, 30);
    }
}
