import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Search, Languages, Sparkles, MoveRight, Feather, MessageSquare, Shuffle, Star, Clock, QrCode, HelpCircle, Brain, Map, Image, Heart, BarChart3, Users, User as UserIcon } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { drops } from "@shared/drops";

// ─── Curated Verses of the Day ──────────────────────────────────────
const DAILY_VERSES = [
    { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105", link: "/read/psalms/119?v=105" },
    { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16", link: "/read/john/3?v=16" },
    { text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5", link: "/read/proverbs/3?v=5" },
    { text: "The LORD is my shepherd; I shall not want.", ref: "Psalm 23:1", link: "/read/psalms/23?v=1" },
    { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13", link: "/read/philippians/4?v=13" },
    { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", ref: "Joshua 1:9", link: "/read/joshua/1?v=9" },
    { text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.", ref: "Isaiah 40:31", link: "/read/isaiah/40?v=31" },
    { text: "And we know that all things work together for good to them that love God.", ref: "Romans 8:28", link: "/read/romans/8?v=28" },
    { text: "The Lord is not slack concerning his promise, as some men count slackness; but is longsuffering to us-ward.", ref: "2 Peter 3:9", link: "/read/2-peter/3?v=9" },
    { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", ref: "Matthew 11:28", link: "/read/matthew/11?v=28" },
    { text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.", ref: "Jeremiah 29:11", link: "/read/jeremiah/29?v=11" },
    { text: "The fear of the LORD is the beginning of wisdom: and the knowledge of the holy is understanding.", ref: "Proverbs 9:10", link: "/read/proverbs/9?v=10" },
    { text: "In the beginning God created the heaven and the earth.", ref: "Genesis 1:1", link: "/read/genesis/1?v=1" },
    { text: "Blessed are the peacemakers: for they shall be called the children of God.", ref: "Matthew 5:9", link: "/read/matthew/5?v=9" },
    { text: "A soft answer turneth away wrath: but grievous words stir up anger.", ref: "Proverbs 15:1", link: "/read/proverbs/15?v=1" },
    { text: "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?", ref: "Micah 6:8", link: "/read/micah/6?v=8" },
    { text: "The LORD is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1", link: "/read/psalms/27?v=1" },
    { text: "Create in me a clean heart, O God; and renew a right spirit within me.", ref: "Psalm 51:10", link: "/read/psalms/51?v=10" },
    { text: "Let the words of my mouth, and the meditation of my heart, be acceptable in thy sight, O LORD.", ref: "Psalm 19:14", link: "/read/psalms/19?v=14" },
    { text: "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.", ref: "Ephesians 6:11", link: "/read/ephesians/6?v=11" },
    { text: "Be still, and know that I am God.", ref: "Psalm 46:10", link: "/read/psalms/46?v=10" },
    { text: "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", ref: "1 Corinthians 13:13", link: "/read/1-corinthians/13?v=13" },
    { text: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.", ref: "Psalm 37:4", link: "/read/psalms/37?v=4" },
    { text: "Greater love hath no man than this, that a man lay down his life for his friends.", ref: "John 15:13", link: "/read/john/15?v=13" },
    { text: "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord.", ref: "Romans 6:23", link: "/read/romans/6?v=23" },
    { text: "The heavens declare the glory of God; and the firmament sheweth his handywork.", ref: "Psalm 19:1", link: "/read/psalms/19?v=1" },
    { text: "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.", ref: "Proverbs 27:17", link: "/read/proverbs/27?v=17" },
    { text: "Jesus wept.", ref: "John 11:35", link: "/read/john/11?v=35" },
    { text: "This is the day which the LORD hath made; we will rejoice and be glad in it.", ref: "Psalm 118:24", link: "/read/psalms/118?v=24" },
    { text: "If God be for us, who can be against us?", ref: "Romans 8:31", link: "/read/romans/8?v=31" },
];

const RANDOM_PICKS = [
    "/read/genesis/1", "/read/exodus/14", "/read/ruth/1", "/read/1-samuel/17",
    "/read/psalms/23", "/read/psalms/91", "/read/psalms/139", "/read/proverbs/3",
    "/read/ecclesiastes/3", "/read/isaiah/53", "/read/daniel/3", "/read/jonah/1",
    "/read/matthew/5", "/read/matthew/28", "/read/mark/4", "/read/luke/15",
    "/read/john/1", "/read/john/3", "/read/acts/2", "/read/romans/8",
    "/read/1-corinthians/13", "/read/ephesians/6", "/read/philippians/4",
    "/read/hebrews/11", "/read/james/1", "/read/revelation/21",
];

export default function HomePage() {
    const [, navigate] = useLocation();

    const todaysVerse = useMemo(() => {
        const now = new Date();
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
        return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
    }, []);

    const handleSurpriseMe = () => {
        const pick = RANDOM_PICKS[Math.floor(Math.random() * RANDOM_PICKS.length)];
        navigate(pick);
    };

    return (
        <PageWrapper className="bg-background font-sans selection:bg-primary/20">
            {/* ─── Navigation ───────────────────────────────────────────────── */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full animate-fade-in delay-0">
                <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
                    <Feather className="h-6 w-6" />
                    <span>Armor <span className="opacity-80">&</span> Light</span>
                </div>
                <div className="flex gap-4 items-center">
                    <Link href="/favourites" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Star size={14} /> Favourites
                    </Link>
                    <Link href="/journal" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <BookOpen size={14} /> Journal
                    </Link>
                    <Link href="/activity" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Clock size={14} /> Activity
                    </Link>
                    <Link href="/quiz" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <HelpCircle size={14} /> Quiz
                    </Link>
                    <Link href="/memory" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Brain size={14} /> Memory
                    </Link>
                    <Link href="/study-chains" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Map size={14} /> Chains
                    </Link>
                    <Link href="/verse-image" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Image size={14} /> Image
                    </Link>
                    <Link href="/prayers" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Heart size={14} /> Prayers
                    </Link>
                    <Link href="/characters" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <Users size={14} /> Characters
                    </Link>
                    <Link href="/stats" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <BarChart3 size={14} /> Stats
                    </Link>
                    <a href="#drops" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground flex items-center gap-1">
                        <QrCode size={14} /> Drops
                    </a>
                    <ThemeToggle />

                    <Link href="/read/genesis/1" className="text-sm font-medium hover:text-primary transition-colors">
                        Start Reading
                    </Link>
                </div>
            </nav>

            {/* ─── Scrollable Content ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
                {/* ─── Hero ─────────────────────────────────────────────────────── */}
                <header className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto space-y-8">

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase animate-fade-in-up delay-100">
                        <Sparkles size={12} />
                        <span>Divinely Inspired, Digitally Illuminated</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-serif text-foreground leading-tight animate-fade-in-up delay-200">
                        Scripture, <br className="hidden md:block" />
                        <span className="text-muted-foreground italic font-light">Illuminated.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
                        Experience the Bible in its original languages, enhanced by instant context, cross-references, and AI-driven insights.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4 animate-fade-in-up delay-400">
                        <Link href="/read/genesis/1" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-primary-foreground bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 active:scale-95">
                            <BookOpen size={20} />
                            Open the Bible
                        </Link>
                        <button
                            onClick={handleSurpriseMe}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-foreground bg-card border border-border/50 shadow-sm transition-all hover:bg-muted/50 hover:border-primary/20 hover:shadow-md active:scale-95"
                        >
                            <Shuffle size={16} />
                            Surprise Me
                        </button>
                    </div>
                </header>

                {/* ─── Verse of the Day ──────────────────────────────────────── */}
                <section className="px-6 pb-20 animate-fade-in-up delay-500">
                    <Link href={todaysVerse.link} className="block max-w-2xl mx-auto text-center p-8 md:p-12 rounded-2xl bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                        <Feather className="absolute top-6 left-6 text-primary/10 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rotate-12 transition-transform group-hover:rotate-45 duration-700" />

                        <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">Verse of the Day</h3>
                        <p className="font-serif text-2xl md:text-3xl text-foreground italic leading-relaxed mb-6">
                            &ldquo;{todaysVerse.text}&rdquo;
                        </p>
                        <p className="text-sm font-semibold text-primary">&mdash; {todaysVerse.ref}</p>
                    </Link>
                </section>

                {/* ─── Feature Grid ─────────────────────────────────────────────── */}
                <section className="px-6 py-20 bg-muted/30 border-t border-border/50 animate-fade-in-up delay-600">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FeatureCard
                                icon={<Languages size={24} />}
                                title="Original Languages"
                                desc="Instant interlinear access to Hebrew & Greek definitions."
                            />
                            <FeatureCard
                                icon={<Search size={24} />}
                                title="Deep Search"
                                desc="Find verses by keyword, theme, or semantic meaning."
                            />
                            <FeatureCard
                                icon={<BookOpen size={24} />}
                                title="Smart Context"
                                desc="AI-powered cross-references that interpret Scripture with Scripture."
                            />
                            <FeatureCard
                                icon={<MessageSquare size={24} />}
                                title="Community Insights"
                                desc="Share revelations and see what others are discovering."
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Seasonal Drops ─────────────────────────────────────────── */}
                {drops.length > 0 && (
                    <section id="drops" className="px-6 py-20 border-t border-border/50">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
                                    <QrCode size={14} /> Seasonal Drops
                                </span>
                                <h2 className="text-3xl font-serif font-bold tracking-tight mt-3">Garment Collection</h2>
                                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                                    Exclusive verse studies tied to our seasonal apparel. Scan the QR code on your garment or browse below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {drops.map((drop) => (
                                    <Link key={drop.id} href={`/drop/${drop.id}`}>
                                        <div className="group rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                                            {drop.media.images.length > 0 && (
                                                <div className="aspect-video overflow-hidden">
                                                    <img
                                                        src={drop.media.images[0]}
                                                        alt={drop.theme}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">{drop.theme}</span>
                                                <p className="font-serif text-lg font-semibold mt-1 leading-snug line-clamp-2">
                                                    "{drop.versePrimary}"
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2 capitalize">
                                                    {drop.verseReference.book} {drop.verseReference.chapter}:{drop.verseReference.verse}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ─── Footer ───────────────────────────────────────────────────── */}
                <footer className="px-6 py-12 text-center text-sm text-muted-foreground border-t bg-background animate-fade-in delay-700">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                        <Feather size={16} />
                    </div>
                    <p>© {new Date().getFullYear()} Armor & Light. Built on Open Source Scholarship.</p>
                </footer>
            </div>
        </PageWrapper>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="group rounded-xl p-6 bg-background border border-border/50 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
    );
}
