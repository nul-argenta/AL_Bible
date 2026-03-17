import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface SearchResult {
    id: number;
    book_name: string;
    book_slug: string;
    chapter: number;
    verse: number;
    text_primary: string;
    text_web?: string;
    text_kjv?: string;
    isBookMatch?: boolean; // New flag for book suggestions
}

const BIBLE_BOOKS = [
    { name: "Genesis", slug: "genesis" }, { name: "Exodus", slug: "exodus" }, { name: "Leviticus", slug: "leviticus" },
    { name: "Numbers", slug: "numbers" }, { name: "Deuteronomy", slug: "deuteronomy" }, { name: "Joshua", slug: "joshua" },
    { name: "Judges", slug: "judges" }, { name: "Ruth", slug: "ruth" }, { name: "1 Samuel", slug: "1-samuel" },
    { name: "2 Samuel", slug: "2-samuel" }, { name: "1 Kings", slug: "1-kings" }, { name: "2 Kings", slug: "2-kings" },
    { name: "1 Chronicles", slug: "1-chronicles" }, { name: "2 Chronicles", slug: "2-chronicles" }, { name: "Ezra", slug: "ezra" },
    { name: "Nehemiah", slug: "nehemiah" }, { name: "Esther", slug: "esther" }, { name: "Job", slug: "job" },
    { name: "Psalms", slug: "psalms" }, { name: "Proverbs", slug: "proverbs" }, { name: "Ecclesiastes", slug: "ecclesiastes" },
    { name: "Song of Solomon", slug: "song-of-solomon" }, { name: "Isaiah", slug: "isaiah" }, { name: "Jeremiah", slug: "jeremiah" },
    { name: "Lamentations", slug: "lamentations" }, { name: "Ezekiel", slug: "ezekiel" }, { name: "Daniel", slug: "daniel" },
    { name: "Hosea", slug: "hosea" }, { name: "Joel", slug: "joel" }, { name: "Amos", slug: "amos" },
    { name: "Obadiah", slug: "obadiah" }, { name: "Jonah", slug: "jonah" }, { name: "Micah", slug: "micah" },
    { name: "Nahum", slug: "nahum" }, { name: "Habakkuk", slug: "habakkuk" }, { name: "Zephaniah", slug: "zephaniah" },
    { name: "Haggai", slug: "haggai" }, { name: "Zechariah", slug: "zechariah" }, { name: "Malachi", slug: "malachi" },
    { name: "Matthew", slug: "matthew" }, { name: "Mark", slug: "mark" }, { name: "Luke", slug: "luke" },
    { name: "John", slug: "john" }, { name: "Acts", slug: "acts" }, { name: "Romans", slug: "romans" },
    { name: "1 Corinthians", slug: "1-corinthians" }, { name: "2 Corinthians", slug: "2-corinthians" }, { name: "Galatians", slug: "galatians" },
    { name: "Ephesians", slug: "ephesians" }, { name: "Philippians", slug: "philippians" }, { name: "Colossians", slug: "colossians" },
    { name: "1 Thessalonians", slug: "1-thessalonians" }, { name: "2 Thessalonians", slug: "2-thessalonians" }, { name: "1 Timothy", slug: "1-timothy" },
    { name: "2 Timothy", slug: "2-timothy" }, { name: "Titus", slug: "titus" }, { name: "Philemon", slug: "philemon" },
    { name: "Hebrews", slug: "hebrews" }, { name: "James", slug: "james" }, { name: "1 Peter", slug: "1-peter" },
    { name: "2 Peter", slug: "2-peter" }, { name: "1 John", slug: "1-john" }, { name: "2 John", slug: "2-john" },
    { name: "3 John", slug: "3-john" }, { name: "Jude", slug: "jude" }, { name: "Revelation", slug: "revelation" }
];

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (result: SearchResult) => void; // Optional: If provided, select instead of navigate
}

