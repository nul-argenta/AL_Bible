export interface BookMeta {
    name: string;
    slug: string;
    chapters: number;
    category: string;
    introduction?: string;
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
    { name: "Genesis", slug: "genesis", chapters: 50, category: "law", introduction: "The book of beginnings, detailing the creation of the world, early human history, and God's covenant with the ancestors of Israel: Abraham, Isaac, and Jacob." },
    { name: "Exodus", slug: "exodus", chapters: 40, category: "law", introduction: "The story of Israel's liberation from slavery in Egypt, led by Moses, and their journey to Mount Sinai to receive God's law." },
    { name: "Leviticus", slug: "leviticus", chapters: 27, category: "law", introduction: "A detailed handbook of laws and rituals for the priests and the people, teaching them how to live holy lives and approach God." },
    { name: "Numbers", slug: "numbers", chapters: 36, category: "law", introduction: "The account of Israel's 40-year period of wandering in the desert due to disobedience, counting the people, and preparing to enter the Promised Land." },
    { name: "Deuteronomy", slug: "deuteronomy", chapters: 34, category: "law", introduction: "Moses' final speeches summarizing God's laws and reminding the new generation of Israelites of their covenant with God before entering Canaan." },

    // ─── OT History ───
    { name: "Joshua", slug: "joshua", chapters: 24, category: "ot-history", introduction: "The conquest of Canaan, the Promised Land, under the leadership of Joshua, and the distribution of the land among the tribes of Israel." },
    { name: "Judges", slug: "judges", chapters: 21, category: "ot-history", introduction: "A turbulent period showing Israel's cycle of rebellion, oppression, and deliverance by regional leaders called 'judges' before they had a king." },
    { name: "Ruth", slug: "ruth", chapters: 4, category: "ot-history", introduction: "A beautiful story of loyalty and love involving a Moabite widow who follows her mother-in-law to Israel and becomes an ancestor of King David." },
    { name: "1 Samuel", slug: "1-samuel", chapters: 31, category: "ot-history", introduction: "The transition from the judges to the monarchy, highlighting Samuel the prophet, the rise and fall of King Saul, and the early years of David." },
    { name: "2 Samuel", slug: "2-samuel", chapters: 24, category: "ot-history", introduction: "The reign of King David, marked by great military victories, his unification of Israel, but also his personal failures and family turmoil." },
    { name: "1 Kings", slug: "1-kings", chapters: 22, category: "ot-history", introduction: "The reign of King Solomon, the building of the temple, and the tragic division of Israel into two kingdoms: North and South." },
    { name: "2 Kings", slug: "2-kings", chapters: 25, category: "ot-history", introduction: "The continued decline of the divided kingdoms, ignoring the warnings of the prophets, ultimately leading to their exile by Assyria and Babylon." },
    { name: "1 Chronicles", slug: "1-chronicles", chapters: 29, category: "ot-history", introduction: "A retelling of Israel's history with a focus on King David, the temple worship, and a genealogically rich reminder of God's faithful promises." },
    { name: "2 Chronicles", slug: "2-chronicles", chapters: 36, category: "ot-history", introduction: "Continuing the history from Solomon to the Babylonian exile, focusing intensely on the kings of Judah and the importance of true worship." },
    { name: "Ezra", slug: "ezra", chapters: 10, category: "ot-history", introduction: "The story of the Jewish exiles returning to Jerusalem from Babylon and their efforts to rebuild the temple and restore community worship." },
    { name: "Nehemiah", slug: "nehemiah", chapters: 13, category: "ot-history", introduction: "The account of Nehemiah an official who returns to rebuild the broken walls of Jerusalem despite intense opposition, restoring national security." },
    { name: "Esther", slug: "esther", chapters: 10, category: "ot-history", introduction: "A dramatic, suspenseful account of a Jewish orphan who becomes the Queen of Persia and bravely risks her life to save her people from genocide." },

    // ─── Wisdom & Poetry ───
    { name: "Job", slug: "job", chapters: 42, category: "wisdom", introduction: "A profound poetic exploration of suffering, faith, and the sovereignty of God, centered on a righteous man who loses everything." },
    { name: "Psalms", slug: "psalms", chapters: 150, category: "wisdom", introduction: "A collection of 150 ancient prayers, songs, and poems expressing every human emotion—from deep despair to radiant joy—directed toward God." },
    { name: "Proverbs", slug: "proverbs", chapters: 31, category: "wisdom", introduction: "A collection of practical wisdom, short sayings, and moral instructions primarily attributed to King Solomon for living a good, God-honoring life." },
    { name: "Ecclesiastes", slug: "ecclesiastes", chapters: 12, category: "wisdom", introduction: "A philosophical reflection on the meaning of life, acknowledging that without God, everything under the sun is fleeting and ultimately meaningless." },
    { name: "Song of Solomon", slug: "song-of-solomon", chapters: 8, category: "wisdom", introduction: "A passionate, poetic dialogue celebrating the beauty, intimacy, and romance of marital love." },

    // ─── Major Prophets ───
    { name: "Isaiah", slug: "isaiah", chapters: 66, category: "major-prophets", introduction: "A sweeping prophetic book warning of judgment but offering spectacular promises of a coming Messiah, the 'Suffering Servant,' who brings salvation." },
    { name: "Jeremiah", slug: "jeremiah", chapters: 52, category: "major-prophets", introduction: "The 'weeping prophet' warns Judah of impending destruction by Babylon, calling them to repent while still offering hope of a new covenant." },
    { name: "Lamentations", slug: "lamentations", chapters: 5, category: "major-prophets", introduction: "A collection of five poetic dirges expressing deep grief over the destruction of Jerusalem and the temple, yet finding hope in God's faithfulness." },
    { name: "Ezekiel", slug: "ezekiel", chapters: 48, category: "major-prophets", introduction: "A priest in exile receives vivid, bizarre visions of God's glory, promising that God would restore His people and give them new hearts." },
    { name: "Daniel", slug: "daniel", chapters: 12, category: "major-prophets", introduction: "The story of faithfulness in a hostile culture, featuring young men surviving fiery trials and lions, paired with apocalyptic visions of future kingdoms." },

    // ─── Minor Prophets ───
    { name: "Hosea", slug: "hosea", chapters: 14, category: "minor-prophets", introduction: "God commands a prophet to marry an unfaithful woman as a living metaphor of God's enduring love for the rebellious nation of Israel." },
    { name: "Joel", slug: "joel", chapters: 3, category: "minor-prophets", introduction: "A brief but powerful warning of an impending judgment resembling a massive locust plague, urging repentance and promising the outpouring of God's Spirit." },
    { name: "Amos", slug: "amos", chapters: 9, category: "minor-prophets", introduction: "A shepherd confronts the wealthy elite of Israel, denouncing their social injustice, religious hypocrisy, and neglect of the poor." },
    { name: "Obadiah", slug: "obadiah", chapters: 1, category: "minor-prophets", introduction: "The shortest book in the Old Testament, pronouncing judgment strictly upon the neighboring nation of Edom for their cruelty against Judah." },
    { name: "Jonah", slug: "jonah", chapters: 4, category: "minor-prophets", introduction: "A rebellious prophet tries to flee from God's command to preach to the enemy city of Nineveh, leading to a dramatic rescue by a great fish." },
    { name: "Micah", slug: "micah", chapters: 7, category: "minor-prophets", introduction: "A prophet calls out the corruption of Israel's leaders and famously predicts that the coming Messiah and eternal ruler would be born in Bethlehem." },
    { name: "Nahum", slug: "nahum", chapters: 3, category: "minor-prophets", introduction: "A poem predicting the inevitable destruction and ruin of the brutal Assyrian capital of Nineveh, bringing comfort to the oppressed." },
    { name: "Habakkuk", slug: "habakkuk", chapters: 3, category: "minor-prophets", introduction: "A prophet wrestles with God, asking why evil goes unpunished, concluding with a beautiful declaration of faith despite desperate circumstances." },
    { name: "Zephaniah", slug: "zephaniah", chapters: 3, category: "minor-prophets", introduction: "A warning of the coming 'Day of the Lord,' a terrifying judgment that will purify God's people and lead to the restoration of an international remnant." },
    { name: "Haggai", slug: "haggai", chapters: 2, category: "minor-prophets", introduction: "A brief message urging the returned exiles to stop prioritizing their own houses and get back to work rebuilding God's temple in Jerusalem." },
    { name: "Zechariah", slug: "zechariah", chapters: 14, category: "minor-prophets", introduction: "A series of symbolic visions meant to encourage the temple builders, filled with prophecies about the coming Messiah who brings peace." },
    { name: "Malachi", slug: "malachi", chapters: 4, category: "minor-prophets", introduction: "The final Old Testament prophet confronts Israel about their apathy and corrupt sacrifices, promising a coming messenger to prepare the way for the Lord." },

    // ─── Gospels ───
    { name: "Matthew", slug: "matthew", chapters: 28, category: "gospels", introduction: "A Gospel written to a Jewish audience, emphasizing Jesus as the long-awaited Messianic King who fulfills the ancient Old Testament prophecies." },
    { name: "Mark", slug: "mark", chapters: 16, category: "gospels", introduction: "The shortest, most action-packed Gospel, highlighting Jesus as the suffering Servant of God, focusing more on His miracles than His teachings." },
    { name: "Luke", slug: "luke", chapters: 24, category: "gospels", introduction: "A carefully investigated, comprehensive account emphasizing Jesus as the Savior for all people—specifically the poor, outcasts, and women." },
    { name: "John", slug: "john", chapters: 21, category: "gospels", introduction: "A deeply theological and intimate portrait of Jesus as the eternal Word of God, focusing on His divine identity and the miracles that prove it." },

    // ─── NT History ───
    { name: "Acts", slug: "acts", chapters: 28, category: "nt-history", introduction: "The thrilling sequel to Luke, documenting the arrival of the Holy Spirit, the birth of the early church, and the explosive spread of the Gospel." },

    // ─── Pauline Epistles ───
    { name: "Romans", slug: "romans", chapters: 16, category: "pauline", introduction: "Paul's most systematic theological letter, brilliantly explaining the depravity of humanity, justification by faith, and the transforming power of grace." },
    { name: "1 Corinthians", slug: "1-corinthians", chapters: 16, category: "pauline", introduction: "A deeply practical letter correcting severe behavioral problems in a divided church, addressing issues like immorality, spiritual gifts, and the resurrection." },
    { name: "2 Corinthians", slug: "2-corinthians", chapters: 13, category: "pauline", introduction: "A highly personal letter where Paul defends his apostolic authority, discusses the nature of true ministry, and shares his own sufferings and weaknesses." },
    { name: "Galatians", slug: "galatians", chapters: 6, category: "pauline", introduction: "A fiery letter combating the false teaching that Christians must obey Jewish law to be saved, defending the absolute freedom found in Christ alone." },
    { name: "Ephesians", slug: "ephesians", chapters: 6, category: "pauline", introduction: "A majestic letter outlining the incredible spiritual blessings believers have in Christ and offering practical guidance for unity and spiritual warfare." },
    { name: "Philippians", slug: "philippians", chapters: 4, category: "pauline", introduction: "An overwhelmingly joyful letter written from prison, thanking the church for their support and encouraging them to live humbly like Christ." },
    { name: "Colossians", slug: "colossians", chapters: 4, category: "pauline", introduction: "A letter exalting the supreme greatness of Jesus Christ over false philosophies, emphasizing that believers are complete in Him." },
    { name: "1 Thessalonians", slug: "1-thessalonians", chapters: 5, category: "pauline", introduction: "A warm, encouraging letter comforting worried believers and providing clarity and hope regarding the second coming of Jesus Christ." },
    { name: "2 Thessalonians", slug: "2-thessalonians", chapters: 3, category: "pauline", introduction: "A follow-up letter correcting misunderstandings about the end times, warning against idleness, and encouraging believers to stand firm under persecution." },
    { name: "1 Timothy", slug: "1-timothy", chapters: 6, category: "pauline", introduction: "A pastoral letter from Paul to a young church leader, offering practical instructions on church organization, leadership qualifications, and sound doctrine." },
    { name: "2 Timothy", slug: "2-timothy", chapters: 4, category: "pauline", introduction: "Paul’s final, deeply moving letter before his execution, urging Timothy to remain bold, endure suffering, and faithfully preach the word." },
    { name: "Titus", slug: "titus", chapters: 3, category: "pauline", introduction: "A short instructional letter directing a trusted companion on how to establish order, appoint elders, and promote good works in the churches of Crete." },
    { name: "Philemon", slug: "philemon", chapters: 1, category: "pauline", introduction: "A deeply personal plea from Paul urging a Christian master to forgive and accept his runaway slave back as a beloved brother in Christ." },

    // ─── General Epistles ───
    { name: "Hebrews", slug: "hebrews", chapters: 13, category: "general", introduction: "An incredible theological argument addressed to Jewish Christians, proving that Jesus is utterly superior to the angels, Moses, and the old sacrificial system." },
    { name: "James", slug: "james", chapters: 5, category: "general", introduction: "A highly practical manual on Christian living, famously emphasizing that genuine faith must be proven visible by active obedience and good works." },
    { name: "1 Peter", slug: "1-peter", chapters: 5, category: "general", introduction: "A message of immense hope to scattered, persecuted believers, teaching them how to endure suffering with grace and live holy lives as strangers in the world." },
    { name: "2 Peter", slug: "2-peter", chapters: 3, category: "general", introduction: "A forceful warning against corrupt false teachers infiltrating the church and a reminder that Christ’s delayed return is an act of God's patience." },
    { name: "1 John", slug: "1-john", chapters: 5, category: "general", introduction: "A reassuring letter reminding believers about the absolute basics of Christianity: knowing the truth, obeying God’s commands, and walking in unconditional love." },
    { name: "2 John", slug: "2-john", chapters: 1, category: "general", introduction: "A very brief letter emphasizing the vital connection between love and truth, while sternly warning against welcoming false teachers into the home." },
    { name: "3 John", slug: "3-john", chapters: 1, category: "general", introduction: "A tiny, personal note specifically praising a man named Gaius for his hospitality and confronting a dictatorial church leader named Diotrephes." },
    { name: "Jude", slug: "jude", chapters: 1, category: "general", introduction: "An urgent, hard-hitting warning exposing false teachers who have slipped into the church unnoticed, urging believers to earnestly fight for the faith." },

    // ─── Prophecy ───
    { name: "Revelation", slug: "revelation", chapters: 22, category: "prophecy", introduction: "A highly symbolic, apocalyptic vision granted to the Apostle John, promising the ultimate defeat of evil and the breathtaking, glorious return of Jesus Christ." },

    // ─── Catholic Deuterocanon / Extra Books ───
    { name: "Tobit", slug: "tobit", chapters: 14, category: "ot-history", introduction: "A captivating religious romance and adventure from the Deuterocanon, emphasizing God's providence, the importance of family, almsgiving, and the ministry of angels." },
    { name: "Judith", slug: "judith", chapters: 16, category: "ot-history", introduction: "A courageous, suspenseful tale of a beautiful Jewish widow who uses her wit and faith to rescue her people from a devastating Assyrian invasion." },
    { name: "Esther (Greek)", slug: "esther-greek", chapters: 16, category: "ot-history", introduction: "Expansions to the Book of Esther that explicitly highlight God’s intervention, containing specific prayers of Esther and Mordecai not found in the Hebrew text." },
    { name: "Wisdom", slug: "wisdom", chapters: 19, category: "wisdom", introduction: "A profound, philosophical book exploring the immortality of the soul, the folly of idolatry, and the unparalleled beauty and necessity of divine wisdom." },
    { name: "Sirach", slug: "sirach", chapters: 51, category: "wisdom", introduction: "Also known as Ecclesiasticus, this extensive collection of ethical teachings and practical advice covers everything from friendship and finances to fear of the Lord." },
    { name: "Baruch", slug: "baruch", chapters: 6, category: "major-prophets", introduction: "A prophetic text attributed to Jeremiah's secretary, containing a heartfelt prayer of repentance, praise for wisdom, and messages of hope for the exiles." },
    { name: "1 Maccabees", slug: "1-maccabees", chapters: 16, category: "ot-history", introduction: "A detailed, historical account of the heroic Jewish revolt led by the Maccabee family against the oppressive Seleucid empire to restore temple worship." },
    { name: "2 Maccabees", slug: "2-maccabees", chapters: 15, category: "ot-history", introduction: "A deeply theological retelling of the Maccabean revolt, specifically highlighting martyrdom, the resurrection of the dead, and the power of intercessory prayer." },
];

export const TOTAL_CHAPTERS = AT_BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

/** Get all books in a category */
export const getCategoryBooks = (categoryId: string): BookMeta[] =>
    AT_BIBLE_BOOKS.filter(b => b.category === categoryId);
