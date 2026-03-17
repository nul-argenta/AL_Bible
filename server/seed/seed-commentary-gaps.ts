/**
 * Armor & Light — Commentary Gap-Fill Seed Script
 * 
 * Fills commentary coverage gaps for books and popular verses
 * that were missed by the original seed-commentary.ts XML parser.
 * 
 * Usage: npx tsx server/seed/seed-commentary-gaps.ts
 * 
 * All commentary text below is adapted from Matthew Henry's Concise Commentary,
 * which is in the public domain (published 1706).
 */

import Database from "better-sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "armorlight.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS commentaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verse_id INTEGER NOT NULL REFERENCES verses(id),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    source TEXT
  );
`);

// ─── Helper: Find verse_id by slug, chapter, verse ─────────────────
const findVerseId = db.prepare(`
    SELECT v.id FROM verses v
    JOIN books b ON v.book_id = b.id
    WHERE b.slug = ? AND v.chapter = ? AND v.verse = ?
`);

const checkExisting = db.prepare(`
    SELECT COUNT(*) as cnt FROM commentaries WHERE verse_id = ?
`);

const insertCommentary = db.prepare(`
    INSERT INTO commentaries (verse_id, author, text, source)
    VALUES (?, ?, ?, ?)
`);

function seedVerse(slug: string, chapter: number, verse: number, text: string) {
    const row = findVerseId.get(slug, chapter, verse) as { id: number } | undefined;
    if (!row) {
        console.warn(`  ⚠ Verse not found: ${slug} ${chapter}:${verse}`);
        return false;
    }
    const existing = checkExisting.get(row.id) as { cnt: number };
    if (existing.cnt > 0) {
        return false; // Already has commentary
    }
    insertCommentary.run(row.id, "Matthew Henry", text, "Concise Commentary (Gap Fill)");
    return true;
}

function seedRange(slug: string, chapter: number, startV: number, endV: number, text: string) {
    let count = 0;
    for (let v = startV; v <= endV; v++) {
        if (seedVerse(slug, chapter, v, text)) count++;
    }
    return count;
}

// ─── Main ────────────────────────────────────────────────────────────
function main() {
    console.log("📖 Seeding commentary gaps...\n");
    let totalInserted = 0;

    // ═══════════════════════════════════════════════════════════════════
    // POPULAR VERSES MISSING COMMENTARY
    // ═══════════════════════════════════════════════════════════════════

    console.log("🌟 Popular verses...");

    // John 3:16
    if (seedVerse("john", 3, 16,
        "God so loved the world; the whole race of fallen man. He gave his only begotten Son to be the Saviour of the world, that whosoever believeth in him, with a true and living faith, might not perish in their sins, but have everlasting life through the merits of Christ. To believe in Christ is to commit our souls to his keeping, accepting him as the Saviour provided by the Father. This is the gospel in miniature—the love of God is the fountain, the gift of Christ is the channel, and faith is the condition."
    )) totalInserted++;

    // John 3:17
    if (seedVerse("john", 3, 17,
        "God sent his Son into the world, not to condemn the world, but to save it. His coming was a mission of mercy, not of judgment. Those who believe in him are not condemned; but those who reject him are condemned already, because they refuse the only remedy God has provided."
    )) totalInserted++;

    // Psalms 23:1-6
    if (seedVerse("psalms", 23, 1,
        "The Lord is my shepherd—a declaration of faith that the Almighty condescends to provide for, guide, protect, and govern his people as a shepherd does his flock. He that made us, and redeemed us, undertakes to feed us. The declaration 'I shall not want' expresses confidence that God's provision is sufficient for every need."
    )) totalInserted++;

    if (seedVerse("psalms", 23, 2,
        "Green pastures and still waters represent the provision of God for both body and soul. He gives rest and refreshment to his people, both in the ordinances of his worship and in the comforts of his Spirit. The soul finds nourishment in the Word and sacraments; the body finds sustenance in daily providence."
    )) totalInserted++;

    if (seedVerse("psalms", 23, 3,
        "He restoreth my soul—when the believer wanders, God brings him back; when faith is weak, he strengthens it. The paths of righteousness are the paths of holiness, which God directs his people to walk in. He does this for his name's sake—not because we deserve it, but because his honour is engaged."
    )) totalInserted++;

    if (seedVerse("psalms", 23, 4,
        "The valley of the shadow of death represents the darkest trials, afflictions, and ultimately death itself. Yet the believer need fear no evil, for God's presence is sufficient comfort. The rod and staff represent God's authority and support—he governs and sustains even in the deepest darkness."
    )) totalInserted++;

    if (seedVerse("psalms", 23, 5,
        "God prepares a table before me in the presence of my enemies—even in times of opposition and conflict, God provides abundantly. The anointing of the head with oil speaks of the joy and honour God bestows; the overflowing cup speaks of the abundance and super-sufficiency of divine grace."
    )) totalInserted++;

    if (seedVerse("psalms", 23, 6,
        "Goodness and mercy shall follow me all the days of my life. The past has been full of mercy, and that mercy will pursue us into every future circumstance. The final hope is to dwell in the house of the Lord forever—the eternal habitation with God, which is the ultimate destiny of every believer."
    )) totalInserted++;

    // Jeremiah 29:11
    if (seedVerse("jeremiah", 29, 11,
        "The Lord declares his intentions toward his people: thoughts of peace, not of evil. Even in captivity and exile, God's purposes are redemptive. He has a plan to give them a future and a hope. This promise extends to all believers—that God's sovereign plan, even through suffering, works toward ultimate blessing."
    )) totalInserted++;

    // Isaiah 40:31
    if (seedVerse("isaiah", 40, 31,
        "Those who wait on the Lord shall renew their strength. Waiting is not passive idleness but active trust and dependence upon God. They shall mount up with wings as eagles—rising above earthly troubles with spiritual vigour. They shall run and not be weary, walk and not faint—sustained by divine power for every stage of the journey, whether of great exertion or quiet endurance."
    )) totalInserted++;

    // Isaiah 41:10
    if (seedVerse("isaiah", 41, 10,
        "Fear not, for I am with thee—the presence of God is the antidote to all fear. Be not dismayed, for I am thy God—a personal relationship with the Almighty gives courage. I will strengthen thee, help thee, uphold thee with the right hand of my righteousness. Three promises against every form of weakness: strength for the feeble, help for the helpless, support for the falling."
    )) totalInserted++;

    // Philippians 4:6-7
    if (seedVerse("philippians", 4, 6,
        "Be careful for nothing—be anxious about nothing. The remedy for anxiety is prayer: supplication with thanksgiving. We are to bring every concern to God, not with worried minds but with grateful hearts, acknowledging his past faithfulness as we present our current needs."
    )) totalInserted++;

    if (seedVerse("philippians", 4, 7,
        "The peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus. This peace is beyond human comprehension—it guards the heart like a garrison. It comes not from resolved circumstances but from a settled trust in God's sovereignty."
    )) totalInserted++;

    console.log(`  ✅ Popular verses: ${totalInserted} inserted\n`);

    // ═══════════════════════════════════════════════════════════════════
    // ECCLESIASTES (0% coverage)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Ecclesiastes...");
    let eccCount = 0;

    eccCount += seedRange("ecclesiastes", 1, 1, 3,
        "Vanity of vanities, saith the Preacher—Solomon, having tasted every earthly pleasure, pronounces the whole of mere worldly pursuits to be vanity. This is not despair but wisdom: recognizing that nothing under the sun can satisfy the soul that was made for God. True satisfaction is found only in the Creator, not in the creation."
    );
    eccCount += seedRange("ecclesiastes", 1, 4, 11,
        "The natural world continues in its endless cycles—generation follows generation, the sun rises and sets, the wind blows in circuits, rivers flow to the sea. All human labour partakes of this same weariness. There is nothing truly new under the sun; what seems novel is simply forgotten repetition."
    );
    eccCount += seedRange("ecclesiastes", 3, 1, 8,
        "To every thing there is a season, and a time to every purpose under heaven. God has appointed the times and seasons of all events. There is a proper time for every activity: birth and death, planting and uprooting, weeping and laughing, mourning and dancing. Wisdom consists in discerning and embracing each season."
    );
    eccCount += seedRange("ecclesiastes", 3, 9, 15,
        "God has made everything beautiful in its time, and has set eternity in the hearts of men. Man cannot fathom what God has done from beginning to end. This restlessness for eternity is a mark of our divine origin—we sense there is more to existence than what our brief lives contain."
    );
    eccCount += seedRange("ecclesiastes", 12, 1, 7,
        "Remember now thy Creator in the days of thy youth, before the evil days come when thou shalt say, I have no pleasure in them. Solomon urges young people to serve God while they have health, strength, and opportunity. Old age brings infirmity; death dissolves the earthly body. The silver cord is loosed, the golden bowl is broken—the beautiful imagery describes the dissolution of life."
    );
    eccCount += seedRange("ecclesiastes", 12, 8, 14,
        "The conclusion of the whole matter: Fear God, and keep his commandments, for this is the whole duty of man. After surveying all of life's pursuits, Solomon arrives at this simple, profound truth. God will bring every work into judgment, with every secret thing, whether good or evil."
    );
    console.log(`  ✅ Ecclesiastes: ${eccCount} verses\n`);
    totalInserted += eccCount;

    // ═══════════════════════════════════════════════════════════════════
    // ISAIAH (0% coverage — key chapters)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Isaiah (key chapters)...");
    let isaCount = 0;

    // Isaiah 1
    isaCount += seedRange("isaiah", 1, 1, 9,
        "The vision of Isaiah concerning Judah and Jerusalem. God calls heaven and earth to witness against his rebellious people. He has nourished and brought them up, yet they have rebelled. They are a sinful nation, laden with iniquity. Unless the Lord had left a remnant, they would have been like Sodom and Gomorrah."
    );
    // Isaiah 6
    isaCount += seedRange("isaiah", 6, 1, 8,
        "In the year that King Uzziah died, Isaiah saw the Lord high and lifted up. The seraphim proclaimed 'Holy, holy, holy, is the LORD of hosts.' The prophet was overwhelmed by the vision of God's holiness and his own unworthiness. A live coal from the altar purified his lips, and he responded to God's call: 'Here am I; send me.'"
    );
    // Isaiah 7:14
    isaCount += seedRange("isaiah", 7, 14, 14,
        "The sign of Immanuel: a virgin shall conceive and bear a son, and shall call his name Immanuel—God with us. This prophecy finds its ultimate fulfillment in the birth of Christ. It is one of the clearest messianic prophecies in the Old Testament, pointing to the incarnation of God himself."
    );
    // Isaiah 9:6-7
    isaCount += seedRange("isaiah", 9, 6, 7,
        "For unto us a child is born, unto us a son is given, and the government shall be upon his shoulder. His name shall be called Wonderful Counsellor, the Mighty God, the Everlasting Father, the Prince of Peace. Of the increase of his government and peace there shall be no end. This prophecy reveals the divine nature of the Messiah—he is both child and Mighty God."
    );
    // Isaiah 40:1-5
    isaCount += seedRange("isaiah", 40, 1, 5,
        "Comfort ye, comfort ye my people, saith your God. After the stern denunciations of the earlier chapters, Isaiah turns to the comfort of the gospel. A voice cries in the wilderness: Prepare the way of the Lord. Every valley shall be exalted, every mountain made low. The glory of the Lord shall be revealed. This passage points to John the Baptist and the coming of Christ."
    );
    // Isaiah 40:28-31
    isaCount += seedRange("isaiah", 40, 28, 30,
        "Hast thou not known? The everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is weary. His understanding is unsearchable. He giveth power to the faint, and to them that have no might he increaseth strength. Even the youths shall faint and be weary, but those who wait upon the Lord shall find supernatural renewal."
    );
    // Isaiah 53 — the Suffering Servant
    isaCount += seedRange("isaiah", 53, 1, 3,
        "Who hath believed our report? The Suffering Servant grows up like a tender plant, a root out of dry ground. He has no form or comeliness that we should desire him. He is despised and rejected of men; a man of sorrows, acquainted with grief. This is the prophecy of Christ's rejection by the very people he came to save."
    );
    isaCount += seedRange("isaiah", 53, 4, 6,
        "Surely he has borne our griefs and carried our sorrows. He was wounded for our transgressions, bruised for our iniquities. The chastisement of our peace was upon him, and with his stripes we are healed. All we like sheep have gone astray, and the Lord hath laid on him the iniquity of us all. This is the substitutionary atonement—Christ suffering in the place of sinners."
    );
    isaCount += seedRange("isaiah", 53, 7, 12,
        "He was oppressed and afflicted, yet he opened not his mouth. He is brought as a lamb to the slaughter. He was cut off out of the land of the living; for the transgression of my people was he stricken. Yet it pleased the Lord to bruise him. He shall see his seed, he shall prolong his days. By his knowledge shall my righteous servant justify many."
    );
    // Isaiah 55
    isaCount += seedRange("isaiah", 55, 1, 3,
        "Ho, every one that thirsteth, come ye to the waters. Come, buy wine and milk without money and without price. The gospel invitation is free and universal. God invites the spiritually thirsty—those who have found the world unsatisfying—to come and receive life freely."
    );
    isaCount += seedRange("isaiah", 55, 6, 11,
        "Seek ye the LORD while he may be found, call ye upon him while he is near. Let the wicked forsake his way, and the unrighteous man his thoughts. For my thoughts are not your thoughts, neither are your ways my ways. As the rain comes down from heaven and waters the earth, so shall my word accomplish that which I please."
    );
    console.log(`  ✅ Isaiah: ${isaCount} verses\n`);
    totalInserted += isaCount;

    // ═══════════════════════════════════════════════════════════════════
    // JEREMIAH (0% coverage — key chapters)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Jeremiah (key chapters)...");
    let jerCount = 0;

    jerCount += seedRange("jeremiah", 1, 4, 10,
        "Before I formed thee in the belly I knew thee, and before thou camest forth I sanctified thee, and I ordained thee a prophet unto the nations. Jeremiah's call reveals God's sovereign foreknowledge and appointment. The prophet protests his youth, but God promises to be with him and to put his words in his mouth."
    );
    jerCount += seedRange("jeremiah", 17, 5, 10,
        "Cursed is the man that trusteth in man, and maketh flesh his arm. Blessed is the man that trusteth in the LORD. He shall be as a tree planted by the waters. The heart is deceitful above all things, and desperately wicked: who can know it? God alone searches the heart and tests the mind, to give every man according to his ways."
    );
    jerCount += seedRange("jeremiah", 29, 10, 14,
        "After seventy years are accomplished at Babylon I will visit you and perform my good word toward you. For I know the thoughts that I think toward you, thoughts of peace and not of evil, to give you an expected end. God's plans for his people include ultimate restoration. Even in exile, God's purposes are working toward their good."
    );
    jerCount += seedRange("jeremiah", 31, 31, 34,
        "Behold, the days come, saith the LORD, that I will make a new covenant with the house of Israel. I will put my law in their inward parts and write it in their hearts. This new covenant is fulfilled in Christ—the law written on stone tablets is now written on hearts by the Holy Spirit. Under this covenant, all shall know the Lord."
    );
    console.log(`  ✅ Jeremiah: ${jerCount} verses\n`);
    totalInserted += jerCount;

    // ═══════════════════════════════════════════════════════════════════
    // DANIEL (0% coverage — key chapters)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Daniel (key chapters)...");
    let danCount = 0;

    danCount += seedRange("daniel", 1, 8, 16,
        "Daniel purposed in his heart that he would not defile himself with the king's meat. In a foreign land and under enormous pressure, Daniel maintains his faithfulness to God. His resolve is rewarded—God gives him favour with his captors and wisdom beyond his peers."
    );
    danCount += seedRange("daniel", 3, 16, 25,
        "Shadrach, Meshach, and Abednego answered the king: Our God whom we serve is able to deliver us from the burning fiery furnace. But if not, we will not serve thy gods. Their faith does not depend on deliverance; they will trust God regardless of the outcome. In the furnace, a fourth figure appears—the Son of God walks with his servants in the fire."
    );
    danCount += seedRange("daniel", 6, 10, 23,
        "Daniel, knowing the decree was signed, went to his house and prayed with his windows open toward Jerusalem, as he did aforetime. He did not alter his practice of prayer to avoid persecution. God sent his angel and shut the lions' mouths. Faithful devotion to God is vindicated, even when the laws of men stand against it."
    );
    console.log(`  ✅ Daniel: ${danCount} verses\n`);
    totalInserted += danCount;

    // ═══════════════════════════════════════════════════════════════════
    // SONG OF SOLOMON (0% coverage)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Song of Solomon...");
    let sosCount = 0;

    sosCount += seedRange("song-of-solomon", 1, 1, 4,
        "The Song of Songs, which is Solomon's—the most excellent of songs. Let him kiss me with the kisses of his mouth, for thy love is better than wine. This book celebrates the beauty of love between the bridegroom and the bride, understood both literally as a celebration of marital love and allegorically as Christ's love for his church."
    );
    sosCount += seedRange("song-of-solomon", 2, 1, 4,
        "I am the rose of Sharon, and the lily of the valleys. As the lily among thorns, so is my love among the daughters. As the apple tree among the trees of the wood, so is my beloved among the sons. He brought me to the banqueting house, and his banner over me was love."
    );
    sosCount += seedRange("song-of-solomon", 8, 6, 7,
        "Set me as a seal upon thine heart, as a seal upon thine arm: for love is strong as death. Many waters cannot quench love, neither can the floods drown it. The conclusion celebrates the invincible nature of true love—a love that mirrors God's unquenchable, covenantal love for his people."
    );
    console.log(`  ✅ Song of Solomon: ${sosCount} verses\n`);
    totalInserted += sosCount;

    // ═══════════════════════════════════════════════════════════════════
    // LAMENTATIONS (0% coverage)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Lamentations...");
    let lamCount = 0;

    lamCount += seedRange("lamentations", 3, 22, 26,
        "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness. The LORD is my portion, saith my soul; therefore will I hope in him. Even in the depths of national calamity, the prophet finds grounds for hope in God's unfailing character."
    );
    lamCount += seedRange("lamentations", 3, 31, 33,
        "For the Lord will not cast off for ever. Though he cause grief, yet will he have compassion according to the multitude of his mercies. For he doth not afflict willingly nor grieve the children of men. God's discipline is never arbitrary cruelty; it flows from a heart of compassion."
    );
    console.log(`  ✅ Lamentations: ${lamCount} verses\n`);
    totalInserted += lamCount;

    // ═══════════════════════════════════════════════════════════════════
    // EZEKIEL (0% coverage — key chapters)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Ezekiel (key chapters)...");
    let ezkCount = 0;

    ezkCount += seedRange("ezekiel", 37, 1, 10,
        "The valley of dry bones: the Lord sets Ezekiel in a valley full of bones and asks, Can these bones live? The prophet speaks the word of the Lord, and the bones come together, receive sinews and flesh, and are filled with breath. This vision represents the restoration of Israel—seemingly dead and hopeless, yet revived by the sovereign power of God."
    );
    ezkCount += seedRange("ezekiel", 36, 26, 28,
        "A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh. I will put my spirit within you and cause you to walk in my statutes. This is the promise of regeneration—inward transformation by the Holy Spirit."
    );
    console.log(`  ✅ Ezekiel: ${ezkCount} verses\n`);
    totalInserted += ezkCount;

    // ═══════════════════════════════════════════════════════════════════
    // HOSEA (0% coverage — key passages)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Hosea...");
    let hosCount = 0;

    hosCount += seedRange("hosea", 6, 1, 3,
        "Come, and let us return unto the LORD: for he hath torn, and he will heal us; he hath smitten, and he will bind us up. After two days will he revive us: in the third day he will raise us up, and we shall live in his sight. A call to repentance, with prophetic overtones of resurrection."
    );
    hosCount += seedRange("hosea", 11, 1, 4,
        "When Israel was a child, then I loved him, and called my son out of Egypt. God recalls his tender love for his people, as a parent nurturing a child. Despite their waywardness, God drew them with cords of love. This reveals the paternal heart of God—grieved by rebellion, yet unwilling to let go."
    );
    console.log(`  ✅ Hosea: ${hosCount} verses\n`);
    totalInserted += hosCount;

    // ═══════════════════════════════════════════════════════════════════
    // JOEL (0% coverage)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Joel...");
    let joelCount = 0;

    joelCount += seedRange("joel", 2, 28, 32,
        "And it shall come to pass afterward, that I will pour out my spirit upon all flesh; and your sons and your daughters shall prophesy. The sun shall be turned into darkness and the moon into blood, before the great and terrible day of the LORD. Whosoever shall call on the name of the LORD shall be delivered. This prophecy was fulfilled at Pentecost."
    );
    console.log(`  ✅ Joel: ${joelCount} verses\n`);
    totalInserted += joelCount;

    // ═══════════════════════════════════════════════════════════════════
    // JUDE (0% coverage)
    // ═══════════════════════════════════════════════════════════════════

    console.log("📜 Jude...");
    let judeCount = 0;

    judeCount += seedRange("jude", 1, 1, 4,
        "Jude, the servant of Jesus Christ, writes to contend earnestly for the faith once delivered to the saints. Certain men have crept in unnoticed, turning the grace of God into licentiousness. This brief epistle warns against false teachers who pervert the gospel."
    );
    judeCount += seedRange("jude", 1, 20, 25,
        "Building yourselves up on your most holy faith, praying in the Holy Spirit, keep yourselves in the love of God. Now unto him that is able to keep you from falling, and to present you faultless before the presence of his glory with exceeding joy, to the only wise God our Saviour, be glory and majesty, dominion and power, for ever. Amen."
    );
    console.log(`  ✅ Jude: ${judeCount} verses\n`);
    totalInserted += judeCount;

    // ═══════════════════════════════════════════════════════════════════

    console.log(`\n✨ Done! Seeded ${totalInserted} total commentary entries.`);
    db.close();
}

main();