export function SearchDialog({ open, onOpenChange, onSelect }: SearchDialogProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const [, navigate] = useLocation();

    // Focus input when dialog opens
    useEffect(() => {
        if (open) {
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Global Ctrl+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                onOpenChange(!open);
            }
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onOpenChange]);

    // Debounced search
    const doSearch = useCallback(async (q: string) => {
        if (!q.trim() || q.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Fetch verse matches
            const res = await apiRequest("GET", `/api/bible/search?q=${encodeURIComponent(q.trim())}`);
            let verseData: SearchResult[] = await res.json();

            // 2. Rank verse matches: Exact phrases first
            const lowerQ = q.toLowerCase();
            verseData.sort((a, b) => {
                const textA = (a.text_web || a.text_primary).toLowerCase();
                const textB = (b.text_web || b.text_primary).toLowerCase();
                const aExact = textA.includes(lowerQ);
                const bExact = textB.includes(lowerQ);
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return 0;
            });

            // 3. Find Book Matches (Autocomplete)
            const bookMatches = BIBLE_BOOKS.filter(b =>
                b.name.toLowerCase().includes(lowerQ) ||
                b.slug.replace(/-/g, " ").includes(lowerQ)
            ).slice(0, 3).map(b => ({
                id: -Math.random(), // Negative ID to distinguish
                book_name: b.name,
                book_slug: b.slug,
                chapter: 1,
                verse: 1,
                text_primary: `Go to ${b.name}`,
                isBookMatch: true
            } as SearchResult));

            // 4. Combine: Books first, then Verses
            setResults([...bookMatches, ...verseData]);
            setSelectedIndex(0);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 300);
    };

    const goToResult = (result: SearchResult) => {
        if (onSelect) {
            onSelect(result);
            onOpenChange(false);
            return;
        }

        if (result.isBookMatch) {
            navigate(`/read/${result.book_slug}/1`);
        } else {
            navigate(`/read/${result.book_slug}/${result.chapter}?v=${result.verse}`);
        }
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            goToResult(results[selectedIndex]);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div className="fixed left-1/2 top-[15%] z-50 w-[90vw] max-w-[560px] -translate-x-1/2 animate-fade-in-up">
                <div className="bg-card rounded-xl shadow-2xl border border-border/60 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 border-b border-border/40">
                        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search the Bible..."
                            className="border-0 shadow-none focus-visible:ring-0 h-12 text-base bg-transparent px-0"
                        />
                        {query && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border/50 shrink-0">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <ScrollArea className="max-h-[50vh]">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {!loading && query.trim().length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                <p className="text-sm text-muted-foreground">No results for "<span className="font-medium text-foreground">{query}</span>"</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords or phrasing</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="py-2">
                                <div className="px-4 py-1">
                                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        {results.length} result{results.length !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                {results.map((result, i) => {
                                    if (result.isBookMatch) {
                                        return (
                                            <div
                                                key={`book-${result.book_slug}-${i}`}
                                                className={`
                                                    flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/40
                                                    ${i === selectedIndex ? "bg-primary/10" : "hover:bg-muted/40"}
                                                `}
                                                onClick={() => goToResult(result)}
                                                onMouseEnter={() => setSelectedIndex(i)}
                                            >
                                                <div className="bg-primary/20 p-1.5 rounded-md">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-bold text-foreground">{result.book_name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">Go to Book</span>
                                                </div>
                                                <ArrowRight className={`h-4 w-4 shrink-0 transition-opacity ${i === selectedIndex ? "text-primary opacity-100" : "opacity-0"}`} />
                                            </div>
                                        );
                                    }

                                    const text = result.text_web || result.text_primary || result.text_kjv || "";
                                    // Highlight matching text
                                    const lowerText = text.toLowerCase();
                                    const lowerQuery = query.toLowerCase().trim();
                                    const matchIdx = lowerText.indexOf(lowerQuery);

                                    return (
                                        <div
                                            key={result.id}
                                            className={`
                                                flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors
                                                ${i === selectedIndex ? "bg-primary/10" : "hover:bg-muted/40"}
                                            `}
                                            onClick={() => goToResult(result)}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-primary">
                                                        {result.book_name} {result.chapter}:{result.verse}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 font-scripture">
                                                    {matchIdx >= 0 ? (
                                                        <>
                                                            {text.slice(Math.max(0, matchIdx - 30), matchIdx)}
                                                            <span className="bg-yellow-200/60 text-foreground font-medium rounded-sm px-0.5">
                                                                {text.slice(matchIdx, matchIdx + lowerQuery.length)}
                                                            </span>
                                                            {text.slice(matchIdx + lowerQuery.length, matchIdx + lowerQuery.length + 80)}
                                                        </>
                                                    ) : (
                                                        text.slice(0, 120)
                                                    )}
                                                </p>
                                            </div>
                                            <ArrowRight className={`h-4 w-4 shrink-0 mt-1 transition-opacity ${i === selectedIndex ? "text-primary opacity-100" : "opacity-0"}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && !query.trim() && (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                <Search className="h-6 w-6 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">Type to search across all verses</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Use ↑↓ to navigate, Enter to select
                                </p>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-border/30 bg-muted/10">
                        <span className="text-[10px] text-muted-foreground tracking-wide">
                            Search powered by SQLite
                        </span>
                        <div className="flex items-center gap-2">
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border/50">
                                ↑↓
                            </kbd>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">navigate</span>
                            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border/50">
                                ↵
                            </kbd>
                            <span className="text-[10px] text-muted-foreground hidden sm:inline">select</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
