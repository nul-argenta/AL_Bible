import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, ChevronRight, BarChart3, Flame, Heart, Star, Brain, BookMarked, Feather, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";

interface YearStats {
    chaptersRead: number;
    currentStreak: number;
    favourites: number;
    prayersAnswered: number;
    totalPrayers: number;
    cardsMastered: number;
    year: number;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <div className="bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${color}`}>
                {icon}
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

export default function StatsPage() {
    const { data: stats, isLoading } = useQuery<YearStats>({
        queryKey: ["stats", "year-review"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/stats/year-review");
            return res.json();
        }
    });

    const handleExport = async () => {
        try {
            const res = await apiRequest("GET", "/api/export");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `armor-light-backup-${new Date().toISOString().split("T")[0]}.json`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed:", e);
        }
    };

    return (
        <PageWrapper className="bg-background font-sans">
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <Feather size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 size={16} className="text-primary" /> Year in Review
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto">
                <div className="text-center mb-10 animate-fade-in-up">
                    <h2 className="text-4xl font-serif font-bold text-foreground mb-2">
                        ✨ {stats?.year || new Date().getFullYear()} Year in Review
                    </h2>
                    <p className="text-muted-foreground">Your spiritual journey at a glance</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />)}
                    </div>
                ) : stats ? (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up">
                            <StatCard icon={<BookOpen size={20} className="text-blue-500" />} label="Chapters Read" value={stats.chaptersRead} color="bg-blue-50 dark:bg-blue-900/20" />
                            <StatCard icon={<Flame size={20} className="text-orange-500" />} label="Current Streak" value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? "s" : ""}`} color="bg-orange-50 dark:bg-orange-900/20" />
                            <StatCard icon={<Star size={20} className="text-yellow-500" />} label="Favourites" value={stats.favourites} color="bg-yellow-50 dark:bg-yellow-900/20" />
                            <StatCard icon={<Heart size={20} className="text-pink-500" />} label="Prayers Answered" value={`${stats.prayersAnswered}/${stats.totalPrayers}`} color="bg-pink-50 dark:bg-pink-900/20" />
                            <StatCard icon={<Brain size={20} className="text-purple-500" />} label="Verses Mastered" value={stats.cardsMastered} color="bg-purple-50 dark:bg-purple-900/20" />
                            <StatCard icon={<BookMarked size={20} className="text-green-500" />} label="Year" value={stats.year} color="bg-green-50 dark:bg-green-900/20" />
                        </div>

                        {/* Motivational message */}
                        <div className="bg-card rounded-2xl p-6 border border-border/40 text-center animate-fade-in-up delay-200">
                            <p className="font-serif text-lg text-foreground italic leading-relaxed">
                                {stats.chaptersRead > 100 ? "\"Well done, good and faithful servant!\" — Matthew 25:23" :
                                    stats.chaptersRead > 50 ? "\"Your word is a lamp for my feet, a light on my path.\" — Psalm 119:105" :
                                        stats.chaptersRead > 10 ? "\"The grass withers, the flower fades, but the word of our God stands forever.\" — Isaiah 40:8" :
                                            "\"Come now, let us reason together.\" — Isaiah 1:18"}
                            </p>
                        </div>

                        {/* Export */}
                        <div className="bg-muted/30 rounded-xl p-5 border border-border/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">Export & Backup</h3>
                                    <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={handleExport}>
                                    <Download size={16} /> Export Data
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>
        </PageWrapper>
    );
}
