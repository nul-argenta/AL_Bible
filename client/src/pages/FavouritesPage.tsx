import { useState, useMemo } from "react";
import { Link } from "wouter";
import { BookOpen, Star, Feather, ChevronRight, ArrowUpDown, CalendarDays, BookMarked, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavourites, type FavouriteEntry } from "@/hooks/useFavourites";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMemoryCards } from "@/hooks/useMemoryCards";
import { formatDistanceToNow } from "date-fns";

type SortMode = "date" | "biblical";

export default function FavouritesPage() {
    const { allFavourites, removeFavourite, favouriteCount } = useFavourites();
    const { addCard } = useMemoryCards();
    const [sortMode, setSortMode] = useState<SortMode>("date");
    const [searchQuery, setSearchQuery] = useState("");

    const sorted = useMemo(() => {
        let items = [...allFavourites];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(f =>
                f.verseRef.toLowerCase().includes(q) ||
                f.text.toLowerCase().includes(q)
            );
        }

        if (sortMode === "date") {
            items.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            items.sort((a, b) => {
                if (a.bookOrder !== b.bookOrder) return a.bookOrder - b.bookOrder;
                if (a.chapter !== b.chapter) return a.chapter - b.chapter;
                return a.verse - b.verse;
            });
        }

        return items;
    }, [allFavourites, sortMode, searchQuery]);

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
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        Favourites
                        {favouriteCount > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">({favouriteCount})</span>
                        )}
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
                {/* Search & Sort Controls */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search favourites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                        <button
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${sortMode === "date"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            onClick={() => setSortMode("date")}
                            title="Sort by date added"
                        >
                            <CalendarDays size={12} /> Recent
                        </button>
                        <button
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${sortMode === "biblical"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                            onClick={() => setSortMode("biblical")}
                            title="Sort by biblical order"
                        >
                            <BookMarked size={12} /> Biblical
                        </button>
                    </div>
                </div>

                {/* Favourites List */}
                {sorted.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-full inline-flex mb-4">
                            <Star className="text-amber-500" size={24} />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">
                            {searchQuery ? "No matching favourites" : "No favourites yet"}
                        </p>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            {searchQuery
                                ? "Try a different search term."
                                : "Right-click any verse while reading and tap the ★ to save it here."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sorted.map(fav => {
                            const date = new Date(fav.timestamp).toLocaleDateString("en-AU", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                            return (
                                <Link key={fav.verseId} href={`/read/${fav.bookSlug}/${fav.chapter}`} className="block px-5 py-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <Star className="h-4 w-4 mt-0.5 text-amber-500 fill-amber-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-foreground">
                                                    {fav.verseRef}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {date}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-serif leading-relaxed line-clamp-2">
                                                "{fav.text}"
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addCard.mutate(fav.verseId); }}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Add to Memory Deck"
                                            >
                                                <Brain size={14} />
                                            </button>
                                            <ChevronRight size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity mt-0 shrink-0" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
