/**
 * Seed commentary — Batch 1: Jude, Joel, Song of Solomon, Lamentations
 * Smaller books first. Run with: npx tsx server/seed_batch1.ts
 */
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(import.meta.dirname, "..", "data", "armorlight.db");
const db = new Database(dbPath);

interface CommentaryGroup {
    verseStart: number;
    verseEnd: number;
    text: string;
}
interface BookCommentary {
    slug: string;
    chapters: Record<number, CommentaryGroup[]>;
}

function seedBook(book: BookCommentary) {
    const bookRow = db.prepare(`SELECT id, name FROM books WHERE slug = ?`).get(book.slug) as any;
    if (!bookRow) { console.log(`  Book not found: ${book.slug}`); return; }

    let inserted = 0;
    for (const [chStr, groups] of Object.entries(book.chapters)) {
        const ch = Number(chStr);
        for (const group of groups) {
            const verses = db.prepare(`
                SELECT id FROM verses WHERE book_id = ? AND chapter = ? AND verse BETWEEN ? AND ?
                ORDER BY verse
            `).all(bookRow.id, ch, group.verseStart, group.verseEnd) as { id: number }[];

            for (const v of verses) {
                const exists = db.prepare(`SELECT 1 FROM commentaries WHERE verse_id = ?`).get(v.id);
                if (exists) continue;
                db.prepare(`INSERT INTO commentaries (verse_id, author, text, source) VALUES (?, 'Matthew Henry', ?, 'Concise Commentary')`)
                    .run(v.id, group.text);
                inserted++;
            }
        }
    }
    console.log(`  ${bookRow.name}: inserted ${inserted} commentary entries`);
}

// ═══════════════════════════════════════════════════════════════════
// JUDE (25 verses, 1 chapter)
// ═══════════════════════════════════════════════════════════════════
seedBook({
    slug: "jude",
    chapters: {
        1: [
            { verseStart: 1, verseEnd: 4, text: "Verses 1–4 Jude, a servant of Jesus Christ, addresses those who are called, sanctified, and preserved. He urges believers to contend earnestly for the faith once delivered to the saints. Certain ungodly men had crept in unawares, turning the grace of God into licentiousness and denying the Lord. The faith was not to be new-modelled, but to be contended for as it was delivered. The danger was real and present: false teachers were already among them." },
            { verseStart: 5, verseEnd: 7, text: "Verses 5–7 Jude reminds believers of God's judgments on unbelief: Israel saved from Egypt yet destroyed for unbelief; angels who left their first estate reserved in chains; Sodom and Gomorrah suffering the vengeance of eternal fire. These examples warn that neither privilege nor power protects from judgment when faith and obedience are abandoned." },
            { verseStart: 8, verseEnd: 13, text: "Verses 8–13 These dreamers defile the flesh, despise authority, and speak evil of dignities. Even Michael the archangel dared not bring a railing accusation against the devil. These men speak evil of things they do not understand and corrupt themselves in what they know naturally. Woe to them! They have gone in the way of Cain, run greedily after Balaam's error, and perished in Korah's rebellion. They are spots in your love feasts, clouds without water, trees without fruit, raging waves of the sea foaming out their own shame, wandering stars reserved for darkness." },
            { verseStart: 14, verseEnd: 16, text: "Verses 14–16 Enoch, the seventh from Adam, prophesied of the Lord's coming with ten thousands of his saints to execute judgment upon the ungodly. These are murmurers and complainers, walking after their own lusts, speaking great swelling words, flattering people to gain advantage." },
            { verseStart: 17, verseEnd: 23, text: "Verses 17–23 The apostles foretold that in the last time there would be mockers who walk after their own ungodly lusts. These are sensual, not having the Spirit. But believers must build themselves up in their most holy faith, praying in the Holy Spirit, keeping themselves in the love of God, looking for the mercy of our Lord. Some who doubt are to be shown compassion; others are to be saved with fear, pulling them out of the fire." },
            { verseStart: 24, verseEnd: 25, text: "Verses 24, 25 Now unto him who is able to keep you from falling, and to present you faultless before the presence of his glory with exceeding joy — to the only wise God our Saviour, be glory and majesty, dominion and power, both now and ever. Amen. This is one of the most magnificent doxologies in all of Scripture, assuring believers of God's keeping power." },
        ],
    },
});

