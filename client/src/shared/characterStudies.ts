export interface CharacterStudy {
    id: string;
    name: string;
    title: string;
    icon: string;
    era: string;
    summary: string;
    keyTraits: string[];
    keyVerses: { ref: string; bookSlug: string; chapter: number; verse: number; text: string }[];
    timeline: { event: string; ref: string }[];
}

export const CHARACTER_STUDIES: CharacterStudy[] = [
    {
        id: "abraham",
        name: "Abraham",
        title: "Father of Faith",
        icon: "⛺",
        era: "Patriarchs (~2000 BC)",
        summary: "Called by God to leave his homeland, Abraham became the father of many nations through faith. His willingness to sacrifice Isaac demonstrated supreme trust in God's promises.",
        keyTraits: ["Faith", "Obedience", "Patience", "Hospitality"],
        keyVerses: [
            { ref: "Genesis 12:1", bookSlug: "genesis", chapter: 12, verse: 1, text: "Now the LORD said to Abram, 'Get out of your country, and from your relatives, and from your father's house, to the land that I will show you.'" },
            { ref: "Genesis 15:6", bookSlug: "genesis", chapter: 15, verse: 6, text: "He believed in the LORD, and he credited it to him for righteousness." },
            { ref: "Hebrews 11:8", bookSlug: "hebrews", chapter: 11, verse: 8, text: "By faith Abraham, when he was called, obeyed to go out to a place which he was to receive for an inheritance." },
        ],
        timeline: [
            { event: "Called from Ur of the Chaldees", ref: "Genesis 12:1-4" },
            { event: "Covenant established with God", ref: "Genesis 15:1-21" },
            { event: "Birth of Isaac", ref: "Genesis 21:1-7" },
            { event: "Binding of Isaac (Aqedah)", ref: "Genesis 22:1-19" },
            { event: "Death and burial at Machpelah", ref: "Genesis 25:7-10" },
        ]
    },
    {
        id: "moses",
        name: "Moses",
        title: "Deliverer of Israel",
        icon: "🔥",
        era: "Exodus (~1450 BC)",
        summary: "Raised in Pharaoh's court, called at the burning bush, Moses led Israel out of Egypt and received the Law on Sinai. The greatest prophet of the Old Testament.",
        keyTraits: ["Humility", "Leadership", "Perseverance", "Intercession"],
        keyVerses: [
            { ref: "Exodus 3:14", bookSlug: "exodus", chapter: 3, verse: 14, text: "God said to Moses, 'I AM WHO I AM,' and he said, 'You shall tell the children of Israel this: I AM has sent me to you.'" },
            { ref: "Deuteronomy 34:10", bookSlug: "deuteronomy", chapter: 34, verse: 10, text: "Since then, there has not arisen a prophet in Israel like Moses, whom the LORD knew face to face." },
        ],
        timeline: [
            { event: "Born during Egyptian slavery, hidden in the Nile", ref: "Exodus 2:1-10" },
            { event: "Burning bush encounter", ref: "Exodus 3:1-22" },
            { event: "Ten Plagues and Passover", ref: "Exodus 7-12" },
            { event: "Parting the Red Sea", ref: "Exodus 14:13-31" },
            { event: "Receives the Ten Commandments", ref: "Exodus 20:1-17" },
        ]
    },
    {
        id: "david",
        name: "David",
        title: "Shepherd King",
        icon: "👑",
        era: "United Kingdom (~1000 BC)",
        summary: "From shepherd boy to Israel's greatest king, David was 'a man after God's own heart.' His psalms remain the church's most beloved worship literature.",
        keyTraits: ["Worship", "Courage", "Repentance", "Leadership"],
        keyVerses: [
            { ref: "1 Samuel 16:7", bookSlug: "1-samuel", chapter: 16, verse: 7, text: "For the LORD doesn't see as man sees. For man looks at the outward appearance, but the LORD looks at the heart." },
            { ref: "Psalm 23:1", bookSlug: "psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall lack nothing." },
            { ref: "Acts 13:22", bookSlug: "acts", chapter: 13, verse: 22, text: "He raised up David to be their king, of whom he testified, 'I have found David the son of Jesse, a man after my heart.'" },
        ],
        timeline: [
            { event: "Anointed by Samuel as a youth", ref: "1 Samuel 16:1-13" },
            { event: "Defeats Goliath", ref: "1 Samuel 17:1-54" },
            { event: "Crowned king of Israel", ref: "2 Samuel 5:1-5" },
            { event: "Brings the Ark to Jerusalem", ref: "2 Samuel 6:1-19" },
            { event: "Sin with Bathsheba and repentance", ref: "2 Samuel 11-12, Psalm 51" },
        ]
    },
    {
        id: "ruth",
        name: "Ruth",
        title: "The Faithful Daughter",
        icon: "🌾",
        era: "Judges (~1100 BC)",
        summary: "A Moabite widow who chose to follow her mother-in-law Naomi and the God of Israel. Her loyalty and faithfulness brought her into the lineage of King David and ultimately Jesus Christ.",
        keyTraits: ["Loyalty", "Faithfulness", "Humility", "Courage"],
        keyVerses: [
            { ref: "Ruth 1:16", bookSlug: "ruth", chapter: 1, verse: 16, text: "Ruth said, 'Don't urge me to leave you, and to return from following you, for where you go, I will go; and where you stay, I will stay. Your people will be my people, and your God my God.'" },
        ],
        timeline: [
            { event: "Chooses to stay with Naomi", ref: "Ruth 1:14-18" },
            { event: "Gleans in Boaz's fields", ref: "Ruth 2:1-23" },
            { event: "Goes to the threshing floor", ref: "Ruth 3:1-18" },
            { event: "Redeemed by Boaz", ref: "Ruth 4:1-12" },
            { event: "Becomes great-grandmother of David", ref: "Ruth 4:13-22" },
        ]
    },
    {
        id: "elijah",
        name: "Elijah",
        title: "Prophet of Fire",
        icon: "⚡",
        era: "Divided Kingdom (~870 BC)",
        summary: "The fiery prophet who stood alone against 450 prophets of Baal on Mount Carmel. Despite moments of despair, he never compromised his devotion to God.",
        keyTraits: ["Boldness", "Faith", "Zeal", "Vulnerability"],
        keyVerses: [
            { ref: "1 Kings 18:21", bookSlug: "1-kings", chapter: 18, verse: 21, text: "Elijah came near to all the people, and said, 'How long will you waver between the two sides? If the LORD is God, follow him; but if Baal, then follow him.'" },
        ],
        timeline: [
            { event: "Proclaims drought to Ahab", ref: "1 Kings 17:1" },
            { event: "Fed by ravens at Cherith", ref: "1 Kings 17:2-7" },
            { event: "Showdown on Mount Carmel", ref: "1 Kings 18:20-40" },
            { event: "Flees to Horeb in despair", ref: "1 Kings 19:1-18" },
            { event: "Taken to heaven in a whirlwind", ref: "2 Kings 2:1-12" },
        ]
    },
    {
        id: "esther",
        name: "Esther",
        title: "Queen of Courage",
        icon: "🏛️",
        era: "Persian Period (~480 BC)",
        summary: "A Jewish orphan who became queen of Persia and risked her life to save her people from genocide. 'For such a time as this' — her story shows God's providence even when his name is never mentioned.",
        keyTraits: ["Courage", "Wisdom", "Faith", "Self-sacrifice"],
        keyVerses: [
            { ref: "Esther 4:14", bookSlug: "esther", chapter: 4, verse: 14, text: "For if you remain silent now, relief and deliverance will come to the Jews from another place, but you and your father's house will perish. Who knows if you haven't come to the kingdom for such a time as this?" },
        ],
        timeline: [
            { event: "Chosen as queen", ref: "Esther 2:1-18" },
            { event: "Haman's plot to destroy the Jews", ref: "Esther 3:1-15" },
            { event: "Mordecai's challenge to Esther", ref: "Esther 4:1-17" },
            { event: "Banquet and accusation of Haman", ref: "Esther 7:1-10" },
            { event: "The Jews are saved", ref: "Esther 8:1-17" },
        ]
    },
    {
        id: "paul",
        name: "Paul",
        title: "Apostle to the Nations",
        icon: "✉️",
        era: "Early Church (~5-67 AD)",
        summary: "From persecutor of Christians to the greatest missionary of the early church. Paul's dramatic conversion on the Damascus road transformed a zealous Pharisee into the author of much of the New Testament.",
        keyTraits: ["Zeal", "Theological depth", "Endurance", "Grace"],
        keyVerses: [
            { ref: "Philippians 3:8", bookSlug: "philippians", chapter: 3, verse: 8, text: "I count all things to be a loss for the excellency of the knowledge of Christ Jesus, my Lord." },
            { ref: "Galatians 2:20", bookSlug: "galatians", chapter: 2, verse: 20, text: "I have been crucified with Christ, and it is no longer I who live, but Christ lives in me." },
            { ref: "2 Timothy 4:7", bookSlug: "2-timothy", chapter: 4, verse: 7, text: "I have fought the good fight. I have finished the course. I have kept the faith." },
        ],
        timeline: [
            { event: "Conversion on Damascus road", ref: "Acts 9:1-19" },
            { event: "First missionary journey", ref: "Acts 13-14" },
            { event: "Jerusalem Council", ref: "Acts 15:1-35" },
            { event: "Imprisonment in Rome", ref: "Acts 28:16-31" },
            { event: "Final letters to Timothy", ref: "2 Timothy 4:6-8" },
        ]
    },
    {
        id: "peter",
        name: "Peter",
        title: "The Rock",
        icon: "🪨",
        era: "Early Church (~1-67 AD)",
        summary: "A fisherman called to be a fisher of men, Peter's impulsive nature led to both dramatic professions of faith and agonizing denials. Yet Jesus restored him to lead the early church.",
        keyTraits: ["Boldness", "Impulsiveness", "Restoration", "Leadership"],
        keyVerses: [
            { ref: "Matthew 16:16", bookSlug: "matthew", chapter: 16, verse: 16, text: "Simon Peter answered, 'You are the Christ, the Son of the living God.'" },
            { ref: "John 21:17", bookSlug: "john", chapter: 21, verse: 17, text: "He said to him the third time, 'Simon, son of Jonah, do you love me?' ... He said to him, 'Lord, you know everything. You know that I love you.' Jesus said to him, 'Feed my sheep.'" },
        ],
        timeline: [
            { event: "Called to follow Jesus", ref: "Luke 5:1-11" },
            { event: "Walks on water", ref: "Matthew 14:25-33" },
            { event: "Confesses Jesus as Christ", ref: "Matthew 16:13-20" },
            { event: "Denies Jesus three times", ref: "Luke 22:54-62" },
            { event: "Pentecost sermon — 3000 saved", ref: "Acts 2:14-41" },
        ]
    },
    {
        id: "mary",
        name: "Mary",
        title: "Mother of Jesus",
        icon: "💙",
        era: "Gospels (~20 BC - ~48 AD)",
        summary: "A young woman from Nazareth chosen to bear the Son of God. Mary's faith and humility in accepting God's extraordinary plan set the stage for the incarnation.",
        keyTraits: ["Faith", "Humility", "Obedience", "Devotion"],
        keyVerses: [
            { ref: "Luke 1:38", bookSlug: "luke", chapter: 1, verse: 38, text: "Mary said, 'See, the handmaid of the Lord; let it be done to me according to your word.'" },
            { ref: "Luke 1:46-47", bookSlug: "luke", chapter: 1, verse: 46, text: "Mary said, 'My soul magnifies the Lord. My spirit has rejoiced in God my Saviour.'" },
        ],
        timeline: [
            { event: "Annunciation by Gabriel", ref: "Luke 1:26-38" },
            { event: "Visits Elizabeth — the Magnificat", ref: "Luke 1:39-56" },
            { event: "Birth of Jesus in Bethlehem", ref: "Luke 2:1-20" },
            { event: "Presentation at the Temple", ref: "Luke 2:22-40" },
            { event: "At the cross and the upper room", ref: "John 19:25-27, Acts 1:14" },
        ]
    },
    {
        id: "joseph-ot",
        name: "Joseph",
        title: "The Dreamer",
        icon: "🌈",
        era: "Patriarchs (~1900 BC)",
        summary: "Sold into slavery by his brothers, Joseph rose from prisoner to prime minister of Egypt. His story is the Bible's greatest narrative of forgiveness, providence, and redemption from suffering.",
        keyTraits: ["Integrity", "Forgiveness", "Wisdom", "Patience"],
        keyVerses: [
            { ref: "Genesis 50:20", bookSlug: "genesis", chapter: 50, verse: 20, text: "As for you, you meant evil against me, but God meant it for good, to save many people alive, as is happening today." },
        ],
        timeline: [
            { event: "Receives coat of many colours", ref: "Genesis 37:1-11" },
            { event: "Sold into slavery by brothers", ref: "Genesis 37:12-36" },
            { event: "Resists Potiphar's wife, imprisoned", ref: "Genesis 39:1-23" },
            { event: "Interprets Pharaoh's dreams", ref: "Genesis 41:1-40" },
            { event: "Reconciles with brothers", ref: "Genesis 45:1-15" },
        ]
    },
    {
        id: "daniel",
        name: "Daniel",
        title: "Prophet in Exile",
        icon: "🦁",
        era: "Babylonian Exile (~620-536 BC)",
        summary: "Taken captive as a youth to Babylon, Daniel served four kings while maintaining unwavering faithfulness to God. His visions revealed God's sovereign plan for the ages.",
        keyTraits: ["Faithfulness", "Wisdom", "Prayer", "Courage"],
        keyVerses: [
            { ref: "Daniel 6:10", bookSlug: "daniel", chapter: 6, verse: 10, text: "When Daniel knew that the writing was signed, he went into his house and prayed and gave thanks before his God, as he did before." },
        ],
        timeline: [
            { event: "Refuses the king's food", ref: "Daniel 1:8-16" },
            { event: "Interprets Nebuchadnezzar's dream", ref: "Daniel 2:1-49" },
            { event: "Friends in the fiery furnace", ref: "Daniel 3:1-30" },
            { event: "Thrown into the lions' den", ref: "Daniel 6:1-28" },
            { event: "Vision of the Son of Man", ref: "Daniel 7:13-14" },
        ]
    },
    {
        id: "nehemiah",
        name: "Nehemiah",
        title: "The Rebuilder",
        icon: "🧱",
        era: "Post-Exile (~445 BC)",
        summary: "A cupbearer to the Persian king who received permission to rebuild Jerusalem's walls. Nehemiah's leadership combined practical action with persistent prayer in the face of fierce opposition.",
        keyTraits: ["Prayer", "Leadership", "Determination", "Organization"],
        keyVerses: [
            { ref: "Nehemiah 2:20", bookSlug: "nehemiah", chapter: 2, verse: 20, text: "Then I answered them, and said to them, 'The God of heaven will prosper us. Therefore we, his servants, will arise and build.'" },
        ],
        timeline: [
            { event: "Weeps and prays for Jerusalem", ref: "Nehemiah 1:1-11" },
            { event: "Requests permission from Artaxerxes", ref: "Nehemiah 2:1-8" },
            { event: "Inspects the walls", ref: "Nehemiah 2:11-20" },
            { event: "Builds despite opposition", ref: "Nehemiah 4:1-23" },
            { event: "Wall completed in 52 days", ref: "Nehemiah 6:15-16" },
        ]
    },
];
