/**
 * Daily Devotional Reading Plans — Structured multi-week journeys
 */

export interface DailyReading {
    day: number;
    bookSlug: string;
    chapter: number;
    label?: string;   // Optional override label like "Palm Sunday"
}

export interface ReadingPlan {
    id: string;
    title: string;
    description: string;
    icon: string;
    totalDays: number;
    dailyReadings: DailyReading[];
}

export const READING_PLANS: ReadingPlan[] = [
    {
        id: "gospels-30",
        title: "Gospels in 30 Days",
        description: "Walk through the life of Jesus across all four Gospel accounts.",
        icon: "📖",
        totalDays: 30,
        dailyReadings: [
            // Matthew (Days 1-9)
            { day: 1, bookSlug: "matthew", chapter: 1, label: "The Genealogy & Birth" },
            { day: 2, bookSlug: "matthew", chapter: 5, label: "Sermon on the Mount" },
            { day: 3, bookSlug: "matthew", chapter: 6 },
            { day: 4, bookSlug: "matthew", chapter: 13, label: "Kingdom Parables" },
            { day: 5, bookSlug: "matthew", chapter: 14 },
            { day: 6, bookSlug: "matthew", chapter: 22 },
            { day: 7, bookSlug: "matthew", chapter: 25, label: "The Sheep & the Goats" },
            { day: 8, bookSlug: "matthew", chapter: 26, label: "The Last Supper" },
            { day: 9, bookSlug: "matthew", chapter: 28, label: "The Resurrection" },
            // Mark (Days 10-15)
            { day: 10, bookSlug: "mark", chapter: 1, label: "The Beginning of the Gospel" },
            { day: 11, bookSlug: "mark", chapter: 4, label: "Parables & Miracles" },
            { day: 12, bookSlug: "mark", chapter: 5, label: "Jairus' Daughter" },
            { day: 13, bookSlug: "mark", chapter: 10 },
            { day: 14, bookSlug: "mark", chapter: 14, label: "Gethsemane" },
            { day: 15, bookSlug: "mark", chapter: 16, label: "He Is Risen" },
            // Luke (Days 16-23)
            { day: 16, bookSlug: "luke", chapter: 1, label: "Mary's Song" },
            { day: 17, bookSlug: "luke", chapter: 2, label: "The Christmas Story" },
            { day: 18, bookSlug: "luke", chapter: 4, label: "Jesus in Nazareth" },
            { day: 19, bookSlug: "luke", chapter: 10, label: "The Good Samaritan" },
            { day: 20, bookSlug: "luke", chapter: 15, label: "The Prodigal Son" },
            { day: 21, bookSlug: "luke", chapter: 18 },
            { day: 22, bookSlug: "luke", chapter: 22 },
            { day: 23, bookSlug: "luke", chapter: 24, label: "Road to Emmaus" },
            // John (Days 24-30)
            { day: 24, bookSlug: "john", chapter: 1, label: "In the Beginning was the Word" },
            { day: 25, bookSlug: "john", chapter: 3, label: "For God So Loved the World" },
            { day: 26, bookSlug: "john", chapter: 6, label: "Bread of Life" },
            { day: 27, bookSlug: "john", chapter: 10, label: "The Good Shepherd" },
            { day: 28, bookSlug: "john", chapter: 14, label: "The Way, the Truth, the Life" },
            { day: 29, bookSlug: "john", chapter: 17, label: "The High Priestly Prayer" },
            { day: 30, bookSlug: "john", chapter: 20, label: "Believing Without Seeing" },
        ]
    },
    {
        id: "psalms-anxiety",
        title: "Psalms for Anxiety",
        description: "14 days of comfort, peace, and reassurance from the Psalms.",
        icon: "🕊️",
        totalDays: 14,
        dailyReadings: [
            { day: 1, bookSlug: "psalms", chapter: 23, label: "The Lord Is My Shepherd" },
            { day: 2, bookSlug: "psalms", chapter: 27, label: "The Lord Is My Light" },
            { day: 3, bookSlug: "psalms", chapter: 34, label: "I Sought the Lord" },
            { day: 4, bookSlug: "psalms", chapter: 37, label: "Fret Not" },
            { day: 5, bookSlug: "psalms", chapter: 46, label: "Be Still and Know" },
            { day: 6, bookSlug: "psalms", chapter: 55, label: "Cast Your Burden" },
            { day: 7, bookSlug: "psalms", chapter: 56, label: "When I Am Afraid" },
            { day: 8, bookSlug: "psalms", chapter: 62, label: "My Soul Waits" },
            { day: 9, bookSlug: "psalms", chapter: 91, label: "Under His Wings" },
            { day: 10, bookSlug: "psalms", chapter: 103, label: "Bless the Lord, O My Soul" },
            { day: 11, bookSlug: "psalms", chapter: 121, label: "My Help Comes from the Lord" },
            { day: 12, bookSlug: "psalms", chapter: 139, label: "You Know Me" },
            { day: 13, bookSlug: "psalms", chapter: 145, label: "The Lord Is Gracious" },
            { day: 14, bookSlug: "psalms", chapter: 147, label: "He Heals the Brokenhearted" },
        ]
    },
    {
        id: "proverbs-31",
        title: "Proverbs: Daily Wisdom",
        description: "One chapter of Proverbs every day for a month. Pure, distilled wisdom.",
        icon: "💎",
        totalDays: 31,
        dailyReadings: Array.from({ length: 31 }, (_, i) => ({
            day: i + 1,
            bookSlug: "proverbs",
            chapter: i + 1,
        }))
    },
    {
        id: "advent",
        title: "Advent Season",
        description: "25 days of anticipation leading to the birth of Christ.",
        icon: "🌟",
        totalDays: 25,
        dailyReadings: [
            { day: 1, bookSlug: "isaiah", chapter: 9, label: "A Child Is Born" },
            { day: 2, bookSlug: "isaiah", chapter: 7, label: "The Virgin Shall Conceive" },
            { day: 3, bookSlug: "micah", chapter: 5, label: "Out of Bethlehem" },
            { day: 4, bookSlug: "isaiah", chapter: 11, label: "The Branch of Jesse" },
            { day: 5, bookSlug: "isaiah", chapter: 40, label: "Comfort Ye My People" },
            { day: 6, bookSlug: "malachi", chapter: 3, label: "The Messenger" },
            { day: 7, bookSlug: "psalms", chapter: 96, label: "Sing a New Song" },
            { day: 8, bookSlug: "isaiah", chapter: 60, label: "Arise, Shine!" },
            { day: 9, bookSlug: "jeremiah", chapter: 23, label: "The Righteous Branch" },
            { day: 10, bookSlug: "isaiah", chapter: 35, label: "The Desert Shall Bloom" },
            { day: 11, bookSlug: "zechariah", chapter: 9, label: "The Coming King" },
            { day: 12, bookSlug: "psalms", chapter: 2, label: "The Son of God" },
            { day: 13, bookSlug: "isaiah", chapter: 52, label: "Beautiful Feet" },
            { day: 14, bookSlug: "daniel", chapter: 7, label: "The Ancient of Days" },
            { day: 15, bookSlug: "isaiah", chapter: 53, label: "The Suffering Servant" },
            { day: 16, bookSlug: "psalms", chapter: 110, label: "Sit at My Right Hand" },
            { day: 17, bookSlug: "ruth", chapter: 4, label: "The Lineage of David" },
            { day: 18, bookSlug: "luke", chapter: 1, label: "Gabriel's Visit" },
            { day: 19, bookSlug: "matthew", chapter: 1, label: "Joseph's Dream" },
            { day: 20, bookSlug: "luke", chapter: 1, label: "Mary's Magnificat" },
            { day: 21, bookSlug: "luke", chapter: 2, label: "No Room in the Inn" },
            { day: 22, bookSlug: "luke", chapter: 2, label: "Shepherds & Angels" },
            { day: 23, bookSlug: "matthew", chapter: 2, label: "The Wise Men" },
            { day: 24, bookSlug: "john", chapter: 1, label: "The Word Made Flesh" },
            { day: 25, bookSlug: "luke", chapter: 2, label: "Glory to God in the Highest" },
        ]
    },
    {
        id: "nt-90",
        title: "New Testament in 90 Days",
        description: "Three months through the entire New Testament — about 3 chapters per day.",
        icon: "📜",
        totalDays: 90,
        dailyReadings: (() => {
            const ntBooks = [
                { slug: "matthew", chapters: 28 }, { slug: "mark", chapters: 16 }, { slug: "luke", chapters: 24 },
                { slug: "john", chapters: 21 }, { slug: "acts", chapters: 28 }, { slug: "romans", chapters: 16 },
                { slug: "1-corinthians", chapters: 16 }, { slug: "2-corinthians", chapters: 13 }, { slug: "galatians", chapters: 6 },
                { slug: "ephesians", chapters: 6 }, { slug: "philippians", chapters: 4 }, { slug: "colossians", chapters: 4 },
                { slug: "1-thessalonians", chapters: 5 }, { slug: "2-thessalonians", chapters: 3 }, { slug: "1-timothy", chapters: 6 },
                { slug: "2-timothy", chapters: 4 }, { slug: "titus", chapters: 3 }, { slug: "philemon", chapters: 1 },
                { slug: "hebrews", chapters: 13 }, { slug: "james", chapters: 5 }, { slug: "1-peter", chapters: 5 },
                { slug: "2-peter", chapters: 3 }, { slug: "1-john", chapters: 5 }, { slug: "2-john", chapters: 1 },
                { slug: "3-john", chapters: 1 }, { slug: "jude", chapters: 1 }, { slug: "revelation", chapters: 22 },
            ];
            const allChapters: DailyReading[] = [];
            let day = 1;
            for (const book of ntBooks) {
                for (let ch = 1; ch <= book.chapters; ch++) {
                    allChapters.push({ day, bookSlug: book.slug, chapter: ch });
                    day++;
                }
            }
            // Consolidate into 90 days (roughly 3 chapters per day)
            const consolidated: DailyReading[] = [];
            const chaptersPerDay = Math.ceil(allChapters.length / 90);
            for (let d = 0; d < 90; d++) {
                const idx = d * chaptersPerDay;
                if (idx < allChapters.length) {
                    consolidated.push({ ...allChapters[idx], day: d + 1 });
                }
            }
            return consolidated;
        })()
    },
    {
        id: "armor-of-god",
        title: "The Full Armor of God",
        description: "A 7-day deep dive into Ephesians 6 and spiritual warfare.",
        icon: "🛡️",
        totalDays: 7,
        dailyReadings: [
            { day: 1, bookSlug: "ephesians", chapter: 6, label: "Put On the Whole Armor" },
            { day: 2, bookSlug: "isaiah", chapter: 59, label: "The Breastplate of Righteousness" },
            { day: 3, bookSlug: "isaiah", chapter: 52, label: "Beautiful Feet — The Gospel of Peace" },
            { day: 4, bookSlug: "hebrews", chapter: 11, label: "The Shield of Faith" },
            { day: 5, bookSlug: "psalms", chapter: 140, label: "The Helmet of Salvation" },
            { day: 6, bookSlug: "hebrews", chapter: 4, label: "The Sword of the Spirit" },
            { day: 7, bookSlug: "ephesians", chapter: 6, label: "Prayer: The Binding Force" },
        ]
    }
];