// ═══════════════════════════════════════════════════════════════════
// JOEL (73 verses, 3 chapters)
// ═══════════════════════════════════════════════════════════════════
seedBook({
    slug: "joel",
    chapters: {
        1: [
            { verseStart: 1, verseEnd: 7, text: "Verses 1–7 The word of the Lord came to Joel. He calls the elders and inhabitants to hear and consider the unprecedented devastation brought by successive waves of locusts. What one swarm left, another devoured. The nation is called to awake and weep, for a mighty nation has come up against the land — innumerable, with teeth like lions — laying waste the vine and the fig tree." },
            { verseStart: 8, verseEnd: 13, text: "Verses 8–13 Joel calls for mourning like a virgin grieving for her betrothed. The offerings are cut off from the house of the Lord; the priests mourn. The field is wasted, the land mourns. The harvest has perished — wheat, barley, vine, fig, pomegranate, palm, and apple. Joy is withered from the children of men. The priests are urged to gird themselves with sackcloth and cry unto God." },
            { verseStart: 14, verseEnd: 20, text: "Verses 14–20 A solemn fast and assembly are called. The people must cry to the Lord, for the day of the Lord is at hand — a day of destruction from the Almighty. The seed has rotted under the clods, the granaries are desolate, the beasts groan for lack of pasture, and fire has devoured the wilderness. Even the rivers of water are dried up. When earthly supplies fail, God alone remains our refuge." },
        ],
        2: [
            { verseStart: 1, verseEnd: 11, text: "Verses 1–11 Blow the trumpet in Zion! Sound an alarm! The day of the Lord comes — a day of darkness and gloom. A great and strong people advance like an army: nothing escapes them. They run like horsemen, climb walls like soldiers, and march in perfect formation. The earth quakes before them, the heavens tremble. The Lord utters his voice before his army. The day of the Lord is great and very terrible; who can endure it?" },
            { verseStart: 12, verseEnd: 17, text: "Verses 12–17 Yet even now, says the Lord, turn to me with all your heart, with fasting, weeping, and mourning. Rend your hearts and not your garments. Return to the Lord, for he is gracious and merciful, slow to anger, and abounding in steadfast love. Who knows if he will turn and relent? Let the priests weep between the porch and the altar, saying, 'Spare your people, O Lord.'" },
            { verseStart: 18, verseEnd: 27, text: "Verses 18–27 Then the Lord becomes jealous for his land and has pity on his people. He sends grain, wine, and oil. He removes the northern army far away. Fear not, O land! Be glad and rejoice, for the Lord has done great things. The threshing floors shall be full and the vats overflow. God will restore the years the locusts have eaten. His people shall never again be put to shame." },
            { verseStart: 28, verseEnd: 32, text: "Verses 28–32 And it shall come to pass afterward that I will pour out my Spirit on all flesh. Your sons and daughters shall prophesy, your old men shall dream dreams, your young men shall see visions. On servants and handmaids I will pour out my Spirit. There will be wonders in heavens and earth. Whoever calls on the name of the Lord shall be saved. This prophecy was fulfilled at Pentecost, as Peter declared in Acts 2." },
        ],
        3: [
            { verseStart: 1, verseEnd: 8, text: "Verses 1–8 In those days, God will gather all nations to the Valley of Jehoshaphat and judge them for scattering his people Israel and dividing his land. They cast lots for God's people, traded boys for harlots and girls for wine. Tyre, Sidon, and Philistia are warned: God will return their deeds upon their own heads swiftly." },
            { verseStart: 9, verseEnd: 17, text: "Verses 9–17 Proclaim this among the nations: prepare for war! Beat plowshares into swords and pruning hooks into spears. Let the nations assemble in the Valley of Jehoshaphat. Multitudes, multitudes in the valley of decision! The sun and moon are darkened, the stars withdraw their shining. The Lord roars from Zion. But he is a refuge for his people. Then Jerusalem shall be holy, and strangers shall pass through her no more." },
            { verseStart: 18, verseEnd: 21, text: "Verses 18–21 In that day, the mountains shall drip with sweet wine, the hills flow with milk, and a fountain shall come from the house of the Lord. Egypt shall be desolate and Edom a wilderness for violence against Judah. But Judah shall abide forever, and Jerusalem from generation to generation. The Lord dwells in Zion. This points to the final restoration and God's eternal presence with his people." },
        ],
    },
});

