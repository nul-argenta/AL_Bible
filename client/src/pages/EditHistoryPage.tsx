import { useState, useMemo } from "react";
import { Link } from "wouter";
import { BookOpen, Clock, Trash2, Filter, Feather, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditHistory, ACTION_META, type EditAction } from "@/hooks/useEditHistory";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatDistanceToNow } from "date-fns";

const ACTION_FILTERS: { label: string; value: EditAction | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Highlights", value: "highlight_add" },
    { label: "Labels", value: "highlight_label" },
    { label: "Notes", value: "note_add" },
    { label: "Favourites", value: "favourite_add" },
    { label: "Links", value: "link_add" },
];

export default function EditHistoryPage() {
    const { history, clearHistory } = useEditHistory();
    const [filter, setFilter] = useState<EditAction | "all">("all");

    const filtered = useMemo(() => {
        if (filter === "all") return history;
        const prefix = filter.split("_")[0];
        return history.filter(e => e.action.startsWith(prefix));
    }, [history, filter]);

    // Group by date
    const grouped = useMemo(() => {
        const groups: Record<string, typeof filtered> = {};
        for (const entry of filtered) {
            const dateKey = new Date(entry.timestamp).toLocaleDateString("en-AU", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(entry);
        }
        return groups;
    }, [filtered]);

    return (
        <PageWrapper className="bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <Feather size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        Activity Log
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <Link href="/read/genesis/1">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <BookOpen size={14} /> Read
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto">
                {/* Filter Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {ACTION_FILTERS.map(f => (
                            <button
                                key={f.value}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f.value
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    }`}
                                onClick={() => setFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {history.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive hover:text-destructive"
                            onClick={() => {
                                if (confirm("Clear all activity history? This cannot be undone.")) {
                                    clearHistory();
                                }
                            }}
                        >
                            <Trash2 className="h-3 w-3 mr-1" /> Clear
                        </Button>
                    )}
                </div>

                {/* Activity Feed */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-muted p-4 rounded-full inline-flex mb-4">
                            <Clock className="text-muted-foreground" size={24} />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">No activity yet</p>
                        <p className="text-muted-foreground text-sm">
                            Your highlights, notes, and favourites will appear here as you study.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([date, entries]) => (
                            <div key={date}>
                                <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3 sticky top-14 bg-background/95 backdrop-blur-md py-2 z-10">
                                    {date}
                                </h3>
                                <div className="space-y-1">
                                    {entries.map(entry => {
                                        const meta = ACTION_META[entry.action];
                                        const time = new Date(entry.timestamp).toLocaleTimeString("en-AU", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        });
                                        return (
                                            <Link key={entry.id} href={`/read/${entry.bookSlug}/${entry.chapter}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
                                                <span className="text-lg">{meta.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${meta.color}`}>
                                                            {meta.label}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-sm font-semibold text-foreground truncate">
                                                            {entry.verseRef}
                                                        </span>
                                                    </div>
                                                    {entry.details && (
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                            {entry.details}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                                                    {time}
                                                </span>
                                                <ChevronRight size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Footer */}
                {history.length > 0 && (
                    <div className="mt-12 text-center text-xs text-muted-foreground">
                        {history.length} {history.length === 1 ? "entry" : "entries"} recorded
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
