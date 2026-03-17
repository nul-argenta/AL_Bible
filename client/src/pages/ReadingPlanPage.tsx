import { useState } from "react";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useAchievements, type Achievement } from "@/hooks/useAchievements";
import { useDevotionalPlan } from "@/hooks/useDevotionalPlan";
import { READING_PLANS } from "@shared/readingPlans";
import { AT_BIBLE_BOOKS, BIBLE_CATEGORIES, getCategoryBooks, TOTAL_CHAPTERS } from "@/lib/bibleData";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, BookOpen, Trophy, Clock, Flame, ChevronDown, ChevronUp, Calendar, Play, CheckCircle2, X } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    bronze: {
        bg: "bg-amber-100/80 dark:bg-amber-900/20",
        border: "border-amber-300 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-400",
        glow: "",
    },
    silver: {
        bg: "bg-slate-100/80 dark:bg-slate-800/30",
        border: "border-slate-300 dark:border-slate-600",
        text: "text-slate-600 dark:text-slate-300",
        glow: "",
    },
    gold: {
        bg: "bg-yellow-50/80 dark:bg-yellow-900/20",
        border: "border-yellow-400 dark:border-yellow-600",
        text: "text-yellow-700 dark:text-yellow-400",
        glow: "shadow-yellow-200/50 dark:shadow-yellow-800/30 shadow-md",
    },
    diamond: {
        bg: "bg-sky-50/80 dark:bg-sky-900/20",
        border: "border-sky-400 dark:border-sky-500",
        text: "text-sky-600 dark:text-sky-300",
        glow: "shadow-sky-200/50 dark:shadow-sky-800/30 shadow-lg",
    },
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
    const style = TIER_STYLES[achievement.tier];
    const pct = achievement.progress
        ? Math.round((achievement.progress.current / achievement.progress.total) * 100)
        : achievement.earned ? 100 : 0;

    return (
        <div
            className={`rounded-xl border p-3 sm:p-4 transition-all ${style.bg} ${style.border} ${achievement.earned ? style.glow : "opacity-60 grayscale"}`}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl sm:text-3xl">{achievement.emoji}</span>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{achievement.description}</div>
                    {achievement.progress && (
                        <div className="mt-2">
                            <Progress value={pct} className="h-1" />
                            <div className="text-[10px] text-muted-foreground mt-1 font-medium">
                                {achievement.progress.current} / {achievement.progress.total}
                            </div>
                        </div>
                    )}
                </div>
                {achievement.earned && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${style.text} bg-white/50 dark:bg-black/20`}>
                        ✓
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ReadingPlanPage() {
    const { progress, getStats, isRead } = useReadingProgress();
    const { getRecent, getLastVisited, getRelativeTime } = useReadingHistory();
    const { achievements, earned, inProgress, streak } = useAchievements();
    const stats = getStats();
    const recentEntries = getRecent(5);

    const [showAllAchievements, setShowAllAchievements] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<"progress" | "plans">("progress");
    const { activePlan, completedDays, isLoading: plansLoading, startPlan, completeDay, abandonPlan } = useDevotionalPlan();

    const toggleCategory = (catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    // Helper: Find first unread chapter for a book
    const getNextChapter = (bookSlug: string, totalChapters: number) => {
        for (let i = 1; i <= totalChapters; i++) {
            if (!isRead(bookSlug, i)) return i;
        }
        return 1;
    };

    const displayedAchievements = showAllAchievements
        ? achievements
        : [...earned.slice(0, 4), ...inProgress.slice(0, Math.max(0, 4 - earned.length))];

    return (
        <PageWrapper className="bg-background font-sans flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center px-4 py-3 border-b bg-background/95 backdrop-blur-md">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft size={16} /> Back to Reader
                    </Button>
                </Link>
                <div className="flex-1 text-center font-serif font-bold text-lg">My Reading Journey</div>
                <div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Tab Switcher */}
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 pt-6">
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40 w-fit">
                    <button
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "progress" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setActiveTab("progress")}
                    >
                        <BookOpen size={14} /> My Progress
                    </button>
                    <button
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "plans" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setActiveTab("plans")}
                    >
                        <Calendar size={14} /> Guided Plans
                    </button>
                </div>
            </div>

            {activeTab === "plans" ? (
                /* ─── Guided Plans Tab ─── */
                <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8 overflow-y-auto">
                    {activePlan ? (() => {
                        const plan = READING_PLANS.find(p => p.id === activePlan.plan_id);
                        if (!plan) return null;
                        const currentDayIndex = completedDays.length;
                        const progressPct = Math.round((completedDays.length / plan.totalDays) * 100);

                        return (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Active Plan Header */}
                                <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-3xl">{plan.icon}</span>
                                                <h2 className="text-2xl font-serif font-bold text-foreground">{plan.title}</h2>
                                            </div>
                                            <p className="text-muted-foreground text-sm">{plan.description}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => abandonPlan.mutate(plan.id)}>
                                            <X size={14} className="mr-1" /> Quit
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-primary">{progressPct}%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{completedDays.length} of {plan.totalDays} days completed</p>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                                    {plan.dailyReadings.map((reading) => {
                                        const isDone = completedDays.includes(reading.day);
                                        const isCurrent = reading.day === currentDayIndex + 1;
                                        return (
                                            <div key={reading.day} className="relative">
                                                <Link
                                                    href={`/read/${reading.bookSlug}/${reading.chapter}`}
                                                    onClick={() => { if (!isDone) completeDay.mutate({ planId: plan.id, day: reading.day }); }}
                                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${isDone
                                                        ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                                                        : isCurrent
                                                            ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20"
                                                            : "bg-card border-border/40 hover:border-primary/30"
                                                        }`}
                                                >
                                                    {isDone ? (
                                                        <CheckCircle2 size={14} className="text-green-500 mb-0.5" />
                                                    ) : (
                                                        <span className={`text-xs font-bold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{reading.day}</span>
                                                    )}
                                                    <span className="text-[9px] text-muted-foreground truncate w-full">{reading.label || `${reading.bookSlug.split('-').pop()} ${reading.chapter}`}</span>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })() : (
                        /* Plan Picker */
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Choose a Reading Plan</h2>
                            <p className="text-muted-foreground mb-6">Structured journeys to guide your daily reading.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {READING_PLANS.map(plan => (
                                    <div key={plan.id} className="bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl">{plan.icon}</span>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{plan.title}</h3>
                                                <p className="text-xs text-muted-foreground">{plan.totalDays} days</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plan.description}</p>
                                        <Button size="sm" className="w-full gap-2" onClick={() => startPlan.mutate(plan.id)}>
                                            <Play size={14} /> Start Plan
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            ) : (
                <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8 overflow-y-auto">

                    {/* ─── Hero Stats ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Main Progress */}
                        <div className="md:col-span-2 bg-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/10 flex items-center gap-6">
                            <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0">
                                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                    <circle
                                        className="text-primary/10 stroke-current"
                                        strokeWidth="10"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                    />
                                    <circle
                                        className="text-primary stroke-current transition-all duration-1000 ease-out"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.percent / 100)}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl sm:text-3xl font-bold">{stats.percent}%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-serif">Keep going!</h2>
                                <p className="text-muted-foreground">
                                    You have read <strong className="text-foreground">{stats.totalRead}</strong> out of <strong className="text-foreground">{stats.totalChapters}</strong> chapters.
                                </p>
                                <Link href={recentEntries.length > 0 ? `/read/${recentEntries[0].bookSlug}/${recentEntries[0].chapter}` : "/read/genesis/1"}>
                                    <Button className="mt-2">Continue Reading</Button>
                                </Link>
                            </div>
                        </div>

                        {/* Streak Card */}
                        <div className="bg-card rounded-2xl p-6 border border-border/60 flex flex-col justify-center items-center text-center space-y-3">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-orange-600 dark:text-orange-400">
                                <Flame size={32} />
                            </div>
                            <div>
                                <div className="font-bold text-3xl">{streak.current}</div>
                                <div className="text-sm text-muted-foreground font-medium">Day Streak</div>
                                {streak.best > streak.current && (
                                    <div className="text-xs text-muted-foreground mt-1">Best: {streak.best} days</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Achievements ─── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Trophy size={18} className="text-primary" />
                                Achievements
                                {earned.length > 0 && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {earned.length} / {achievements.length}
                                    </span>
                                )}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground"
                                onClick={() => setShowAllAchievements(!showAllAchievements)}
                            >
                                {showAllAchievements ? "Show Less" : "Show All"}
                                {showAllAchievements ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {displayedAchievements.map(a => (
                                <AchievementCard key={a.id} achievement={a} />
                            ))}
                        </div>
                    </div>

                    {/* ─── Recently Read ─── */}
                    {recentEntries.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Clock size={18} className="text-primary" />
                                Recently Read
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                {recentEntries.map((entry, i) => (
                                    <Link key={i} href={`/read/${entry.bookSlug}/${entry.chapter}`}>
                                        <div className="bg-card rounded-xl border border-border/40 p-3 sm:p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="font-serif font-bold text-sm group-hover:text-primary transition-colors">
                                                {entry.bookName} {entry.chapter}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {getRelativeTime(entry.timestamp)}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Books by Category ─── */}
                    {(["OT", "NT"] as const).map(testament => (
                        <div key={testament} className="space-y-4">
                            <h3 className="font-bold text-xl font-serif border-b border-border/40 pb-2">
                                {testament === "OT" ? "📖 Old Testament" : "✝️ New Testament"}
                            </h3>

                            {BIBLE_CATEGORIES.filter(cat => cat.testament === testament).map(cat => {
                                const catBooks = getCategoryBooks(cat.id);
                                const catRead = catBooks.reduce((sum, b) => sum + (progress[b.slug] || []).length, 0);
                                const catTotal = catBooks.reduce((sum, b) => sum + b.chapters, 0);
                                const catPct = Math.round((catRead / catTotal) * 100) || 0;
                                const isCollapsed = collapsedCategories.has(cat.id);
                                const allBooksComplete = catBooks.every(b => (progress[b.slug] || []).length === b.chapters);

                                return (
                                    <div key={cat.id} className="space-y-3">
                                        {/* Category Header */}
                                        <button
                                            onClick={() => toggleCategory(cat.id)}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-colors text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{cat.emoji}</span>
                                                <div>
                                                    <div className="font-bold text-sm flex items-center gap-2">
                                                        {cat.label}
                                                        {allBooksComplete && (
                                                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                                                                Complete ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{cat.description} · {catBooks.length} books</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-xs font-bold">{catPct}%</div>
                                                    <div className="text-[10px] text-muted-foreground">{catRead}/{catTotal} ch</div>
                                                </div>
                                                <Progress value={catPct} className="h-1.5 w-16 sm:w-24" />
                                                {isCollapsed ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
                                            </div>
                                        </button>

                                        {/* Books in Category */}
                                        {!isCollapsed && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2 sm:pl-4">
                                                {catBooks.map((book) => {
                                                    const readCount = (progress[book.slug] || []).length;
                                                    const percentage = Math.round((readCount / book.chapters) * 100);
                                                    const lastVisited = getLastVisited(book.slug);
                                                    const nextChap = lastVisited ? lastVisited.chapter : getNextChapter(book.slug, book.chapters);
                                                    const isComplete = readCount === book.chapters;

                                                    return (
                                                        <div key={book.slug} className="bg-card rounded-xl border border-border/40 p-4 hover:border-primary/30 transition-colors group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="font-serif font-bold text-sm">{book.name}</div>
                                                                    <div className="text-xs text-muted-foreground">{readCount} / {book.chapters} ch</div>
                                                                </div>
                                                                {isComplete ? (
                                                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                                                        ✓
                                                                    </span>
                                                                ) : percentage > 0 ? (
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                                        {percentage}%
                                                                    </span>
                                                                ) : null}
                                                            </div>

                                                            {lastVisited && (
                                                                <div className="text-[11px] text-muted-foreground mb-2">
                                                                    Last: Ch {lastVisited.chapter}, {getRelativeTime(lastVisited.timestamp)}
                                                                </div>
                                                            )}

                                                            <Progress value={percentage} className="h-1 mb-3" />

                                                            <Link href={`/read/${book.slug}/${nextChap}`}>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="w-full justify-between text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                                                >
                                                                    {isComplete ? "Read Again" : lastVisited ? `Resume Ch ${nextChap}` : `Start Ch ${nextChap}`}
                                                                    <ChevronLeft className="rotate-180 h-3.5 w-3.5 opacity-50" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                </main>
            )}
        </PageWrapper>
    );
}