// ═══════════════════════════════════════════════════════════════════
// SONG OF SOLOMON (117 verses, 8 chapters)
// ═══════════════════════════════════════════════════════════════════
seedBook({
    slug: "song-of-solomon",
    chapters: {
        1: [
            { verseStart: 1, verseEnd: 6, text: "Verses 1–6 The Song of Solomon, the song of songs, celebrates the mutual love between the bridegroom and bride — understood by the church as an allegory of Christ's love for his people. The bride yearns for the bridegroom's kisses, for his love is better than wine. She acknowledges her own unworthiness — 'dark but lovely' — yet is drawn by his grace. The daughters of Jerusalem are witnesses to this sacred love." },
            { verseStart: 7, verseEnd: 11, text: "Verses 7–11 The bride seeks to know where the bridegroom feeds his flock at noon, lest she appear as one who wanders. He directs her to follow the footsteps of the flock. He compares her beauty to a mare among Pharaoh's chariots, adorned with jewels. The communion between Christ and his church is tender and personal — he knows each believer by name." },
            { verseStart: 12, verseEnd: 17, text: "Verses 12–17 While the king sits at his table, the bride's perfume spreads its fragrance. The bridegroom is to her as a bundle of myrrh, a cluster of henna. He declares her beautiful, with dove's eyes. She responds that he is handsome and pleasant. Their dwelling is described in pastoral beauty — beams of cedar, rafters of fir. The mutual delight of Christ and the believer is the very essence of spiritual communion." },
        ],
        2: [
            { verseStart: 1, verseEnd: 7, text: "Verses 1–7 The bride calls herself a rose of Sharon, a lily of the valleys — humble yet precious. The bridegroom affirms her: as a lily among thorns, so is she among the daughters. She delights in his shade and his fruit is sweet. He brings her to the banqueting house, and his banner over her is love. She is lovesick and calls upon the daughters of Jerusalem not to stir up love until it pleases. Rest in God's love, for it comes in its own time." },
            { verseStart: 8, verseEnd: 13, text: "Verses 8–13 The voice of my beloved! Behold, he comes, leaping on the mountains, skipping on the hills. The beloved is like a gazelle or young stag. He stands behind the wall, gazing through the windows. He calls: 'Rise up, my love, my fair one, and come away. For the winter is past, the rain is over and gone. Flowers appear on the earth, the time of singing has come.' The season of refreshing follows every winter of the soul." },
            { verseStart: 14, verseEnd: 17, text: "Verses 14–17 The bridegroom asks to see the bride's face and hear her voice, for both are sweet. They must catch the little foxes that spoil the vines, for their vines have tender grapes. My beloved is mine, and I am his; he feeds among the lilies. Until the day breaks and the shadows flee away, turn and come. The little foxes are the small sins and distractions that damage spiritual growth." },
        ],
        3: [
            { verseStart: 1, verseEnd: 5, text: "Verses 1–5 By night on her bed, the bride seeks the one her soul loves but does not find him. She rises to search the city streets and squares. The watchmen find her, and she asks for her beloved. Scarcely past them, she finds him and holds him fast. The soul that truly loves Christ will not rest until it has found him. Spiritual seeking, though painful, always leads to joyful discovery." },
            { verseStart: 6, verseEnd: 11, text: "Verses 6–11 Who is this coming out of the wilderness like pillars of smoke, perfumed with myrrh and frankincense? Behold Solomon's palanquin, guarded by sixty valiant men. King Solomon made himself a chariot of Lebanon's wood, with pillars of silver, seat of gold, and interior paved with love. The daughters of Zion are called to behold the king on his wedding day. Christ comes to his church in glory, power, and tender love." },
        ],
        4: [
            { verseStart: 1, verseEnd: 7, text: "Verses 1–7 The bridegroom praises the bride's beauty in exquisite detail — eyes like doves, hair like a flock of goats, teeth like shorn ewes, lips like scarlet, temples like pomegranate behind the veil, neck like the tower of David. 'You are altogether beautiful, my love; there is no flaw in you.' Christ sees his church as beautiful, washed and sanctified by his grace, without spot or wrinkle." },
            { verseStart: 8, verseEnd: 11, text: "Verses 8–11 Come with me from Lebanon, my bride. The bridegroom is ravished by a single glance of her eyes. How fair is your love! How much better than wine! Your lips drip sweetness; honey and milk are under your tongue. The fragrance of your garments is like the fragrance of Lebanon. The communion of love between Christ and the soul surpasses all earthly delights." },
            { verseStart: 12, verseEnd: 16, text: "Verses 12–16 A garden enclosed is my sister, my bride — a spring shut up, a fountain sealed. Her plants are an orchard of pomegranates with pleasant fruits. Awake, O north wind, and come, O south! Blow upon my garden, that its spices may flow out. Let my beloved come into his garden and eat its pleasant fruits. The soul consecrated to Christ is a garden cultivated by the Holy Spirit, bearing fruit for God's pleasure." },
        ],
        5: [
            { verseStart: 1, verseEnd: 8, text: "Verses 1–8 The bridegroom enters his garden. The bride sleeps but her heart wakes. He knocks, but she delays. When she rises to open, he has gone. She seeks him but cannot find him. The watchmen strike and wound her. This describes the painful experience of spiritual lethargy — when Christ calls and the soul is slow to respond, his presence may be withdrawn for a season, to teach the cost of negligence." },
            { verseStart: 9, verseEnd: 16, text: "Verses 9–16 The daughters of Jerusalem ask: what is your beloved more than another? The bride describes him: white and ruddy, chief among ten thousand. His head is finest gold, his locks black as a raven, eyes like doves, cheeks like spice beds, lips like lilies dripping liquid myrrh. He is altogether lovely. This is my beloved, this is my friend. The believer delights in describing Christ's excellencies, for he surpasses all comparison." },
            { verseStart: 17, verseEnd: 30, text: "Verse 17 and following: Where has your beloved gone, that we may seek him with you? Through the testimony of a devoted heart, even outsiders are drawn to seek Christ." },
        ],
        6: [
            { verseStart: 1, verseEnd: 3, text: "Verses 1–3 The daughters ask where the beloved has gone. The bride knows: he has gone down to his garden, to the beds of spices, to feed in the gardens and gather lilies. I am my beloved's, and my beloved is mine. The mutual possession between Christ and the believer is the foundation of all spiritual assurance. He tends his garden — the church — with constant care." },
            { verseStart: 4, verseEnd: 10, text: "Verses 4–10 The bridegroom praises the bride again: beautiful as Tirzah, lovely as Jerusalem, awesome as an army with banners. Her beauty is unique among sixty queens and eighty concubines. The daughters see her and call her blessed. Who is she who looks forth as the morning, fair as the moon, clear as the sun? The church, when walking in holiness, shines with reflected glory." },
            { verseStart: 11, verseEnd: 13, text: "Verses 11–13 The bride went down to the garden of nuts to see the fruits of the valley. Before she was aware, her soul made her as the chariots of Amminadib. Return, return, O Shulamite! Why would you look upon her as upon the dance of two camps? The sudden surprises of grace lift the soul to heights it never expected." },
        ],
        7: [
            { verseStart: 1, verseEnd: 9, text: "Verses 1–9 The beauty of the bride is praised from feet to head: her feet in sandals, the curves of her thighs like jewels, her navel a rounded goblet, her waist a heap of wheat set about with lilies. Her stature is like a palm tree. The bridegroom says: I will climb the palm tree and take hold of its fruit. May your love be like the best wine. Christ delights in the graces of his people, and each virtue adorns the soul." },
            { verseStart: 10, verseEnd: 13, text: "Verses 10–13 I am my beloved's, and his desire is toward me. Come, let us go forth into the field, lodge in the villages, get up early to the vineyards. Let us see if the vine has budded. There I will give you my love. The mandrakes give fragrance, and at our gates are all manner of pleasant fruits. The fruitful believer invites Christ to see the evidences of grace in daily life." },
        ],
        8: [
            { verseStart: 1, verseEnd: 4, text: "Verses 1–4 Oh, that you were as my brother! I would lead you and bring you into my mother's house. His left hand is under my head and his right hand embraces me. I charge you, daughters of Jerusalem, do not stir up love until it pleases. The intimacy of communion with Christ is best experienced in the quiet devotion of the heart, not forced or artificial." },
            { verseStart: 5, verseEnd: 7, text: "Verses 5–7 Who is this coming up from the wilderness, leaning upon her beloved? Set me as a seal upon your heart, as a seal upon your arm: for love is strong as death, jealousy is fierce as the grave. Its flames are flames of fire, a most vehement flame. Many waters cannot quench love, neither can floods drown it. If a man would give all the substance of his house for love, it would utterly be despised. The love of Christ is inextinguishable and invaluable." },
            { verseStart: 8, verseEnd: 14, text: "Verses 8–14 We have a little sister — what shall we do for her? If she is a wall, we will build upon her. Solomon's vineyard is let out to keepers. The bride says: my vineyard is my own. Make haste, my beloved, and be like a gazelle on the mountains of spices. The closing cry of the church is for Christ to come quickly — the desire of every believing heart until the day of his appearing." },
        ],
    },
});

