export interface BookMeta {
    name: string;
    slug: string;
    chapters: number;
    category: string;
}

export type BibleCategory = {
    id: string;
    label: string;
    emoji: string;
    testament: "OT" | "NT";
    description: string;
};

export const BIBLE_CATEGORIES: BibleCategory[] = [
    { id: "law", label: "The Law", emoji: "📜", testament: "OT", description: "Torah / Pentateuch" },
    { id: "ot-history", label: "History", emoji: "⚔️", testament: "OT", description: "Historical Books" },
    { id: "wisdom", label: "Wisdom & Poetry", emoji: "🕊️", testament: "OT", description: "Poetic & Wisdom Literature" },
    { id: "major-prophets", label: "Major Prophets", emoji: "🔥", testament: "OT", description: "Major Prophetic Books" },
    { id: "minor-prophets", label: "Minor Prophets", emoji: "📢", testament: "OT", description: "The Twelve" },
    { id: "gospels", label: "Gospels", emoji: "✝️", testament: "NT", description: "Life of Christ" },
    { id: "nt-history", label: "Acts", emoji: "🌍", testament: "NT", description: "Early Church History" },
    { id: "pauline", label: "Pauline Epistles", emoji: "✉️", testament: "NT", description: "Letters of Paul" },
    { id: "general", label: "General Epistles", emoji: "📨", testament: "NT", description: "Other Letters" },
    { id: "prophecy", label: "Prophecy", emoji: "👑", testament: "NT", description: "Apocalyptic Literature" },
];

