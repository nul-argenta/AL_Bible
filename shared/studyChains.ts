/**
 * Topical Study Chains — Curated thematic journeys through Scripture
 */

export interface StudyChainPassage {
    bookSlug: string;
    chapter: number;
    verse: number;
    reference: string;       // "John 3:16"
    commentary: string;      // Short guiding note
}

export interface StudyChain {
    id: string;
    title: string;
    description: string;
    icon: string;  // emoji
    passages: StudyChainPassage[];
}

export const STUDY_CHAINS: StudyChain[] = [
    {
        id: "forgiveness",
        title: "The Path of Forgiveness",
        description: "Explore how God forgives and calls us to forgive others.",
        icon: "🕊️",
        passages: [
            { bookSlug: "psalms", chapter: 103, verse: 12, reference: "Psalm 103:12", commentary: "God removes our sins as far as east is from west — an infinite distance." },
            { bookSlug: "isaiah", chapter: 1, verse: 18, reference: "Isaiah 1:18", commentary: "An invitation: though your sins be as scarlet, they shall be white as snow." },
            { bookSlug: "matthew", chapter: 6, verse: 14, reference: "Matthew 6:14-15", commentary: "Jesus ties our forgiveness to our willingness to forgive others." },
            { bookSlug: "matthew", chapter: 18, verse: 21, reference: "Matthew 18:21-22", commentary: "Peter asks about limits; Jesus answers with boundless mercy." },
            { bookSlug: "luke", chapter: 23, verse: 34, reference: "Luke 23:34", commentary: "From the cross: 'Father, forgive them; for they know not what they do.'" },
            { bookSlug: "acts", chapter: 7, verse: 60, reference: "Acts 7:60", commentary: "Stephen echoes Christ's example as he is dying." },
            { bookSlug: "ephesians", chapter: 4, verse: 32, reference: "Ephesians 4:32", commentary: "Be kind, tenderhearted, forgiving — as God in Christ forgave you." },
            { bookSlug: "colossians", chapter: 3, verse: 13, reference: "Colossians 3:13", commentary: "Bearing with one another, forgiving as the Lord forgave you." },
            { bookSlug: "1-john", chapter: 1, verse: 9, reference: "1 John 1:9", commentary: "If we confess our sins, He is faithful and just to forgive us." },
        ]
    },
    {
        id: "faith",
        title: "Walking by Faith",
        description: "What it means to trust God when the path is unclear.",
        icon: "🔥",
        passages: [
            { bookSlug: "genesis", chapter: 15, verse: 6, reference: "Genesis 15:6", commentary: "Abraham believed God, and it was credited to him as righteousness." },
            { bookSlug: "hebrews", chapter: 11, verse: 1, reference: "Hebrews 11:1", commentary: "The definition: faith is the substance of things hoped for." },
            { bookSlug: "hebrews", chapter: 11, verse: 6, reference: "Hebrews 11:6", commentary: "Without faith it is impossible to please God." },
            { bookSlug: "romans", chapter: 10, verse: 17, reference: "Romans 10:17", commentary: "Faith comes by hearing, and hearing by the word of God." },
            { bookSlug: "mark", chapter: 11, verse: 22, reference: "Mark 11:22-24", commentary: "Have faith in God — even mountains can be moved." },
            { bookSlug: "james", chapter: 2, verse: 17, reference: "James 2:17", commentary: "Faith without works is dead — living faith produces action." },
            { bookSlug: "2-corinthians", chapter: 5, verse: 7, reference: "2 Corinthians 5:7", commentary: "We walk by faith, not by sight." },
            { bookSlug: "matthew", chapter: 17, verse: 20, reference: "Matthew 17:20", commentary: "Faith as small as a mustard seed can do the impossible." },
            { bookSlug: "habakkuk", chapter: 2, verse: 4, reference: "Habakkuk 2:4", commentary: "The just shall live by faith — quoted three times in the New Testament." },
            { bookSlug: "1-peter", chapter: 1, verse: 7, reference: "1 Peter 1:7", commentary: "Tested faith is more precious than gold." },
        ]
    },
    {
        id: "love",
        title: "The Love of God",
        description: "Discover the breadth, length, depth, and height of divine love.",
        icon: "❤️",
        passages: [
            { bookSlug: "john", chapter: 3, verse: 16, reference: "John 3:16", commentary: "The most famous verse — God so loved the world." },
            { bookSlug: "romans", chapter: 5, verse: 8, reference: "Romans 5:8", commentary: "While we were still sinners, Christ died for us." },
            { bookSlug: "1-corinthians", chapter: 13, verse: 4, reference: "1 Corinthians 13:4-7", commentary: "The definitive description of what love looks like in action." },
            { bookSlug: "1-john", chapter: 4, verse: 8, reference: "1 John 4:8", commentary: "God IS love — not just that He loves, but that love defines His nature." },
            { bookSlug: "1-john", chapter: 4, verse: 19, reference: "1 John 4:19", commentary: "We love because He first loved us." },
            { bookSlug: "ephesians", chapter: 3, verse: 17, reference: "Ephesians 3:17-19", commentary: "Paul prays we may comprehend the immeasurable dimensions of God's love." },
            { bookSlug: "romans", chapter: 8, verse: 38, reference: "Romans 8:38-39", commentary: "Nothing can separate us from the love of God in Christ Jesus." },
            { bookSlug: "song-of-solomon", chapter: 8, verse: 6, reference: "Song of Solomon 8:6-7", commentary: "Love is strong as death — many waters cannot quench it." },
            { bookSlug: "deuteronomy", chapter: 7, verse: 9, reference: "Deuteronomy 7:9", commentary: "The LORD keeps covenant and mercy with those who love Him." },
        ]
    },
    {
        id: "prayer",
        title: "The Power of Prayer",
        description: "Learn from Scripture's greatest prayers and promises about communication with God.",
        icon: "🙏",
        passages: [
            { bookSlug: "matthew", chapter: 6, verse: 9, reference: "Matthew 6:9-13", commentary: "The Lord's Prayer — Jesus teaches the disciples HOW to pray." },
            { bookSlug: "philippians", chapter: 4, verse: 6, reference: "Philippians 4:6-7", commentary: "Be anxious for nothing, but in everything by prayer..." },
            { bookSlug: "1-thessalonians", chapter: 5, verse: 17, reference: "1 Thessalonians 5:17", commentary: "Pray without ceasing — a lifestyle of communion." },
            { bookSlug: "james", chapter: 5, verse: 16, reference: "James 5:16", commentary: "The effectual fervent prayer of a righteous man avails much." },
            { bookSlug: "psalms", chapter: 46, verse: 10, reference: "Psalm 46:10", commentary: "Be still, and know that I am God." },
            { bookSlug: "jeremiah", chapter: 33, verse: 3, reference: "Jeremiah 33:3", commentary: "Call unto me, and I will answer thee." },
            { bookSlug: "john", chapter: 17, verse: 1, reference: "John 17:1-5", commentary: "Jesus' High Priestly Prayer — praying for Himself before the cross." },
            { bookSlug: "daniel", chapter: 6, verse: 10, reference: "Daniel 6:10", commentary: "Daniel prayed three times a day regardless of the consequences." },
            { bookSlug: "luke", chapter: 18, verse: 1, reference: "Luke 18:1", commentary: "The parable of the persistent widow — never give up praying." },
        ]
    },
    {
        id: "courage",
        title: "Courage in God",
        description: "Finding strength and boldness through trust in the Almighty.",
        icon: "🛡️",
        passages: [
            { bookSlug: "joshua", chapter: 1, verse: 9, reference: "Joshua 1:9", commentary: "Be strong and courageous — God is with you wherever you go." },
            { bookSlug: "deuteronomy", chapter: 31, verse: 6, reference: "Deuteronomy 31:6", commentary: "He will never leave you nor forsake you." },
            { bookSlug: "psalms", chapter: 27, verse: 1, reference: "Psalm 27:1", commentary: "The LORD is my light and my salvation — whom shall I fear?" },
            { bookSlug: "isaiah", chapter: 41, verse: 10, reference: "Isaiah 41:10", commentary: "Fear not, for I am with thee — one of the most reassuring verses." },
            { bookSlug: "2-timothy", chapter: 1, verse: 7, reference: "2 Timothy 1:7", commentary: "God has not given us a spirit of fear, but of power, love, and a sound mind." },
            { bookSlug: "romans", chapter: 8, verse: 31, reference: "Romans 8:31", commentary: "If God be for us, who can be against us?" },
            { bookSlug: "1-samuel", chapter: 17, verse: 45, reference: "1 Samuel 17:45", commentary: "David faces Goliath in the name of the LORD of hosts." },
            { bookSlug: "acts", chapter: 4, verse: 29, reference: "Acts 4:29", commentary: "The early church prays for boldness to speak the word." },
        ]
    },
    {
        id: "suffering",
        title: "Finding God in Suffering",
        description: "How Scripture addresses pain, loss, and the hope beyond it.",
        icon: "💧",
        passages: [
            { bookSlug: "job", chapter: 1, verse: 21, reference: "Job 1:21", commentary: "The LORD gave, and the LORD hath taken away — blessed be the name." },
            { bookSlug: "psalms", chapter: 34, verse: 18, reference: "Psalm 34:18", commentary: "The LORD is near to the brokenhearted." },
            { bookSlug: "romans", chapter: 8, verse: 28, reference: "Romans 8:28", commentary: "All things work together for good to those who love God." },
            { bookSlug: "2-corinthians", chapter: 4, verse: 17, reference: "2 Corinthians 4:17", commentary: "Our light affliction works for us a far more exceeding eternal weight of glory." },
            { bookSlug: "james", chapter: 1, verse: 2, reference: "James 1:2-4", commentary: "Count it all joy — trials produce steadfastness." },
            { bookSlug: "1-peter", chapter: 5, verse: 10, reference: "1 Peter 5:10", commentary: "After you have suffered a little while, He himself will restore you." },
            { bookSlug: "isaiah", chapter: 53, verse: 3, reference: "Isaiah 53:3-5", commentary: "He was a man of sorrows, acquainted with grief — the Suffering Servant." },
            { bookSlug: "revelation", chapter: 21, verse: 4, reference: "Revelation 21:4", commentary: "God shall wipe away all tears — the ultimate promise of restoration." },
        ]
    },
    {
        id: "wisdom",
        title: "The Way of Wisdom",
        description: "Proverbs, psalms, and teachings on living wisely before God.",
        icon: "💎",
        passages: [
            { bookSlug: "proverbs", chapter: 1, verse: 7, reference: "Proverbs 1:7", commentary: "The fear of the LORD is the beginning of knowledge." },
            { bookSlug: "proverbs", chapter: 3, verse: 5, reference: "Proverbs 3:5-6", commentary: "Trust in the LORD with all your heart; lean not on your own understanding." },
            { bookSlug: "proverbs", chapter: 9, verse: 10, reference: "Proverbs 9:10", commentary: "The fear of the LORD is the beginning of wisdom." },
            { bookSlug: "james", chapter: 1, verse: 5, reference: "James 1:5", commentary: "If any of you lack wisdom, let him ask of God." },
            { bookSlug: "james", chapter: 3, verse: 17, reference: "James 3:17", commentary: "Wisdom from above is pure, peaceable, gentle, full of mercy." },
            { bookSlug: "ecclesiastes", chapter: 12, verse: 13, reference: "Ecclesiastes 12:13", commentary: "The conclusion: fear God and keep His commandments." },
            { bookSlug: "psalms", chapter: 119, verse: 105, reference: "Psalm 119:105", commentary: "Thy word is a lamp unto my feet — divine guidance." },
            { bookSlug: "colossians", chapter: 2, verse: 3, reference: "Colossians 2:3", commentary: "In Christ are hidden all the treasures of wisdom and knowledge." },
        ]
    },
    {
        id: "salvation",
        title: "The Gospel of Salvation",
        description: "The arc of redemption from Genesis to Revelation.",
        icon: "✝️",
        passages: [
            { bookSlug: "genesis", chapter: 3, verse: 15, reference: "Genesis 3:15", commentary: "The first gospel promise — the seed of the woman will crush the serpent." },
            { bookSlug: "isaiah", chapter: 53, verse: 5, reference: "Isaiah 53:5", commentary: "He was wounded for our transgressions — the cost of salvation." },
            { bookSlug: "john", chapter: 14, verse: 6, reference: "John 14:6", commentary: "I am the way, the truth, and the life." },
            { bookSlug: "romans", chapter: 3, verse: 23, reference: "Romans 3:23", commentary: "All have sinned and fall short of the glory of God." },
            { bookSlug: "romans", chapter: 6, verse: 23, reference: "Romans 6:23", commentary: "The wages of sin is death, but the gift of God is eternal life." },
            { bookSlug: "romans", chapter: 10, verse: 9, reference: "Romans 10:9", commentary: "Confess with your mouth and believe in your heart." },
            { bookSlug: "ephesians", chapter: 2, verse: 8, reference: "Ephesians 2:8-9", commentary: "By grace you are saved through faith — not of works." },
            { bookSlug: "titus", chapter: 3, verse: 5, reference: "Titus 3:5", commentary: "Not by works of righteousness, but according to His mercy." },
            { bookSlug: "revelation", chapter: 22, verse: 17, reference: "Revelation 22:17", commentary: "The Spirit and the bride say, Come! — the final invitation." },
        ]
    },
    {
        id: "holy-spirit",
        title: "The Holy Spirit",
        description: "Understanding the person and work of the Spirit of God.",
        icon: "🕊️",
        passages: [
            { bookSlug: "genesis", chapter: 1, verse: 2, reference: "Genesis 1:2", commentary: "The Spirit of God moved upon the face of the waters." },
            { bookSlug: "john", chapter: 14, verse: 16, reference: "John 14:16-17", commentary: "The Comforter — the Spirit of truth who dwells with you." },
            { bookSlug: "john", chapter: 16, verse: 13, reference: "John 16:13", commentary: "He will guide you into all truth." },
            { bookSlug: "acts", chapter: 2, verse: 1, reference: "Acts 2:1-4", commentary: "Pentecost — the Spirit descends like tongues of fire." },
            { bookSlug: "romans", chapter: 8, verse: 14, reference: "Romans 8:14", commentary: "As many as are led by the Spirit, they are the sons of God." },
            { bookSlug: "romans", chapter: 8, verse: 26, reference: "Romans 8:26", commentary: "The Spirit helps our infirmities and intercedes for us." },
            { bookSlug: "galatians", chapter: 5, verse: 22, reference: "Galatians 5:22-23", commentary: "The fruit of the Spirit: love, joy, peace, patience..." },
            { bookSlug: "ephesians", chapter: 5, verse: 18, reference: "Ephesians 5:18", commentary: "Be filled with the Spirit." },
        ]
    },
    {
        id: "end-times",
        title: "The Last Days",
        description: "Biblical prophecy about the end of the age and Christ's return.",
        icon: "⚡",
        passages: [
            { bookSlug: "daniel", chapter: 2, verse: 44, reference: "Daniel 2:44", commentary: "God will set up a kingdom that shall never be destroyed." },
            { bookSlug: "matthew", chapter: 24, verse: 36, reference: "Matthew 24:36", commentary: "No one knows the day or hour — not even the Son." },
            { bookSlug: "matthew", chapter: 24, verse: 44, reference: "Matthew 24:44", commentary: "Be ready, for the Son of Man comes at an hour you do not expect." },
            { bookSlug: "1-thessalonians", chapter: 4, verse: 16, reference: "1 Thessalonians 4:16-17", commentary: "The Lord shall descend with a shout — we shall be caught up to meet Him." },
            { bookSlug: "2-peter", chapter: 3, verse: 10, reference: "2 Peter 3:10", commentary: "The day of the Lord will come as a thief in the night." },
            { bookSlug: "revelation", chapter: 1, verse: 7, reference: "Revelation 1:7", commentary: "He cometh with clouds; and every eye shall see Him." },
            { bookSlug: "revelation", chapter: 19, verse: 11, reference: "Revelation 19:11-16", commentary: "The triumphant return — King of kings and Lord of lords." },
            { bookSlug: "revelation", chapter: 21, verse: 1, reference: "Revelation 21:1-4", commentary: "A new heaven and a new earth — the eternal state." },
        ]
    }
];
