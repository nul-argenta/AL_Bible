export interface QuizQuestion {
    id: string;
    bookSlug: string;
    question: string;
    options: string[];
    correctIndex: number;
}

/**
 * ~5 multiple-choice revision questions per Bible book.
 * Focused on key events, characters, and theological themes
 * to ensure the reader understood the main points.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
    // ─── GENESIS ─────────────────────────────────────────────
    { id: "gen-1", bookSlug: "genesis", question: "How many days did God take to create the world?", options: ["5", "6", "7", "8"], correctIndex: 1 },
    { id: "gen-2", bookSlug: "genesis", question: "What was the forbidden tree in the Garden of Eden?", options: ["Tree of Wisdom", "Tree of Knowledge of Good and Evil", "Tree of Eternal Life", "Tree of Moses"], correctIndex: 1 },
    { id: "gen-3", bookSlug: "genesis", question: "Who built an ark to survive the great flood?", options: ["Abraham", "Noah", "Moses", "Adam"], correctIndex: 1 },
    { id: "gen-4", bookSlug: "genesis", question: "Which of Joseph's brothers suggested selling him?", options: ["Reuben", "Simeon", "Judah", "Levi"], correctIndex: 2 },
    { id: "gen-5", bookSlug: "genesis", question: "What sign did God give as a covenant after the flood?", options: ["A star", "A rainbow", "A dove", "Fire from heaven"], correctIndex: 1 },

    // ─── EXODUS ─────────────────────────────────────────────
    { id: "exo-1", bookSlug: "exodus", question: "Who led the Israelites out of Egypt?", options: ["Aaron", "Joshua", "Moses", "Abraham"], correctIndex: 2 },
    { id: "exo-2", bookSlug: "exodus", question: "How many plagues did God send upon Egypt?", options: ["7", "10", "12", "5"], correctIndex: 1 },
    { id: "exo-3", bookSlug: "exodus", question: "What sea did God part for the Israelites?", options: ["Mediterranean Sea", "Dead Sea", "Red Sea", "Sea of Galilee"], correctIndex: 2 },
    { id: "exo-4", bookSlug: "exodus", question: "On which mountain did Moses receive the Ten Commandments?", options: ["Mount Carmel", "Mount Sinai", "Mount Zion", "Mount Ararat"], correctIndex: 1 },
    { id: "exo-5", bookSlug: "exodus", question: "What did the Israelites worship while Moses was on the mountain?", options: ["A bronze serpent", "A golden calf", "A silver eagle", "A stone altar"], correctIndex: 1 },

    // ─── LEVITICUS ──────────────────────────────────────────
    { id: "lev-1", bookSlug: "leviticus", question: "What is the main topic of Leviticus?", options: ["War strategies", "Laws and sacrifices", "Poetry and songs", "Travel accounts"], correctIndex: 1 },
    { id: "lev-2", bookSlug: "leviticus", question: "Which tribe was set apart for priestly duties?", options: ["Judah", "Benjamin", "Levi", "Dan"], correctIndex: 2 },
    { id: "lev-3", bookSlug: "leviticus", question: "What yearly event involved the scapegoat?", options: ["Passover", "Day of Atonement", "Feast of Tabernacles", "Pentecost"], correctIndex: 1 },
    { id: "lev-4", bookSlug: "leviticus", question: "'Love your neighbour as yourself' first appears in which book?", options: ["Deuteronomy", "Exodus", "Leviticus", "Numbers"], correctIndex: 2 },
    { id: "lev-5", bookSlug: "leviticus", question: "What year was designated for releasing debts and slaves?", options: ["Sabbath Year", "Jubilee Year", "Year of the Lord", "Passover Year"], correctIndex: 1 },

    // ─── NUMBERS ────────────────────────────────────────────
    { id: "num-1", bookSlug: "numbers", question: "Why is this book called 'Numbers'?", options: ["It contains numerology", "It records two censuses of Israel", "It has numbered laws", "It counts the plagues"], correctIndex: 1 },
    { id: "num-2", bookSlug: "numbers", question: "How many spies were sent to scout Canaan?", options: ["7", "10", "12", "24"], correctIndex: 2 },
    { id: "num-3", bookSlug: "numbers", question: "Which two spies gave a positive report about Canaan?", options: ["Moses and Aaron", "Joshua and Caleb", "Reuben and Gad", "Eleazar and Ithamar"], correctIndex: 1 },
    { id: "num-4", bookSlug: "numbers", question: "How many years did Israel wander in the wilderness?", options: ["20", "30", "40", "50"], correctIndex: 2 },
    { id: "num-5", bookSlug: "numbers", question: "What animal spoke to its master in Numbers?", options: ["A serpent", "A donkey", "A dove", "A ram"], correctIndex: 1 },

    // ─── DEUTERONOMY ────────────────────────────────────────
    { id: "deu-1", bookSlug: "deuteronomy", question: "What does 'Deuteronomy' mean?", options: ["New law", "Second law", "God's command", "Final word"], correctIndex: 1 },
    { id: "deu-2", bookSlug: "deuteronomy", question: "Who gave the speeches recorded in Deuteronomy?", options: ["Joshua", "Aaron", "Moses", "Samuel"], correctIndex: 2 },
    { id: "deu-3", bookSlug: "deuteronomy", question: "The 'Shema' begins with which famous declaration?", options: ["In the beginning, God", "Hear, O Israel", "The Lord is my shepherd", "Fear not"], correctIndex: 1 },
    { id: "deu-4", bookSlug: "deuteronomy", question: "Where did Moses die?", options: ["In Egypt", "At Mount Sinai", "On Mount Nebo", "In the Promised Land"], correctIndex: 2 },
    { id: "deu-5", bookSlug: "deuteronomy", question: "Who succeeded Moses as leader of Israel?", options: ["Aaron", "Caleb", "Joshua", "Eleazar"], correctIndex: 2 },

    // ─── JOSHUA ─────────────────────────────────────────────
    { id: "jos-1", bookSlug: "joshua", question: "What city's walls fell after the Israelites marched around it?", options: ["Jerusalem", "Jericho", "Ai", "Bethel"], correctIndex: 1 },
    { id: "jos-2", bookSlug: "joshua", question: "Who hid the Israelite spies in Jericho?", options: ["Deborah", "Rahab", "Ruth", "Esther"], correctIndex: 1 },
    { id: "jos-3", bookSlug: "joshua", question: "Which river did Israel cross to enter the Promised Land?", options: ["Nile", "Euphrates", "Jordan", "Tigris"], correctIndex: 2 },
    { id: "jos-4", bookSlug: "joshua", question: "How many days did Israel march around Jericho?", options: ["3", "5", "7", "12"], correctIndex: 2 },
    { id: "jos-5", bookSlug: "joshua", question: "Joshua said, 'As for me and my house, we will serve the...'", options: ["King", "Lord", "Law", "Temple"], correctIndex: 1 },

    // ─── JUDGES ─────────────────────────────────────────────
    { id: "jdg-1", bookSlug: "judges", question: "What was the source of Samson's strength?", options: ["His armor", "His long hair", "A special ring", "A sword"], correctIndex: 1 },
    { id: "jdg-2", bookSlug: "judges", question: "Who was the female judge of Israel?", options: ["Ruth", "Esther", "Deborah", "Miriam"], correctIndex: 2 },
    { id: "jdg-3", bookSlug: "judges", question: "Gideon defeated the Midianites with how many men?", options: ["100", "300", "1,000", "10,000"], correctIndex: 1 },
    { id: "jdg-4", bookSlug: "judges", question: "What recurring phrase describes Israel's behaviour in Judges?", options: ["The Lord blessed them", "Everyone did what was right in their own eyes", "They kept the law faithfully", "God abandoned them"], correctIndex: 1 },
    { id: "jdg-5", bookSlug: "judges", question: "Who betrayed Samson to the Philistines?", options: ["Jezebel", "Delilah", "Rahab", "Bathsheba"], correctIndex: 1 },

    // ─── RUTH ───────────────────────────────────────────────
    { id: "rut-1", bookSlug: "ruth", question: "Where was Ruth originally from?", options: ["Israel", "Egypt", "Moab", "Philistia"], correctIndex: 2 },
    { id: "rut-2", bookSlug: "ruth", question: "Who was Ruth's mother-in-law?", options: ["Naomi", "Orpah", "Deborah", "Hannah"], correctIndex: 0 },
    { id: "rut-3", bookSlug: "ruth", question: "Who did Ruth marry after coming to Bethlehem?", options: ["Elimelech", "Boaz", "Jesse", "Obed"], correctIndex: 1 },
    { id: "rut-4", bookSlug: "ruth", question: "Ruth said, 'Where you go, I will go; your God shall be my...'", options: ["King", "Lord", "God", "Guide"], correctIndex: 2 },
    { id: "rut-5", bookSlug: "ruth", question: "Ruth was the great-grandmother of which king?", options: ["Saul", "David", "Solomon", "Hezekiah"], correctIndex: 1 },

    // ─── 1 SAMUEL ───────────────────────────────────────────
    { id: "1sa-1", bookSlug: "1-samuel", question: "Who was the last judge and first major prophet of Israel?", options: ["Eli", "Samuel", "Nathan", "Elijah"], correctIndex: 1 },
    { id: "1sa-2", bookSlug: "1-samuel", question: "Who was Israel's first king?", options: ["David", "Saul", "Solomon", "Jeroboam"], correctIndex: 1 },
    { id: "1sa-3", bookSlug: "1-samuel", question: "What giant did David defeat?", options: ["Og", "Goliath", "Lahmi", "Ishbi-benob"], correctIndex: 1 },
    { id: "1sa-4", bookSlug: "1-samuel", question: "What weapon did David use against Goliath?", options: ["A sword", "A bow", "A sling and stone", "A spear"], correctIndex: 2 },
    { id: "1sa-5", bookSlug: "1-samuel", question: "Who was David's closest friend?", options: ["Absalom", "Jonathan", "Nathan", "Joab"], correctIndex: 1 },

    // ─── 2 SAMUEL ───────────────────────────────────────────
    { id: "2sa-1", bookSlug: "2-samuel", question: "Where did David first reign as king?", options: ["Jerusalem", "Hebron", "Bethlehem", "Shiloh"], correctIndex: 1 },
    { id: "2sa-2", bookSlug: "2-samuel", question: "What city did David establish as Israel's capital?", options: ["Hebron", "Bethel", "Jerusalem", "Shechem"], correctIndex: 2 },
    { id: "2sa-3", bookSlug: "2-samuel", question: "Which prophet confronted David about Bathsheba?", options: ["Samuel", "Elijah", "Nathan", "Gad"], correctIndex: 2 },
    { id: "2sa-4", bookSlug: "2-samuel", question: "Which of David's sons led a rebellion against him?", options: ["Solomon", "Amnon", "Absalom", "Adonijah"], correctIndex: 2 },
    { id: "2sa-5", bookSlug: "2-samuel", question: "God promised David that his throne would last...", options: ["100 years", "Until the exile", "Forever", "Until Solomon"], correctIndex: 2 },

    // ─── 1 KINGS ────────────────────────────────────────────
    { id: "1ki-1", bookSlug: "1-kings", question: "What did Solomon ask God for?", options: ["Wealth", "Long life", "Wisdom", "Victory"], correctIndex: 2 },
    { id: "1ki-2", bookSlug: "1-kings", question: "What major structure did Solomon build?", options: ["The Tabernacle", "The Temple", "The Ark", "The Wall"], correctIndex: 1 },
    { id: "1ki-3", bookSlug: "1-kings", question: "After Solomon, what happened to Israel?", options: ["It grew stronger", "It was conquered", "It split into two kingdoms", "It became a republic"], correctIndex: 2 },
    { id: "1ki-4", bookSlug: "1-kings", question: "Which prophet challenged the prophets of Baal on Mount Carmel?", options: ["Elisha", "Isaiah", "Elijah", "Jeremiah"], correctIndex: 2 },
    { id: "1ki-5", bookSlug: "1-kings", question: "Who was the wicked queen married to King Ahab?", options: ["Athaliah", "Jezebel", "Vashti", "Michal"], correctIndex: 1 },

    // ─── 2 KINGS ────────────────────────────────────────────
    { id: "2ki-1", bookSlug: "2-kings", question: "How did Elijah leave earth?", options: ["He died peacefully", "In a chariot of fire", "He was exiled", "In a boat"], correctIndex: 1 },
    { id: "2ki-2", bookSlug: "2-kings", question: "Who succeeded Elijah as prophet?", options: ["Isaiah", "Elisha", "Jeremiah", "Amos"], correctIndex: 1 },
    { id: "2ki-3", bookSlug: "2-kings", question: "Which empire conquered the northern kingdom of Israel?", options: ["Babylon", "Egypt", "Assyria", "Persia"], correctIndex: 2 },
    { id: "2ki-4", bookSlug: "2-kings", question: "Which empire conquered the southern kingdom of Judah?", options: ["Assyria", "Babylon", "Persia", "Greece"], correctIndex: 1 },
    { id: "2ki-5", bookSlug: "2-kings", question: "Naaman was healed of what disease by washing in the Jordan?", options: ["Blindness", "Leprosy", "Lameness", "Deafness"], correctIndex: 1 },

    // ─── 1 CHRONICLES ───────────────────────────────────────
    { id: "1ch-1", bookSlug: "1-chronicles", question: "1 Chronicles begins with extensive...", options: ["Laws", "Prophecies", "Genealogies", "Psalms"], correctIndex: 2 },
    { id: "1ch-2", bookSlug: "1-chronicles", question: "Which king is the central figure of 1 Chronicles?", options: ["Solomon", "Saul", "David", "Hezekiah"], correctIndex: 2 },
    { id: "1ch-3", bookSlug: "1-chronicles", question: "David wanted to build the Temple but was told to wait because he was a...", options: ["Shepherd", "Man of war", "Sinner", "Foreigner"], correctIndex: 1 },

    // ─── 2 CHRONICLES ───────────────────────────────────────
    { id: "2ch-1", bookSlug: "2-chronicles", question: "2 Chronicles begins with the reign of which king?", options: ["David", "Rehoboam", "Solomon", "Hezekiah"], correctIndex: 2 },
    { id: "2ch-2", bookSlug: "2-chronicles", question: "Which king led a great spiritual revival in Judah?", options: ["Manasseh", "Josiah", "Ahaz", "Zedekiah"], correctIndex: 1 },
    { id: "2ch-3", bookSlug: "2-chronicles", question: "2 Chronicles ends with which empire's decree to rebuild the Temple?", options: ["Babylon", "Assyria", "Persia", "Greece"], correctIndex: 2 },

    // ─── EZRA ───────────────────────────────────────────────
    { id: "ezr-1", bookSlug: "ezra", question: "Ezra records the return from exile in which empire?", options: ["Assyria", "Egypt", "Babylon", "Greece"], correctIndex: 2 },
    { id: "ezr-2", bookSlug: "ezra", question: "What was the primary project after returning from exile?", options: ["Building a palace", "Rebuilding the Temple", "Conquering enemies", "Writing new laws"], correctIndex: 1 },
    { id: "ezr-3", bookSlug: "ezra", question: "Ezra was primarily a...", options: ["King", "General", "Priest and scribe", "Farmer"], correctIndex: 2 },

    // ─── NEHEMIAH ────────────────────────────────────────────
    { id: "neh-1", bookSlug: "nehemiah", question: "What did Nehemiah rebuild?", options: ["The Temple", "The walls of Jerusalem", "The Tabernacle", "Solomon's palace"], correctIndex: 1 },
    { id: "neh-2", bookSlug: "nehemiah", question: "What was Nehemiah's job before returning to Jerusalem?", options: ["A priest", "A prophet", "Cupbearer to the king", "A scribe"], correctIndex: 2 },
    { id: "neh-3", bookSlug: "nehemiah", question: "How quickly were the walls rebuilt?", options: ["52 days", "6 months", "1 year", "7 years"], correctIndex: 0 },

    // ─── ESTHER ─────────────────────────────────────────────
    { id: "est-1", bookSlug: "esther", question: "In which empire does the story of Esther take place?", options: ["Babylon", "Persia", "Egypt", "Rome"], correctIndex: 1 },
    { id: "est-2", bookSlug: "esther", question: "Who plotted to destroy all the Jews?", options: ["Xerxes", "Haman", "Mordecai", "Vashti"], correctIndex: 1 },
    { id: "est-3", bookSlug: "esther", question: "Mordecai told Esther she was raised up 'for such a time as...'", options: ["This", "War", "Peace", "The end"], correctIndex: 0 },
    { id: "est-4", bookSlug: "esther", question: "Which Jewish holiday celebrates the events of Esther?", options: ["Hanukkah", "Purim", "Passover", "Yom Kippur"], correctIndex: 1 },

    // ─── JOB ────────────────────────────────────────────────
    { id: "job-1", bookSlug: "job", question: "What was Job known for at the start of the book?", options: ["His wealth and righteousness", "His military prowess", "His prophetic gifts", "His political power"], correctIndex: 0 },
    { id: "job-2", bookSlug: "job", question: "Who challenged God about Job's faithfulness?", options: ["An angel", "Satan", "Job's wife", "A prophet"], correctIndex: 1 },
    { id: "job-3", bookSlug: "job", question: "How many friends came to counsel Job?", options: ["2", "3", "4", "7"], correctIndex: 1 },
    { id: "job-4", bookSlug: "job", question: "How does God answer Job's questions?", options: ["With a written message", "Through a prophet", "By speaking from a whirlwind", "In a dream"], correctIndex: 2 },
    { id: "job-5", bookSlug: "job", question: "What happened to Job at the end of the book?", options: ["He died in poverty", "God restored double what he lost", "He became a priest", "He left Israel"], correctIndex: 1 },

    // ─── PSALMS ─────────────────────────────────────────────
    { id: "psa-1", bookSlug: "psalms", question: "Who wrote the majority of the Psalms?", options: ["Moses", "Solomon", "David", "Asaph"], correctIndex: 2 },
    { id: "psa-2", bookSlug: "psalms", question: "Psalm 23 begins with 'The Lord is my...'", options: ["Rock", "Shepherd", "Shield", "Refuge"], correctIndex: 1 },
    { id: "psa-3", bookSlug: "psalms", question: "How many psalms are in the Book of Psalms?", options: ["100", "119", "150", "200"], correctIndex: 2 },
    { id: "psa-4", bookSlug: "psalms", question: "Which psalm is the longest chapter in the Bible?", options: ["Psalm 23", "Psalm 51", "Psalm 100", "Psalm 119"], correctIndex: 3 },
    { id: "psa-5", bookSlug: "psalms", question: "What is a common term for the Psalms?", options: ["Proverbs", "Hymnal of Israel", "The Law", "The Prophecies"], correctIndex: 1 },

    // ─── PROVERBS ────────────────────────────────────────────
    { id: "pro-1", bookSlug: "proverbs", question: "Who is traditionally credited with most of Proverbs?", options: ["David", "Moses", "Solomon", "Samuel"], correctIndex: 2 },
    { id: "pro-2", bookSlug: "proverbs", question: "'The fear of the Lord is the beginning of...'", options: ["Love", "Power", "Knowledge", "Faith"], correctIndex: 2 },
    { id: "pro-3", bookSlug: "proverbs", question: "Proverbs 31 describes what?", options: ["A wise king", "A virtuous woman", "A strong warrior", "A faithful priest"], correctIndex: 1 },
    { id: "pro-4", bookSlug: "proverbs", question: "'Trust in the Lord with all your heart and lean not on your own...'", options: ["Strength", "Understanding", "Wisdom", "Will"], correctIndex: 1 },

    // ─── ECCLESIASTES ────────────────────────────────────────
    { id: "ecc-1", bookSlug: "ecclesiastes", question: "What famous phrase opens Ecclesiastes?", options: ["In the beginning", "Vanity of vanities", "Blessed is the man", "The Lord reigns"], correctIndex: 1 },
    { id: "ecc-2", bookSlug: "ecclesiastes", question: "'For everything there is a season, and a time for every...'", options: ["Purpose under heaven", "Deed under the sun", "Matter under heaven", "Work under God"], correctIndex: 2 },
    { id: "ecc-3", bookSlug: "ecclesiastes", question: "The conclusion of Ecclesiastes is to...", options: ["Enjoy life fully", "Fear God and keep His commandments", "Seek wealth", "Avoid suffering"], correctIndex: 1 },

    // ─── SONG OF SOLOMON ────────────────────────────────────
    { id: "sos-1", bookSlug: "song-of-solomon", question: "What is the main theme of Song of Solomon?", options: ["War", "Prophecy", "Romantic love", "Worship"], correctIndex: 2 },
    { id: "sos-2", bookSlug: "song-of-solomon", question: "Who is traditionally credited as the author?", options: ["David", "Solomon", "Moses", "Isaiah"], correctIndex: 1 },
    { id: "sos-3", bookSlug: "song-of-solomon", question: "The book is also known as...", options: ["Canticles", "Lamentations", "Odes", "Hymns"], correctIndex: 0 },

    // ─── ISAIAH ─────────────────────────────────────────────
    { id: "isa-1", bookSlug: "isaiah", question: "Isaiah is often called the '_______ Prophet'.", options: ["Major", "Evangelical", "Suffering", "Royal"], correctIndex: 1 },
    { id: "isa-2", bookSlug: "isaiah", question: "Isaiah 53 describes what figure?", options: ["A conquering king", "The Suffering Servant", "A mighty warrior", "A high priest"], correctIndex: 1 },
    { id: "isa-3", bookSlug: "isaiah", question: "Isaiah prophesied about a child called...", options: ["Son of David", "Wonderful Counselor", "The Messiah", "Light of Israel"], correctIndex: 1 },
    { id: "isa-4", bookSlug: "isaiah", question: "'For unto us a child is born' is found in which chapter?", options: ["Isaiah 1", "Isaiah 7", "Isaiah 9", "Isaiah 53"], correctIndex: 2 },
    { id: "isa-5", bookSlug: "isaiah", question: "Isaiah had a vision of God in the Temple in chapter...", options: ["1", "6", "40", "53"], correctIndex: 1 },

    // ─── JEREMIAH ────────────────────────────────────────────
    { id: "jer-1", bookSlug: "jeremiah", question: "Jeremiah is known as the...", options: ["Joyful Prophet", "Weeping Prophet", "Royal Prophet", "Silent Prophet"], correctIndex: 1 },
    { id: "jer-2", bookSlug: "jeremiah", question: "God told Jeremiah He knew him before he was...", options: ["Called", "Born", "Formed in the womb", "A prophet"], correctIndex: 2 },
    { id: "jer-3", bookSlug: "jeremiah", question: "Jeremiah prophesied the exile would last how many years?", options: ["40", "50", "70", "100"], correctIndex: 2 },
    { id: "jer-4", bookSlug: "jeremiah", question: "'For I know the plans I have for you' is found in Jeremiah...", options: ["1:5", "17:9", "29:11", "31:33"], correctIndex: 2 },

    // ─── LAMENTATIONS ────────────────────────────────────────
    { id: "lam-1", bookSlug: "lamentations", question: "Who is traditionally credited with writing Lamentations?", options: ["Isaiah", "Ezekiel", "Jeremiah", "Daniel"], correctIndex: 2 },
    { id: "lam-2", bookSlug: "lamentations", question: "Lamentations mourns the destruction of...", options: ["Samaria", "Jerusalem", "Babylon", "Egypt"], correctIndex: 1 },
    { id: "lam-3", bookSlug: "lamentations", question: "'Great is thy faithfulness' is found in which book?", options: ["Psalms", "Isaiah", "Lamentations", "Proverbs"], correctIndex: 2 },

    // ─── EZEKIEL ─────────────────────────────────────────────
    { id: "eze-1", bookSlug: "ezekiel", question: "Ezekiel had a famous vision of a valley of...", options: ["Flowers", "Dry bones", "Water", "Gold"], correctIndex: 1 },
    { id: "eze-2", bookSlug: "ezekiel", question: "Where was Ezekiel when he prophesied?", options: ["Jerusalem", "Egypt", "Babylon (exile)", "Samaria"], correctIndex: 2 },
    { id: "eze-3", bookSlug: "ezekiel", question: "Ezekiel's opening vision describes four living...", options: ["Trees", "Creatures", "Rivers", "Mountains"], correctIndex: 1 },

    // ─── DANIEL ─────────────────────────────────────────────
    { id: "dan-1", bookSlug: "daniel", question: "Daniel's three friends were thrown into a...", options: ["Lion's den", "Fiery furnace", "Dungeon", "River"], correctIndex: 1 },
    { id: "dan-2", bookSlug: "daniel", question: "Daniel was thrown into a den of...", options: ["Bears", "Snakes", "Lions", "Wolves"], correctIndex: 2 },
    { id: "dan-3", bookSlug: "daniel", question: "King Nebuchadnezzar's dream featured a statue made of...", options: ["Pure gold", "Multiple metals", "Iron only", "Wood and stone"], correctIndex: 1 },
    { id: "dan-4", bookSlug: "daniel", question: "The writing on the wall appeared during a feast of King...", options: ["Nebuchadnezzar", "Darius", "Belshazzar", "Cyrus"], correctIndex: 2 },

    // ─── HOSEA ───────────────────────────────────────────────
    { id: "hos-1", bookSlug: "hosea", question: "God told Hosea to marry an unfaithful wife to symbolise...", options: ["God's patience", "Israel's unfaithfulness", "Human love", "A new covenant"], correctIndex: 1 },
    { id: "hos-2", bookSlug: "hosea", question: "What is the main theme of Hosea?", options: ["Judgement", "God's faithful love despite betrayal", "Military conquest", "Temple worship"], correctIndex: 1 },
    { id: "hos-3", bookSlug: "hosea", question: "What was Hosea's wife's name?", options: ["Rahab", "Gomer", "Ruth", "Esther"], correctIndex: 1 },

    // ─── JOEL ────────────────────────────────────────────────
    { id: "joe-1", bookSlug: "joel", question: "Joel describes a devastating plague of...", options: ["Frogs", "Locusts", "Hail", "Darkness"], correctIndex: 1 },
    { id: "joe-2", bookSlug: "joel", question: "Joel prophesied God would pour out His...", options: ["Wrath", "Spirit", "Law", "Army"], correctIndex: 1 },

    // ─── AMOS ────────────────────────────────────────────────
    { id: "amo-1", bookSlug: "amos", question: "Amos's profession before being a prophet was a...", options: ["Priest", "Shepherd/farmer", "Scribe", "Carpenter"], correctIndex: 1 },
    { id: "amo-2", bookSlug: "amos", question: "Amos primarily preached against social...", options: ["Progress", "Justice and oppression of the poor", "Celebration", "Education"], correctIndex: 1 },

    // ─── OBADIAH ─────────────────────────────────────────────
    { id: "oba-1", bookSlug: "obadiah", question: "Obadiah, the shortest OT book, prophesies against...", options: ["Israel", "Edom", "Egypt", "Babylon"], correctIndex: 1 },
    { id: "oba-2", bookSlug: "obadiah", question: "Edom was descended from which biblical figure?", options: ["Jacob", "Ishmael", "Esau", "Lot"], correctIndex: 2 },

    // ─── JONAH ───────────────────────────────────────────────
    { id: "jon-1", bookSlug: "jonah", question: "God told Jonah to preach to which city?", options: ["Jerusalem", "Nineveh", "Babylon", "Tyre"], correctIndex: 1 },
    { id: "jon-2", bookSlug: "jonah", question: "What happened when Jonah fled from God?", options: ["He was arrested", "A great fish swallowed him", "He was struck blind", "He found peace"], correctIndex: 1 },
    { id: "jon-3", bookSlug: "jonah", question: "When Nineveh repented, Jonah was...", options: ["Happy", "Angry", "Surprised", "Silent"], correctIndex: 1 },

    // ─── MICAH ───────────────────────────────────────────────
    { id: "mic-1", bookSlug: "micah", question: "Micah prophesied the Messiah would be born in...", options: ["Jerusalem", "Nazareth", "Bethlehem", "Capernaum"], correctIndex: 2 },
    { id: "mic-2", bookSlug: "micah", question: "'What does the Lord require? To act justly, love mercy, and walk...'", options: ["In power", "Humbly with your God", "In righteousness", "In faith"], correctIndex: 1 },

    // ─── NAHUM ───────────────────────────────────────────────
    { id: "nah-1", bookSlug: "nahum", question: "Nahum prophesies the destruction of...", options: ["Jerusalem", "Babylon", "Nineveh", "Samaria"], correctIndex: 2 },

    // ─── HABAKKUK ─────────────────────────────────────────────
    { id: "hab-1", bookSlug: "habakkuk", question: "'The righteous shall live by...'", options: ["Works", "Faith", "The law", "Sacrifice"], correctIndex: 1 },
    { id: "hab-2", bookSlug: "habakkuk", question: "Habakkuk questions God about...", options: ["Creation", "Why evil goes unpunished", "The afterlife", "The Temple"], correctIndex: 1 },

    // ─── ZEPHANIAH ────────────────────────────────────────────
    { id: "zep-1", bookSlug: "zephaniah", question: "Zephaniah warns about 'The Day of the...'", options: ["King", "Lord", "Prophet", "Messiah"], correctIndex: 1 },

    // ─── HAGGAI ──────────────────────────────────────────────
    { id: "hag-1", bookSlug: "haggai", question: "Haggai urged the people to rebuild the...", options: ["City walls", "Temple", "Palace", "Roads"], correctIndex: 1 },
    { id: "hag-2", bookSlug: "haggai", question: "The people had neglected God's house while building their own...", options: ["Armies", "Panelled houses", "Altars", "Farms"], correctIndex: 1 },

    // ─── ZECHARIAH ────────────────────────────────────────────
    { id: "zec-1", bookSlug: "zechariah", question: "Zechariah had visions including a man with a...", options: ["Sword", "Measuring line", "Scroll", "Crown"], correctIndex: 1 },
    { id: "zec-2", bookSlug: "zechariah", question: "Zechariah prophesied a king riding into Jerusalem on a...", options: ["Horse", "Chariot", "Donkey", "Camel"], correctIndex: 2 },

    // ─── MALACHI ──────────────────────────────────────────────
    { id: "mal-1", bookSlug: "malachi", question: "Malachi is the _______ book of the Old Testament.", options: ["First", "Middle", "Last", "Longest"], correctIndex: 2 },
    { id: "mal-2", bookSlug: "malachi", question: "Malachi rebuked the people for robbing God in...", options: ["Worship", "Tithes and offerings", "Sacrifices", "Prayer"], correctIndex: 1 },

    // ─── MATTHEW ─────────────────────────────────────────────
    { id: "mat-1", bookSlug: "matthew", question: "Matthew was originally a...", options: ["Fisherman", "Tax collector", "Carpenter", "Physician"], correctIndex: 1 },
    { id: "mat-2", bookSlug: "matthew", question: "The Sermon on the Mount is found in Matthew chapters...", options: ["1-3", "5-7", "10-12", "24-25"], correctIndex: 1 },
    { id: "mat-3", bookSlug: "matthew", question: "How many wise men visited Jesus? (according to tradition)", options: ["2", "3", "4", "The Bible doesn't specify a number"], correctIndex: 3 },
    { id: "mat-4", bookSlug: "matthew", question: "Matthew's genealogy traces Jesus back to...", options: ["Adam", "Noah", "Abraham", "Moses"], correctIndex: 2 },
    { id: "mat-5", bookSlug: "matthew", question: "The Great Commission is found at the end of which Gospel?", options: ["Mark", "Luke", "Matthew", "John"], correctIndex: 2 },

    // ─── MARK ────────────────────────────────────────────────
    { id: "mrk-1", bookSlug: "mark", question: "Mark is considered the _______ of the four Gospels.", options: ["Longest", "Shortest", "Most detailed", "Most poetic"], correctIndex: 1 },
    { id: "mrk-2", bookSlug: "mark", question: "Mark emphasises Jesus as a...", options: ["King", "Teacher", "Servant", "Priest"], correctIndex: 2 },
    { id: "mrk-3", bookSlug: "mark", question: "Mark's favorite word, used frequently, is...", options: ["Verily", "Immediately", "Behold", "Therefore"], correctIndex: 1 },
    { id: "mrk-4", bookSlug: "mark", question: "Who is traditionally considered the source behind Mark's Gospel?", options: ["Paul", "James", "Peter", "John"], correctIndex: 2 },

    // ─── LUKE ────────────────────────────────────────────────
    { id: "luk-1", bookSlug: "luke", question: "Luke was a...", options: ["Fisherman", "Tax collector", "Physician", "Rabbi"], correctIndex: 2 },
    { id: "luk-2", bookSlug: "luke", question: "The Parable of the Good Samaritan is unique to which Gospel?", options: ["Matthew", "Mark", "Luke", "John"], correctIndex: 2 },
    { id: "luk-3", bookSlug: "luke", question: "The Parable of the Prodigal Son is found in...", options: ["Matthew", "Mark", "Luke", "John"], correctIndex: 2 },
    { id: "luk-4", bookSlug: "luke", question: "Luke's genealogy traces Jesus back to...", options: ["Abraham", "David", "Moses", "Adam"], correctIndex: 3 },
    { id: "luk-5", bookSlug: "luke", question: "The birth narrative with shepherds is found in which Gospel?", options: ["Matthew", "Mark", "Luke", "John"], correctIndex: 2 },

    // ─── JOHN ────────────────────────────────────────────────
    { id: "jhn-1", bookSlug: "john", question: "John 3:16 says 'For God so loved the...'", options: ["Church", "World", "Nation", "Righteous"], correctIndex: 1 },
    { id: "jhn-2", bookSlug: "john", question: "How many 'I am' statements does Jesus make in John?", options: ["3", "5", "7", "12"], correctIndex: 2 },
    { id: "jhn-3", bookSlug: "john", question: "John's Gospel begins with 'In the beginning was the...'", options: ["Light", "Truth", "Word", "Way"], correctIndex: 2 },
    { id: "jhn-4", bookSlug: "john", question: "Which miracle is recorded only in John?", options: ["Feeding 5,000", "Walking on water", "Turning water into wine", "Calming the storm"], correctIndex: 2 },
    { id: "jhn-5", bookSlug: "john", question: "Who came to Jesus at night to ask questions?", options: ["Judas", "Nicodemus", "Pilate", "Thomas"], correctIndex: 1 },

    // ─── ACTS ────────────────────────────────────────────────
    { id: "act-1", bookSlug: "acts", question: "Who wrote the book of Acts?", options: ["Paul", "Peter", "Luke", "John"], correctIndex: 2 },
    { id: "act-2", bookSlug: "acts", question: "What happened at Pentecost?", options: ["Jesus ascended", "The Holy Spirit came", "The Temple was rebuilt", "Paul was converted"], correctIndex: 1 },
    { id: "act-3", bookSlug: "acts", question: "What was Saul's name changed to after conversion?", options: ["Peter", "Paul", "Barnabas", "Silas"], correctIndex: 1 },
    { id: "act-4", bookSlug: "acts", question: "Who was the first Christian martyr?", options: ["James", "Peter", "Stephen", "Paul"], correctIndex: 2 },
    { id: "act-5", bookSlug: "acts", question: "Where were believers first called 'Christians'?", options: ["Jerusalem", "Rome", "Antioch", "Corinth"], correctIndex: 2 },

    // ─── ROMANS ──────────────────────────────────────────────
    { id: "rom-1", bookSlug: "romans", question: "Who wrote the book of Romans?", options: ["Peter", "James", "Paul", "Luke"], correctIndex: 2 },
    { id: "rom-2", bookSlug: "romans", question: "'For all have sinned and fall short of the glory of...'", options: ["Heaven", "God", "Christ", "The Law"], correctIndex: 1 },
    { id: "rom-3", bookSlug: "romans", question: "Romans 8:28 says all things work together for good for those who...", options: ["Keep the law", "Love God", "Do works", "Pray daily"], correctIndex: 1 },
    { id: "rom-4", bookSlug: "romans", question: "'The wages of sin is death, but the gift of God is...'", options: ["Grace", "Wisdom", "Eternal life", "Peace"], correctIndex: 2 },

    // ─── 1 CORINTHIANS ───────────────────────────────────────
    { id: "1co-1", bookSlug: "1-corinthians", question: "1 Corinthians 13 is known as the '_______ chapter'.", options: ["Faith", "Hope", "Love", "Grace"], correctIndex: 2 },
    { id: "1co-2", bookSlug: "1-corinthians", question: "Paul compared the church to a...", options: ["Building", "Body", "Army", "Family"], correctIndex: 1 },
    { id: "1co-3", bookSlug: "1-corinthians", question: "Paul wrote to Corinth to address...", options: ["Persecution", "Division and immorality", "Tax collection", "Temple building"], correctIndex: 1 },

    // ─── 2 CORINTHIANS ───────────────────────────────────────
    { id: "2co-1", bookSlug: "2-corinthians", question: "'God loves a cheerful...'", options: ["Servant", "Worker", "Giver", "Singer"], correctIndex: 2 },
    { id: "2co-2", bookSlug: "2-corinthians", question: "Paul's 'thorn in the flesh' is mentioned in which book?", options: ["Romans", "Galatians", "2 Corinthians", "Philippians"], correctIndex: 2 },

    // ─── GALATIANS ───────────────────────────────────────────
    { id: "gal-1", bookSlug: "galatians", question: "Galatians emphasises salvation by faith, not by...", options: ["Grace", "Works of the law", "Prayer", "Sacrifice"], correctIndex: 1 },
    { id: "gal-2", bookSlug: "galatians", question: "The 'fruit of the Spirit' is listed in which book?", options: ["Romans", "Ephesians", "Galatians", "Colossians"], correctIndex: 2 },

    // ─── EPHESIANS ───────────────────────────────────────────
    { id: "eph-1", bookSlug: "ephesians", question: "The 'Armor of God' is described in which book?", options: ["Romans", "Ephesians", "Colossians", "1 Thessalonians"], correctIndex: 1 },
    { id: "eph-2", bookSlug: "ephesians", question: "'For by grace you have been saved through faith' is in...", options: ["Romans 3", "Ephesians 2", "Galatians 3", "Titus 3"], correctIndex: 1 },

    // ─── PHILIPPIANS ─────────────────────────────────────────
    { id: "phi-1", bookSlug: "philippians", question: "'I can do all things through Christ who...'", options: ["Loves me", "Saves me", "Strengthens me", "Guides me"], correctIndex: 2 },
    { id: "phi-2", bookSlug: "philippians", question: "Paul wrote Philippians from...", options: ["A ship", "The Temple", "Prison", "A synagogue"], correctIndex: 2 },

    // ─── COLOSSIANS ──────────────────────────────────────────
    { id: "col-1", bookSlug: "colossians", question: "Colossians emphasises the supremacy of...", options: ["The Law", "The Church", "Christ", "Angels"], correctIndex: 2 },
    { id: "col-2", bookSlug: "colossians", question: "'Whatever you do, work heartily, as for the...'", options: ["World", "Church", "Lord", "Family"], correctIndex: 2 },

    // ─── 1 THESSALONIANS ─────────────────────────────────────
    { id: "1th-1", bookSlug: "1-thessalonians", question: "1 Thessalonians contains teaching about Christ's...", options: ["Birth", "Miracles", "Second coming", "Baptism"], correctIndex: 2 },
    { id: "1th-2", bookSlug: "1-thessalonians", question: "'Pray without...'", options: ["Fear", "Ceasing", "Doubt", "Words"], correctIndex: 1 },

    // ─── 2 THESSALONIANS ─────────────────────────────────────
    { id: "2th-1", bookSlug: "2-thessalonians", question: "2 Thessalonians corrects misunderstandings about...", options: ["The Law", "The Second Coming", "Baptism", "Marriage"], correctIndex: 1 },

    // ─── 1 TIMOTHY ───────────────────────────────────────────
    { id: "1ti-1", bookSlug: "1-timothy", question: "Paul wrote to Timothy as a young...", options: ["King", "Scribe", "Pastor", "Prophet"], correctIndex: 2 },
    { id: "1ti-2", bookSlug: "1-timothy", question: "'For the love of money is the root of all...'", options: ["Sin", "Evil", "Corruption", "Greed"], correctIndex: 1 },

    // ─── 2 TIMOTHY ───────────────────────────────────────────
    { id: "2ti-1", bookSlug: "2-timothy", question: "'All Scripture is God-breathed' is found in...", options: ["Romans", "Hebrews", "2 Timothy", "2 Peter"], correctIndex: 2 },
    { id: "2ti-2", bookSlug: "2-timothy", question: "2 Timothy is believed to be Paul's...", options: ["First letter", "Last letter", "Longest letter", "Most famous letter"], correctIndex: 1 },

    // ─── TITUS ───────────────────────────────────────────────
    { id: "tit-1", bookSlug: "titus", question: "Titus was pastoring a church on the island of...", options: ["Cyprus", "Malta", "Crete", "Patmos"], correctIndex: 2 },

    // ─── PHILEMON ────────────────────────────────────────────
    { id: "phm-1", bookSlug: "philemon", question: "Paul wrote to Philemon about a runaway slave named...", options: ["Timothy", "Titus", "Onesimus", "Epaphras"], correctIndex: 2 },
    { id: "phm-2", bookSlug: "philemon", question: "Paul asked Philemon to receive Onesimus as a...", options: ["Servant", "Brother", "Worker", "Guest"], correctIndex: 1 },

    // ─── HEBREWS ─────────────────────────────────────────────
    { id: "heb-1", bookSlug: "hebrews", question: "Hebrews chapter 11 is often called the...", options: ["Love Chapter", "Faith Chapter", "Grace Chapter", "Hope Chapter"], correctIndex: 1 },
    { id: "heb-2", bookSlug: "hebrews", question: "Hebrews emphasises Jesus as superior to...", options: ["Moses and the angels", "David and Solomon", "Adam and Noah", "Peter and Paul"], correctIndex: 0 },
    { id: "heb-3", bookSlug: "hebrews", question: "Jesus is described as a priest in the order of...", options: ["Aaron", "Levi", "Melchizedek", "Zadok"], correctIndex: 2 },

    // ─── JAMES ───────────────────────────────────────────────
    { id: "jas-1", bookSlug: "james", question: "James says faith without works is...", options: ["Weak", "Dead", "Incomplete", "Blind"], correctIndex: 1 },
    { id: "jas-2", bookSlug: "james", question: "James compares the tongue to a small...", options: ["Sword", "Fire", "Rudder", "Both fire and rudder"], correctIndex: 3 },
    { id: "jas-3", bookSlug: "james", question: "'If any of you lacks wisdom, let him ask...'", options: ["The elders", "A teacher", "God", "The scriptures"], correctIndex: 2 },

    // ─── 1 PETER ─────────────────────────────────────────────
    { id: "1pe-1", bookSlug: "1-peter", question: "1 Peter was written to encourage Christians facing...", options: ["Prosperity", "Persecution", "Famine", "Peace"], correctIndex: 1 },
    { id: "1pe-2", bookSlug: "1-peter", question: "Peter calls believers a 'royal...'", options: ["Family", "Nation", "Priesthood", "Army"], correctIndex: 2 },

    // ─── 2 PETER ─────────────────────────────────────────────
    { id: "2pe-1", bookSlug: "2-peter", question: "2 Peter warns against...", options: ["Poverty", "False teachers", "Government", "Fasting"], correctIndex: 1 },
    { id: "2pe-2", bookSlug: "2-peter", question: "'With the Lord, a day is like a thousand years' is in...", options: ["Psalms", "Revelation", "2 Peter", "Hebrews"], correctIndex: 2 },

    // ─── 1 JOHN ──────────────────────────────────────────────
    { id: "1jn-1", bookSlug: "1-john", question: "'God is...'", options: ["Justice", "Power", "Love", "Wisdom"], correctIndex: 2 },
    { id: "1jn-2", bookSlug: "1-john", question: "1 John repeatedly emphasises the importance of...", options: ["Tithing", "Loving one another", "Fasting", "Temple worship"], correctIndex: 1 },

    // ─── 2 JOHN ──────────────────────────────────────────────
    { id: "2jn-1", bookSlug: "2-john", question: "2 John is addressed to...", options: ["A church leader", "The chosen lady and her children", "A king", "All believers"], correctIndex: 1 },

    // ─── 3 JOHN ──────────────────────────────────────────────
    { id: "3jn-1", bookSlug: "3-john", question: "3 John commends a man named...", options: ["Demetrius", "Diotrephes", "Gaius", "Timothy"], correctIndex: 2 },

    // ─── JUDE ────────────────────────────────────────────────
    { id: "jud-1", bookSlug: "jude", question: "Jude warns believers to 'contend for the...'", options: ["Kingdom", "Faith", "Church", "Truth"], correctIndex: 1 },

    // ─── REVELATION ──────────────────────────────────────────
    { id: "rev-1", bookSlug: "revelation", question: "Who wrote the book of Revelation?", options: ["Paul", "Peter", "John", "Luke"], correctIndex: 2 },
    { id: "rev-2", bookSlug: "revelation", question: "Revelation was written on the island of...", options: ["Crete", "Cyprus", "Malta", "Patmos"], correctIndex: 3 },
    { id: "rev-3", bookSlug: "revelation", question: "How many churches receive letters in Revelation?", options: ["3", "5", "7", "12"], correctIndex: 2 },
    { id: "rev-4", bookSlug: "revelation", question: "The number associated with the 'beast' is...", options: ["7", "12", "666", "144,000"], correctIndex: 2 },
    { id: "rev-5", bookSlug: "revelation", question: "Revelation ends with a vision of a new...", options: ["Temple", "Kingdom", "Heaven and earth", "Jerusalem only"], correctIndex: 2 },
];

/** Get all questions for a specific book */
export const getBookQuestions = (bookSlug: string): QuizQuestion[] =>
    QUIZ_QUESTIONS.filter(q => q.bookSlug === bookSlug);

/** Get all unique book slugs that have questions */
export const getBooksWithQuestions = (): string[] =>
    [...new Set(QUIZ_QUESTIONS.map(q => q.bookSlug))];
