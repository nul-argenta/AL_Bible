import {
    getCrossReferences,
    getVersesByStrongs,
    getVerseById
} from "../bible/reader";

interface ContextualResult {
    source: any;
    crossReferences: any[]; // Depth 1
    sharedConcepts: any[];  // Verses sharing Key Strong's numbers
}

/**
 * findContextualLinks
 * 
 * Explores the connections around a specific verse to find thematic clusters.
 * 1. Direct Cross-References (The "Network")
 * 2. Shared Strong's Numbers (The "Concept Chain")
 */
export async function findContextualLinks(verseId: number): Promise<ContextualResult> {

    // 1. Get Source Verse
    const source = await getVerseById(verseId) as any;
    if (!source) {
        throw new Error(`Verse ${verseId} not found`);
    }

    // 2. Get Direct Cross-References
    const refs = await getCrossReferences(verseId) as any[];

    // 3. Find Shared Concepts via Strong's
    // Extract Strong's numbers (format: "H1234, H5678")
    let sharedConcepts: any[] = [];
    if (source.strongs_numbers) {
        const strongs = source.strongs_numbers.split(",").map((s: string) => s.trim()).filter((s: string) => s);

        // Pick the first 2-3 significant words (skip common particles if possible, but we don't have a stoplist yet)
        // For now, just take the first few distinct numbers.
        const distinctStrongs = Array.from(new Set(strongs)).slice(0, 3);

        for (const num of distinctStrongs) {
            const matches = await getVersesByStrongs(num as string) as any[];
            // Filter out the source verse itself
            const others = matches.filter(m => m.id !== verseId).slice(0, 5);
            sharedConcepts = [...sharedConcepts, ...others.map(m => ({ ...m, basis: num }))];
        }
    }

    return {
        source: {
            ref: `${source.book_name} ${source.chapter}:${source.verse}`,
            text: source.text_primary
        },
        crossReferences: refs.map(r => ({
            ref: `${r.to_book_name} ${r.to_chapter}:${r.to_verse}`,
            text: r.to_text,
            votes: r.votes
        })),
        sharedConcepts: sharedConcepts.map(s => ({
            ref: `${s.book_name} ${s.chapter}:${s.verse}`,
            text: s.text_primary,
            shared_strongs: s.basis
        }))
    };
}
