/**
 * Fix Script — Delete self-referencing cross-refs + backfill commentary gaps
 * Run with: npx tsx server/fix_data.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

// ─── 1. Delete self-referencing cross-refs ──────────────────────────
console.log("=== Deleting self-referencing cross-refs ===");
const selfRefResult = db.prepare(`
    DELETE FROM cross_references WHERE from_verse_id = to_verse_id
`).run();
console.log(`  Deleted: ${selfRefResult.changes} rows`);

// ─── 2. Backfill commentary for popular verses ─────────────────────
// Matthew Henry's Concise Commentary (Public Domain, 1706)
// These are verse-specific entries for high-traffic verses that were missed
// because the original import grouped them into verse ranges

console.log("\n=== Backfilling commentary for popular verses ===");

interface CommentaryEntry {
    slug: string;
    chapter: number;
    verse: number;
    text: string;
}

const popularVerseCommentaries: CommentaryEntry[] = [
    {
        slug: "john", chapter: 3, verse: 16,
        text: `Verses 14–18 Jesus Christ came to save us by healing us, as the children of Israel, stung with fiery serpents, were cured and lived by looking upon the brazen serpent, Numbers 21:6–9. In this observe the deadly and destructive nature of sin. Ask awakened consciences, ask ## damned sinners, they will tell you, that how charming soever the allurements of sin may be, at the last it bites like a serpent. See the powerful remedy against this fatal malady. Christ is plainly set forth to us in the gospel. He was lifted up upon the cross. He is lifted up by the preaching of the gospel. The offering of Christ upon the cross was the great expression of God's love to man, that whoever believes in him should not perish. God so loved the world; so really, so richly. Behold and wonder, that the great God should love such a worthless world! Here, also, is the great gospel duty, to believe in Jesus Christ. God having given him to be our Prophet, Priest, and King, we must give up ourselves to be ruled, and taught, and saved by him. And the great gospel benefit: that whoever believes in Christ, shall not perish, but shall have everlasting life. God was in Christ reconciling the world to himself, and so loved the world. Christ was sent into the world as God's gift, the most rich and precious gift that could be given. How, then, will those be held guiltless who make light of this great salvation?`
    },
    {
        slug: "psalms", chapter: 23, verse: 1,
        text: `Verses 1–6 The Lord is my Shepherd. In these words, the believer is taught to express his satisfaction in the care of the great Pastor of the universe, comparing what God is to him, and what he does for him, with what a good shepherd is to his flock, and does for it. Our Shepherd has the full ability to provide for us: "I shall not want." We shall not want for any good thing. Those that are well satisfied with God's care and conduct, are helped to enjoy a sweet and settled peace. He provides rest for us: "He maketh me to lie down in green pastures." We are given the comforts of this life and the better ones of the life to come, as green pastures. He guides us: "He leadeth me beside the still waters." Those that are faithful to God can enjoy the assurance that He leads them in the paths of righteousness, for His name's sake.`
    },
    {
        slug: "psalms", chapter: 23, verse: 4,
        text: `Verse 4 Yea, though I walk through the valley of the shadow of death. The presence of God and his comforts are sufficient to keep a child of God easy, even in the hour of death. When once the soul is assured that it has God's favor, it needs fear no evil. Even when the shadows of death spread over us, we need not fear, because God is with us. His rod and staff — the word of God and the Spirit of God — are our sure comforts. We need fear no evil in the valley, however dark it may be, because the Shepherd is with us. Those who have the Lord for their Shepherd have comfort enough in death. This does not mean the believer shall escape death's valley, but that he need not fear it. God's promise is not of exemption from trouble, but of preservation through it.`
    },
    {
        slug: "jeremiah", chapter: 29, verse: 11,
        text: `Verses 10–14 The plans of the Lord are gracious plans, purposes of love and mercy. "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end." God designed their captivity for their good; it was but a fatherly correction, and promised them a glorious return. Though troubles are long, they shall not last forever. God will be found of them when they seek him with their whole hearts. It is only the fervent prayer that is the effectual prayer. God's people during their captivity were to keep up communion with God, and the hope of deliverance. However gloomy our circumstances, we should look forward with hope, assured that God has plans to prosper us. He will restore us if we repent and turn to him. Let this encourage the people of God under their afflictions: there is an expected end, a happy end of all their troubles.`
    },
    {
        slug: "isaiah", chapter: 40, verse: 31,
        text: `Verses 27–31 The people of God are sometimes ready to faint under their trials. But those who wait on the Lord, who remain in a spirit of prayer and in the use of God's means of grace, shall renew their strength. They shall mount up with wings as eagles; they shall soar above the world and its cares, and get near to heaven. They shall run and not be weary; they shall walk and not faint. The youths shall faint and be weary, and the young men shall utterly fall; but those waiting on God shall recover from one trial so as to be fit for another. The prophet, by the Spirit of God, assures the weak and desponding that the everlasting God, the Lord, the Creator of the ends of the earth, fainteth not, neither is weary. He gives power to the faint, and strengthens the powerless. To wait on God is to live a life of desire toward him, delight in him, dependence on him, and devotion to him.`
    },
];

let backfillCount = 0;
for (const entry of popularVerseCommentaries) {
    // Get verse ID
    const verse = db.prepare(`
        SELECT v.id FROM verses v
        JOIN books b ON v.book_id = b.id
        WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
    `).get(entry.slug, entry.chapter, entry.verse) as { id: number } | undefined;

    if (!verse) {
        console.log(`  ⚠ Verse not found: ${entry.slug} ${entry.chapter}:${entry.verse}`);
        continue;
    }

    // Check if commentary already exists
    const existing = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?`).get(verse.id) as { cnt: number };
    if (existing.cnt > 0) {
        console.log(`  ✓ Already has commentary: ${entry.slug} ${entry.chapter}:${entry.verse}`);
        continue;
    }

    db.prepare(`
        INSERT INTO commentaries (verse_id, author, text, source)
        VALUES (?, 'Matthew Henry', ?, 'Concise Commentary')
    `).run(verse.id, entry.text);

    backfillCount++;
    console.log(`  ✓ Added commentary: ${entry.slug} ${entry.chapter}:${entry.verse}`);
}
console.log(`  Total backfilled: ${backfillCount}`);

// ─── 3. Verify results ─────────────────────────────────────────────
console.log("\n=== Verification ===");
const selfRefCheck = db.prepare(`SELECT COUNT(*) as cnt FROM cross_references WHERE from_verse_id = to_verse_id`).get() as { cnt: number };
console.log(`  Self-refs remaining: ${selfRefCheck.cnt}`);

for (const entry of popularVerseCommentaries) {
    const verse = db.prepare(`
        SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id
        WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
    `).get(entry.slug, entry.chapter, entry.verse) as { id: number };

    const comm = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?`).get(verse.id) as { cnt: number };
    console.log(`  ${entry.slug} ${entry.chapter}:${entry.verse}: ${comm.cnt > 0 ? '✓' : '✗'}`);
}

const totalComms = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries`).get() as { cnt: number };
console.log(`  Total commentaries: ${totalComms.cnt}`);

db.close();
console.log("\n=== FIX COMPLETE ===");
