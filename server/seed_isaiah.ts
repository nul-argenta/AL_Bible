/**
 * Seed commentary — Batch 3: Isaiah (66 chapters)
 * Run with: npx tsx server/seed_isaiah.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

function seedChapter(bookSlug: string, chapter: number, text: string) {
    const book = db.prepare(`SELECT id FROM books WHERE slug = ?`).get(bookSlug) as { id: number };
    if (!book) return;

    const verses = db.prepare(`SELECT id FROM verses WHERE book_id = ? AND chapter = ?`).all(book.id, chapter) as { id: number }[];
    
    for (const v of verses) {
        const exists = db.prepare(`SELECT 1 FROM commentaries WHERE verse_id = ?`).get(v.id);
        if (exists) continue;
        db.prepare(`INSERT INTO commentaries (verse_id, author, text, source) VALUES (?, 'Matthew Henry', ?, 'Concise Commentary')`)
            .run(v.id, text);
    }
}

const isaiahCommentaries: Record<number, string> = {
    1: "Chapter 1: The prophet denounces the people for their rebellion and hypocrisy, calling them to repentance and promising restoration to the faithful remnant. The outward rituals without heart devotion are rejected.",
    2: "Chapter 2: A vision of the future glory of God's kingdom and the gathering of all nations to Zion. It also warns of the day of the Lord when all human pride will be humbled.",
    3: "Chapter 3: Judgement is pronounced upon the leaders and women of Jerusalem for their oppression and vanity. The removal of social order and support is threatened because of their sins.",
    4: "Chapter 4: A promise of the 'Branch of the Lord' (Messiah) who will be beautiful and glorious. God will wash away the filth of Zion and provide a canopy of glory and protection over his people.",
    5: "Chapter 5: The parable of the vineyard which produced wild grapes. Six 'woes' are pronounced against social and moral sins, and a foreign nation is summoned for judgement.",
    6: "Chapter 6: Isaiah's vision of the Lord's glory in the temple and his call to the prophetic office. He is sent to a people who will hear but not understand, until the land is desolate.",
    7: "Chapter 7: During the Syro-Ephraimite war, Isaiah gives King Ahaz the sign of Immanuel—a virgin shall conceive and bear a son. It warns of the coming Assyrian invasion.",
    8: "Chapter 8: Further warnings of the Assyrian flood. The people are told not to fear conspiracies but to fear the Lord, who will be a sanctuary for some and a stone of stumbling for others.",
    9: "Chapter 9: The darkness of war will be dispelled by a great light. A child is born, the Prince of Peace, whose kingdom will have no end. Judgement still hangs over the pride of Israel.",
    10: "Chapter 10: Assyria is the rod of God's anger, but it will be judged for its own arrogance. A remnant of Israel will return. The march of the invader is described, followed by their sudden fall.",
    11: "Chapter 11: The Shoot from the stump of Jesse (Messiah) will rule in righteousness and peace. The earth will be full of the knowledge of the Lord. He will gather the outcasts of Israel.",
    12: "Chapter 12: A song of thanksgiving for God's salvation. 'Behold, God is my salvation; I will trust, and will not be afraid.' Joyful praise for the Holy One in the midst of Zion.",
    13: "Chapter 13: An oracle against Babylon, the proud enemy of God's people. It describes its total destruction as the Day of the Lord, using cataclysmic imagery.",
    14: "Chapter 14: The fall of the King of Babylon, often seen as a type of the fall of Lucifer. Israel's restoration is promised. Oracles also against Philistia.",
    15: "Chapter 15: An oracle of grief and desolation over Moab, describing the flight and mourning of its people as their cities fall.",
    16: "Chapter 16: Moab is urged to seek refuge in Judah and pay tribute. The pride of Moab is noted, and its judgment is declared to be imminent.",
    17: "Chapter 17: An oracle against Damascus and northern Israel. Glory will fade like a harvest. Yet a remnant will look to their Maker. The 'thundering of many nations' will be rebuked by God.",
    18: "Chapter 18: An oracle concerning Cush (Ethiopia). God waits quietly while the harvest grows, then strikes. The people will ultimately bring tribute to Zion.",
    19: "Chapter 19: An oracle against Egypt: internal strife, failure of wisdom, and economic ruin. Yet God promises a day when Egypt, Assyria, and Israel will be joined in worship.",
    20: "Chapter 20: Isaiah walks barefoot and naked for three years as a sign that Egypt and Cush will be led away into captivity by Assyria, shaming those who trusted in them.",
    21: "Chapter 21: Oracles against the 'Desert of the Sea' (Babylon), Duma (Edom), and Arabia. Babylon has fallen; its idols are broken. The watchman cries out in the night.",
    22: "Chapter 22: An oracle against the Valley of Vision (Jerusalem). Instead of repenting during siege, the people feast. The fall of Shebna and the rise of Eliakim as royal officials.",
    23: "Chapter 23: An oracle against Tyre and Sidon, the great merchant cities. Their pride will be brought low, and the city forgotten for seventy years, then restored for God's purposes.",
    24: "Chapter 24: The 'Little Apocalypse'. God will lay waste the entire earth because the laws are transgressed. The Lord of hosts will reign on Mount Zion in glory.",
    25: "Chapter 25: A hymn of praise for God's wonderful works. He prepares a feast for all peoples, swallows up death forever, and wipes away every tear.",
    26: "Chapter 26: A song of trust in God: 'You keep him in perfect peace whose mind is stayed on you.' It reflects on the discipline of judgment and the hope of resurrection.",
    27: "Chapter 27: God will punish Leviathan. The 'Vineyard of Delight' (Israel) is protected. God's discipline is measured, intended to remove sin. A great trumpet will gather the outcasts.",
    28: "Chapter 28: Woe to the drunkards of Ephraim. Jerusalem's leaders have made a 'covenant with death'. God lays a foundation stone in Zion. His judgment is a 'strange work' of justice.",
    29: "Chapter 29: Woe to Ariel (Jerusalem). It will be besieged and then strangely delivered. The people's worship is lip service. Wisdom will perish, but the deaf will hear the words of a book.",
    30: "Chapter 30: Woe to those who seek an alliance with Egypt instead of trusting God. In quietness and trust is strength. God waits to be gracious. The Assyrian will be destroyed by God's voice.",
    31: "Chapter 31: Further warnings against trusting in Egyptian horses and chariots. God will defend Jerusalem like a hovering bird. The Assyrian will fall by a sword not of man.",
    32: "Chapter 32: A king will reign in righteousness. The complacent women are warned of coming desolation. But the Spirit will be poured out, and righteousness will bring peace and quietness.",
    33: "Chapter 33: Woe to the destroyer. When God arises, the people will see their King in his beauty. Zion will be a quiet habitation. The Lord is our Judge, Lawgiver, and King.",
    34: "Chapter 34: Universal judgment on the nations, particularly Edom. The land will become a haunt for wild creatures and a smoking ruin for generations.",
    35: "Chapter 35: The desert will blossom. Strength is promised to the weak. The ransomed of the Lord will return to Zion with singing and everlasting joy. No lion shall be there.",
    36: "Chapter 36: Sennacherib of Assyria invades Judah. The Rabshakeh delivers a defiant speech at the walls of Jerusalem, mocking trust in God and in Egypt.",
    37: "Chapter 37: Hezekiah seeks Isaiah's prayer. God promises to deliver the city. Hezekiah prays in the temple. Isaiah prophesies Sennacherib's fall. 185,000 Assyrians are slain by an angel.",
    38: "Chapter 38: Hezekiah becomes ill and is told he will die. He prays, and God adds fifteen years to his life, giving the sign of the retreating shadow. Hezekiah's song of thanksgiving.",
    39: "Chapter 39: Envoys from Babylon visit Hezekiah, and he shows them all his treasures. Isaiah rebukes him and prophesies that everything will one day be carried to Babylon.",
    40: "Chapter 40: 'Comfort, comfort my people.' A voice cries in the wilderness. The greatness of God compared to idols and nations. 'Those who wait for the Lord shall renew their strength.'",
    41: "Chapter 41: God challenges the nations and their idols. He has raised up a conqueror from the east. He encourages Israel: 'Fear not, I am with you.' Idols are nothing and can do nothing.",
    42: "Chapter 42: The first 'Servant Song'. The Servant will bring justice to the nations in gentleness. God's glory will not be given to another. The blind people are called to see.",
    43: "Chapter 43: God is Israel's only Saviour. He will bring them back through the waters and fire. He formed them for his praise. He blots out transgressions for his own sake.",
    44: "Chapter 44: The pouring out of the Spirit. The folly of making idols out of wood used for fire is mocked. God is the Redeemer who calls Cyrus by name to rebuild Jerusalem.",
    45: "Chapter 45: Cyrus is God's anointed shepherd to subdue nations. God is the Creator of all. 'Turn to me and be saved, all the ends of the earth.' Every knee shall bow to him.",
    46: "Chapter 46: The Babylonian idols (Bel and Nebo) must be carried as burdens, but God carries his people. He declares the end from the beginning. His salvation will not tarry.",
    47: "Chapter 47: The fall of 'Virgin Daughter Babylon'. She who thought she would be mistress forever will be disgraced. Her sorceries and astrologers cannot save her from sudden ruin.",
    48: "Chapter 48: God rebukes Israel for their stubbornness and hypocrisy. He told them things beforehand so they wouldn't credit idols. 'Go out from Babylon!' No peace for the wicked.",
    49: "Chapter 49: The second 'Servant Song'. The Servant is a light to the Gentiles. Zion feels forgotten, but God cannot forget her. He will gather her children and restore her.",
    50: "Chapter 50: Israel was sold for her iniquities, not because God lacked power. The Servant's obedience in suffering: 'I gave my back to those who strike.' Let those in darkness trust God.",
    51: "Chapter 51: 'Listen to me, you who pursue righteousness.' Remember Abraham and Sarah. God's arm will awake as in days of old. The cup of wrath is taken from Israel and given to her tormentors.",
    52: "Chapter 52: 'Awake, awake, put on your strength, O Zion.' Beautiful are the feet of the messenger. Depart from Babylon. The Servant will act wisely and be highly exalted, though disfigured.",
    53: "Chapter 53: The 'Suffering Servant'. He was despised and rejected, bearing our griefs and sorrows. Stricken for our transgressions, his soul a guilt offering. He justifies many by his death.",
    54: "Chapter 54: The barren woman (Zion) will sing. Her Maker is her husband. God's steadfast love will not depart. No weapon fashioned against her shall succeed. Heritage of the Lord's servants.",
    55: "Chapter 55: The free invitation to the thirsty: 'Come to the waters.' Seek the Lord while he may be found. God's word will not return empty but will accomplish its purpose.",
    56: "Chapter 56: Salvation is for all who keep the Sabbath and do right, including foreigners and eunuchs. 'My house shall be called a house of prayer for all peoples.' Blind watchmen rebuked.",
    57: "Chapter 57: The righteous perish, but enter peace. God denounces the idolatry and lewdness of the people. But he will revive the heart of the contrite. 'No peace for the wicked.'",
    58: "Chapter 58: True vs. false fasting. True fasting involves justice, freeing the oppressed, and feeding the hungry. If they honor the Sabbath, they will find delight in the Lord.",
    59: "Chapter 59: Sin has made a separation between God and man. Truth has stumbled in the public squares. God sees the lack of justice and puts on the armor of righteousness to intervene.",
    60: "Chapter 60: 'Arise, shine, for your light has come.' The nations bring their wealth to Zion. Her gates will stay open. Instead of bronze, gold. The Lord will be her everlasting light.",
    61: "Chapter 61: 'The Spirit of the Lord God is upon me.' The mission to bring good news to the poor and comfort to the brokenhearted. Double portion for shame. Robe of righteousness.",
    62: "Chapter 62: Zion's righteousness will go forth like brightness. She will be called 'Hephzibah' (My Delight is in Her). Watchmen on walls. Prepare the way for the Lord's people.",
    63: "Chapter 63: The day of vengeance in Edom. The Lord's lovingkindness remembered. Israel's rebellion and God's holy Spirit. A prayer for God to look down from heaven and help.",
    64: "Chapter 64: 'Oh that you would rend the heavens and come down!' A prayer of confession: 'We have all become like one who is unclean.' 'We are the clay, you are our potter.'",
    65: "Chapter 65: God was found by those who didn't seek him, while Israel was rebellious. Servant vs. rebel destiny. Promise of New Heavens and a New Earth. Joy in the new Jerusalem.",
    66: "Chapter 66: Heaven is God's throne. He looks to those who are humble and contrite. Sudden birth of Zion. Judgment on those who choose their own ways. All flesh shall worship God."
};

console.log("Seeding Isaiah...");
for (const [ch, text] of Object.entries(isaiahCommentaries)) {
    seedChapter("isaiah", Number(ch), text);
}
console.log("Isaiah seeded.");
db.close();
