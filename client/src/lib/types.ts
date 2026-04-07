export interface Book {
    id: number;
    name: string;
    slug: string;
    testament: "OT" | "NT";
    bookOrder: number;
    chapterCount: number;
}

export interface Verse {
    id: number;
    book_id: number;
    book_name: string;
    book_slug: string;
    chapter: number;
    verse: number;
    text_primary: string; // Coalesced (WEB or KJV)
    text_web: string | null;
    text_kjv: string | null;
    text_hebrew: string | null;
    text_greek: string | null;
    text_korean: string | null;
    text_chinese: string | null;
    text_spanish: string | null;
    text_arabic: string | null;
    text_portuguese: string | null;
    strongs_numbers: string | null;

    interlinear_data: string | null;
}