export const AT_BIBLE_BOOKS: BookMeta[] = [
    // ─── The Law (Torah/Pentateuch) ───
    { name: "Genesis", slug: "genesis", chapters: 50, category: "law" },
    { name: "Exodus", slug: "exodus", chapters: 40, category: "law" },
    { name: "Leviticus", slug: "leviticus", chapters: 27, category: "law" },
    { name: "Numbers", slug: "numbers", chapters: 36, category: "law" },
    { name: "Deuteronomy", slug: "deuteronomy", chapters: 34, category: "law" },
    // ─── OT History ───
    { name: "Joshua", slug: "joshua", chapters: 24, category: "ot-history" },
    { name: "Judges", slug: "judges", chapters: 21, category: "ot-history" },
    { name: "Ruth", slug: "ruth", chapters: 4, category: "ot-history" },
    { name: "1 Samuel", slug: "1-samuel", chapters: 31, category: "ot-history" },
    { name: "2 Samuel", slug: "2-samuel", chapters: 24, category: "ot-history" },
    { name: "1 Kings", slug: "1-kings", chapters: 22, category: "ot-history" },
    { name: "2 Kings", slug: "2-kings", chapters: 25, category: "ot-history" },
    { name: "1 Chronicles", slug: "1-chronicles", chapters: 29, category: "ot-history" },
    { name: "2 Chronicles", slug: "2-chronicles", chapters: 36, category: "ot-history" },
    { name: "Ezra", slug: "ezra", chapters: 10, category: "ot-history" },
    { name: "Nehemiah", slug: "nehemiah", chapters: 13, category: "ot-history" },
    { name: "Esther", slug: "esther", chapters: 10, category: "ot-history" },
    // ─── Wisdom & Poetry ───
    { name: "Job", slug: "job", chapters: 42, category: "wisdom" },
    { name: "Psalms", slug: "psalms", chapters: 150, category: "wisdom" },
    { name: "Proverbs", slug: "proverbs", chapters: 31, category: "wisdom" },
    { name: "Ecclesiastes", slug: "ecclesiastes", chapters: 12, category: "wisdom" },
    { name: "Song of Solomon", slug: "song-of-solomon", chapters: 8, category: "wisdom" },
    // ─── Major Prophets ───
    { name: "Isaiah", slug: "isaiah", chapters: 66, category: "major-prophets" },
    { name: "Jeremiah", slug: "jeremiah", chapters: 52, category: "major-prophets" },
    { name: "Lamentations", slug: "lamentations", chapters: 5, category: "major-prophets" },
    { name: "Ezekiel", slug: "ezekiel", chapters: 48, category: "major-prophets" },
    { name: "Daniel", slug: "daniel", chapters: 12, category: "major-prophets" },
    // ─── Minor Prophets ───
    { name: "Hosea", slug: "hosea", chapters: 14, category: "minor-prophets" },
    { name: "Joel", slug: "joel", chapters: 3, category: "minor-prophets" },
    { name: "Amos", slug: "amos", chapters: 9, category: "minor-prophets" },
    { name: "Obadiah", slug: "obadiah", chapters: 1, category: "minor-prophets" },
    { name: "Jonah", slug: "jonah", chapters: 4, category: "minor-prophets" },
    { name: "Micah", slug: "micah", chapters: 7, category: "minor-prophets" },
    { name: "Nahum", slug: "nahum", chapters: 3, category: "minor-prophets" },
    { name: "Habakkuk", slug: "habakkuk", chapters: 3, category: "minor-prophets" },
    { name: "Zephaniah", slug: "zephaniah", chapters: 3, category: "minor-prophets" },
    { name: "Haggai", slug: "haggai", chapters: 2, category: "minor-prophets" },
    { name: "Zechariah", slug: "zechariah", chapters: 14, category: "minor-prophets" },
    { name: "Malachi", slug: "malachi", chapters: 4, category: "minor-prophets" },
    // ─── Gospels ───
    { name: "Matthew", slug: "matthew", chapters: 28, category: "gospels" },
    { name: "Mark", slug: "mark", chapters: 16, category: "gospels" },
    { name: "Luke", slug: "luke", chapters: 24, category: "gospels" },
    { name: "John", slug: "john", chapters: 21, category: "gospels" },
    // ─── NT History ───
    { name: "Acts", slug: "acts", chapters: 28, category: "nt-history" },
    // ─── Pauline Epistles ───
    { name: "Romans", slug: "romans", chapters: 16, category: "pauline" },
    { name: "1 Corinthians", slug: "1-corinthians", chapters: 16, category: "pauline" },
    { name: "2 Corinthians", slug: "2-corinthians", chapters: 13, category: "pauline" },
    { name: "Galatians", slug: "galatians", chapters: 6, category: "pauline" },
    { name: "Ephesians", slug: "ephesians", chapters: 6, category: "pauline" },
    { name: "Philippians", slug: "philippians", chapters: 4, category: "pauline" },
    { name: "Colossians", slug: "colossians", chapters: 4, category: "pauline" },
    { name: "1 Thessalonians", slug: "1-thessalonians", chapters: 5, category: "pauline" },
    { name: "2 Thessalonians", slug: "2-thessalonians", chapters: 3, category: "pauline" },
    { name: "1 Timothy", slug: "1-timothy", chapters: 6, category: "pauline" },
    { name: "2 Timothy", slug: "2-timothy", chapters: 4, category: "pauline" },
    { name: "Titus", slug: "titus", chapters: 3, category: "pauline" },
    { name: "Philemon", slug: "philemon", chapters: 1, category: "pauline" },
    // ─── General Epistles ───
    { name: "Hebrews", slug: "hebrews", chapters: 13, category: "general" },
    { name: "James", slug: "james", chapters: 5, category: "general" },
    { name: "1 Peter", slug: "1-peter", chapters: 5, category: "general" },
    { name: "2 Peter", slug: "2-peter", chapters: 3, category: "general" },
    { name: "1 John", slug: "1-john", chapters: 5, category: "general" },
    { name: "2 John", slug: "2-john", chapters: 1, category: "general" },
    { name: "3 John", slug: "3-john", chapters: 1, category: "general" },
    { name: "Jude", slug: "jude", chapters: 1, category: "general" },
    // ─── Prophecy ───
    { name: "Revelation", slug: "revelation", chapters: 22, category: "prophecy" },
];

export const TOTAL_CHAPTERS = 1189;

/** Get all books in a category */
export const getCategoryBooks = (categoryId: string): BookMeta[] =>
    AT_BIBLE_BOOKS.filter(b => b.category === categoryId);