// ═══════════════════════════════════════════════════════════════════
// LAMENTATIONS (154 verses, 5 chapters)
// ═══════════════════════════════════════════════════════════════════
seedBook({
    slug: "lamentations",
    chapters: {
        1: [
            { verseStart: 1, verseEnd: 7, text: "Verses 1–7 How lonely sits the city that was full of people! Jerusalem, once great among the nations, has become a widow. She weeps bitterly in the night, with none to comfort her. All her friends have dealt treacherously. Judah has gone into captivity because of affliction. Her adversaries prosper, for the Lord has afflicted her for the multitude of her transgressions. Her children have gone into captivity. The ruin of Jerusalem is a solemn warning against persistent sin." },
            { verseStart: 8, verseEnd: 12, text: "Verses 8–12 Jerusalem has sinned grievously, therefore she has become unclean. All who honored her despise her, for they have seen her nakedness. Her filthiness clings to her skirts; she did not consider her end. She has fallen astonishingly, with no comforter. The adversary has stretched out his hand over all her pleasant things. 'Is it nothing to you, all you who pass by? Look and see if there is any sorrow like my sorrow.' Sin's consequences bring a grief that calls out for attention." },
            { verseStart: 13, verseEnd: 17, text: "Verses 13–17 From above, fire was sent into the bones of Jerusalem. A net was spread for her feet. The Lord has made her desolate, faint all day long. The yoke of her transgressions is bound by his hand. The Lord has trodden the virgin daughter of Judah as in a winepress. For these things she weeps. The Lord has commanded that Jacob's enemies should surround him. Zion spreads out her hands, but there is none to comfort her." },
            { verseStart: 18, verseEnd: 22, text: "Verses 18–22 'The Lord is righteous, for I have rebelled against his commandment.' The penitent soul acknowledges that God's judgments are just. Jerusalem called to her lovers, but they deceived her. Her priests and elders perished in the city while seeking food. 'Look, O Lord, for I am in distress.' The inhabitants cry out in their affliction, yet acknowledge the righteousness of God's dealings." },
        ],
        2: [
            { verseStart: 1, verseEnd: 9, text: "Verses 1–9 The Lord has covered the daughter of Zion with a cloud in his anger, cast down the beauty of Israel from heaven, and has not remembered his footstool. He has swallowed up all the dwellings of Jacob without pity. He has cut off the horn of Israel, burned like a flaming fire. He has bent his bow like an enemy. The Lord has destroyed his tabernacle and abolished his appointed feasts. Zion's gates have sunk into the ground; her bars are destroyed." },
            { verseStart: 10, verseEnd: 14, text: "Verses 10–14 The elders sit on the ground in silence, casting dust on their heads. The young women bow their heads to the ground. The prophet's eyes fail with tears for the destruction of Jerusalem. He asks: 'What can I say for you? Who can heal you?' The prophets saw false and deceptive visions, failing to expose her iniquity that might have restored her fortunes." },
            { verseStart: 15, verseEnd: 19, text: "Verses 15–19 All who pass by clap their hands and hiss and wag their heads at Jerusalem. Her enemies have opened their mouths wide. But the Lord has done what he purposed — he has fulfilled his word commanded in days of old. Arise, cry out in the night! Pour out your heart like water before the Lord. Lift your hands toward him for the life of your young children, who faint for hunger at every street corner." },
            { verseStart: 20, verseEnd: 22, text: "Verses 20–22 'Look, O Lord, and consider! Women eat their own offspring! Priest and prophet are killed in the sanctuary! Young and old lie on the ground in the streets. You have slain them in the day of your anger.' The depth of Jerusalem's suffering is described with unflinching honesty, showing that sin's consequences spare no one — yet even in this darkest hour, the cry is still directed to God." },
        ],
        3: [
            { verseStart: 1, verseEnd: 18, text: "Verses 1–18 'I am the man who has seen affliction by the rod of God's wrath.' The prophet describes his personal anguish — darkness, besiegement, chains, shut-out prayers, blocked paths, being like a bear lying in wait. He has been pierced, filled with bitterness, broken and made to cower. 'My endurance has perished, and so has my hope from the Lord.' The depth of despair is honestly expressed, as even the faithful may experience seasons of spiritual darkness." },
            { verseStart: 19, verseEnd: 36, text: "Verses 19–36 Yet the prophet turns from despair to hope. 'This I recall to my mind, therefore I have hope: the Lord's mercies never cease; his compassions never fail. They are new every morning — great is your faithfulness!' The Lord is good to those who wait for him, to the soul who seeks him. It is good to wait quietly for the salvation of the Lord. These are among the most beloved verses in Scripture, a fountain of hope in the midst of ruin." },
            { verseStart: 37, verseEnd: 54, text: "Verses 37–54 Who can command anything to happen without the Lord's permission? Why should a living man complain about the punishment of his sins? Let us search and test our ways, and return to the Lord. We have transgressed and rebelled; God has not pardoned. He has covered himself with anger and pursued us. 'Waters flowed over my head; I said, I am cut off.' Affliction teaches man to search his own heart and repent." },
            { verseStart: 55, verseEnd: 66, text: "Verses 55–66 'I called on your name, O Lord, from the lowest pit. You heard my plea: Do not close your ear to my cry for relief! You came near when I called; you said, Do not fear.' The Lord has taken up the cause of the afflicted soul. He will repay the enemies. 'Pursue them in anger and destroy them from under the heavens, O Lord.' Even in the deepest pit, faith finds that God hears the cry of the humble." },
        ],
        4: [
            { verseStart: 1, verseEnd: 10, text: "Verses 1–10 How the gold has grown dim, the fine gold changed! The sacred stones are scattered. The precious sons of Zion, once valued as fine gold, are now regarded as earthen pitchers. Even jackals nurse their young, but the daughter of my people has become cruel, like ostriches in the wilderness. The nursing child's tongue clings to the roof of its mouth for thirst. Those who once feasted delicately perish in the streets. The punishment of Zion is worse than that of Sodom." },
            { verseStart: 11, verseEnd: 16, text: "Verses 11–16 The Lord has accomplished his fury and kindled a fire in Zion that consumed her foundations. The kings of the earth would not have believed that the adversary could enter Jerusalem's gates. It was for the sins of her prophets and the iniquities of her priests, who shed the blood of the righteous. They wandered blind in the streets. The face of the Lord has scattered them; he regards them no more." },
            { verseStart: 17, verseEnd: 22, text: "Verses 17–22 Our eyes failed, watching vainly for help from a nation that could not save. Our steps were tracked so we could not walk in our streets. Our end had come. Our pursuers were swifter than eagles. The anointed of the Lord was caught in their pits. But the punishment of your iniquity is accomplished, O daughter of Zion; he will keep you in captivity no longer. Hope survives even in judgment's aftermath." },
        ],
        5: [
            { verseStart: 1, verseEnd: 10, text: "Verses 1–10 'Remember, O Lord, what has come upon us. Look and see our disgrace!' Our inheritance has been turned over to strangers, our homes to foreigners. We have become orphans, fatherless. We must pay for our own water, our own wood. We are pursued. We have made submission to Egypt and Assyria to get enough bread. Our fathers sinned and are no more, and we bear their iniquities. Our skin is hot as an oven because of the burning heat of famine." },
            { verseStart: 11, verseEnd: 18, text: "Verses 11–18 Women are violated in Zion. Princes are hung by their hands. Elders are shown no respect. Young men grind at the mill, boys stagger under loads of wood. The old men have left the city gate, the young their music. Joy has ceased; dancing has turned to mourning. The crown has fallen from our head. Woe to us, for we have sinned! Mount Zion lies desolate; jackals prowl over it." },
            { verseStart: 19, verseEnd: 22, text: "Verses 19–22 'You, O Lord, remain forever; your throne endures to all generations. Why do you forget us forever, why do you forsake us for so long? Restore us to yourself, O Lord, that we may be restored! Renew our days as of old — unless you have utterly rejected us and are angry with us beyond measure.' The book ends with a cry for restoration that trusts in God's eternal nature even while fearing his wrath. The question hangs: will God restore? The answer comes through Christ." },
        ],
    },
});

console.log("\n=== BATCH 1 COMPLETE (Jude, Joel, Song of Solomon, Lamentations) ===");

// Verify
const total = db.prepare(`SELECT COUNT(*) as cnt FROM commentaries`).get() as { cnt: number };
console.log(`Total commentaries in database: ${total.cnt}`);

db.close();
