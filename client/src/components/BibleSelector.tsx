import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronDown, Check, Search, ChevronLeft, X, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useReadingProgress } from "@/hooks/useReadingProgress";

interface BibleSelectorProps {
    currentBook: string;
    currentChapter: number;
    currentVerseFilter?: string; // e.g. "1-5,7,12"
}

type Step = "book" | "chapter" | "verse";

/**
 * Parse a verse filter string like "1-5,7,12-15" into a Set of verse numbers.
 */
export function parseVerseFilter(filter: string): Set<number> {
    const result = new Set<number>();
    if (!filter || !filter.trim()) return result;

    const parts = filter.split(",").map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        if (part.includes("-")) {
            const [startStr, endStr] = part.split("-");
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) result.add(i);
            }
        } else {
            const num = parseInt(part, 10);
            if (!isNaN(num)) result.add(num);
        }
    }
    return result;
}

/**
 * Convert a Set of verse numbers to a compact range string.
 * e.g. {1,2,3,5,7,8,9} → "1-3,5,7-9"
 */
function versesToRangeString(verses: Set<number>): string {
    if (verses.size === 0) return "";
    const sorted = Array.from(verses).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
            start = sorted[i];
            end = sorted[i];
        }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(",");
}

export function BibleSelector({ currentBook, currentChapter, currentVerseFilter }: BibleSelectorProps) {
    const { isRead } = useReadingProgress();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("book");
    const [selectedBookSlug, setSelectedBookSlug] = useState<string>(currentBook);
    const [selectedChapter, setSelectedChapter] = useState<number>(currentChapter);
    const [search, setSearch] = useState("");
    const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
    const [rangeInput, setRangeInput] = useState("");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [, navigate] = useLocation();

    const { data: books } = useQuery<Book[]>({
        queryKey: ["books"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/books");
            return res.json();
        }
    });

    // Sync internal state when closing or on prop change
    useEffect(() => {
        if (!open) {
            setSelectedBookSlug(currentBook);
            setSelectedChapter(currentChapter);
            setSearch("");
            setStep("book");
            setSelectedVerses(new Set());
            setRangeInput(currentVerseFilter || "");
        }
    }, [currentBook, currentChapter, currentVerseFilter, open]);

    const activeBook = books?.find(b => b.slug === selectedBookSlug);

    const filteredBooks = books?.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    // Get verse count for the selected chapter (we'll estimate from the API or use a max)
    const { data: chapterVerses } = useQuery<any[]>({
        queryKey: ["verses", selectedBookSlug, selectedChapter],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/bible/${selectedBookSlug}/${selectedChapter}`);
            return res.json();
        },
        enabled: step === "verse" && !!selectedBookSlug && selectedChapter > 0
    });

    const verseCount = chapterVerses?.length || 0;

    const handleBookSelect = (slug: string) => {
        setSelectedBookSlug(slug);
        // Stay on "book" step — chapters are shown in the right column
    };

    const handleChapterSelect = (chap: number) => {
        if (isSelectionMode) {
            setSelectedChapter(chap);
            setSelectedVerses(new Set());
            setRangeInput("");
            setStep("verse");
        } else {
            // Navigate directly to the chapter — no verse picker step
            navigate(`/read/${selectedBookSlug}/${chap}`);
            setOpen(false);
        }
    };

    const toggleVerse = (v: number) => {
        setSelectedVerses(prev => {
            const next = new Set(prev);
            if (next.has(v)) next.delete(v);
            else next.add(v);
            setRangeInput(versesToRangeString(next));
            return next;
        });
    };

    const handleRangeInputChange = (value: string) => {
        setRangeInput(value);
        // Live-parse into selectedVerses for visual feedback
        setSelectedVerses(parseVerseFilter(value));
    };

    const navigateToSelection = useCallback(() => {
        const base = `/read/${selectedBookSlug}/${selectedChapter}`;
        const filter = rangeInput.trim();
        const url = filter ? `${base}?v=${encodeURIComponent(filter)}` : base;
        navigate(url);
        setOpen(false);
    }, [selectedBookSlug, selectedChapter, rangeInput, navigate]);

    const navigateToChapterAll = useCallback((bookSlug: string, chap: number) => {
        navigate(`/read/${bookSlug}/${chap}`);
        setOpen(false);
    }, [navigate]);

    // Build the display label
    const displayLabel = currentVerseFilter
        ? `${currentBook.replace(/-/g, " ")} ${currentChapter}:${currentVerseFilter}`
        : `${currentBook.replace(/-/g, " ")} ${currentChapter}`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="h-auto py-1 px-2 font-serif text-lg font-bold capitalize hover:bg-muted/50 gap-2">
                    <span className="flex flex-col items-center leading-none">
                        <span>{displayLabel}</span>
                        <span className="text-[10px] font-sans text-muted-foreground font-normal tracking-widest uppercase">
                            {currentVerseFilter ? "Filtered" : "Select Passage"}
                        </span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[85vw] max-w-[650px] p-0 shadow-xl bg-card border-border/60" align="center" sideOffset={8}>

                {/* ─── Step 1: Book Selection ─── */}
                {step === "book" && (
                    <div className="flex h-[420px] divide-x divide-border/50">
                        {/* Books Column */}
                        <div className="w-1/2 flex flex-col bg-muted/10">
                            <div className="p-3 border-b border-border/50">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search books..."
                                        className="pl-8 bg-background border-border/50 h-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="flex flex-col p-2 gap-0.5">
                                    {filteredBooks?.map((book) => (
                                        <Button
                                            key={book.slug}
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "justify-between font-normal text-left h-8",
                                                selectedBookSlug === book.slug && "bg-primary/10 text-primary font-bold"
                                            )}
                                            onClick={() => handleBookSelect(book.slug)}
                                        >
                                            <span className="truncate">{book.name}</span>
                                            {selectedBookSlug === book.slug && <Check className="h-3 w-3 shrink-0" />}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Chapters Column */}
                        <div className="w-1/2 flex flex-col bg-background">
                            <div className="p-3 border-b border-border/50 flex items-center justify-between h-[61px]">
                                <span className="font-semibold text-sm">
                                    {activeBook?.name || "Select a Book"}
                                </span>
                                {activeBook && (
                                    <Button
                                        variant={isSelectionMode ? "secondary" : "ghost"}
                                        size="sm"
                                        className={cn(
                                            "h-7 text-xs gap-1.5 transition-colors",
                                            isSelectionMode ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                                        )}
                                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                                        title="Toggle Verse Selection Mode"
                                    >
                                        <Filter size={12} className={isSelectionMode ? "fill-current" : ""} />
                                        {isSelectionMode ? "Filtering On" : "Filter Verses"}
                                    </Button>
                                )}
                            </div>
                            <ScrollArea className="flex-1">
                                {activeBook ? (
                                    <div className="grid grid-cols-5 gap-2 p-4">
                                        {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map((chap) => {
                                            const isCompleted = isRead(activeBook.slug, chap);
                                            const isActive = activeBook.slug === currentBook && chap === currentChapter;

                                            return (
                                                <button
                                                    key={chap}
                                                    className={cn(
                                                        "flex items-center justify-center aspect-square rounded-md text-sm transition-all hover:scale-105 relative",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground font-bold shadow-md"
                                                            : isCompleted
                                                                ? "bg-green-500/10 text-green-700 dark:text-green-400 font-medium ring-1 ring-green-500/20"
                                                                : "bg-muted/30 hover:bg-primary/20 hover:text-primary text-muted-foreground"
                                                    )}
                                                    onClick={() => handleChapterSelect(chap)}
                                                >
                                                    {chap}
                                                    {isCompleted && !isActive && (
                                                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-8 text-center">
                                        Select a book to view chapters
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {/* ─── Step 2: Verse Selection ─── */}
                {step === "verse" && (
                    <div className="flex flex-col h-[420px]">
                        {/* Header */}
                        <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/10">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setStep("book")}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex-1">
                                <span className="font-semibold text-sm capitalize">
                                    {activeBook?.name || selectedBookSlug.replace(/-/g, " ")} — Chapter {selectedChapter}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {verseCount > 0 && `${verseCount} verses`}
                                </span>
                            </div>
                            {selectedVerses.size > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground"
                                    onClick={() => { setSelectedVerses(new Set()); setRangeInput(""); }}
                                >
                                    <X className="h-3 w-3 mr-1" /> Clear
                                </Button>
                            )}
                        </div>

                        {/* Range Input */}
                        <div className="px-3 py-2 border-b border-border/30 bg-muted/5">
                            <div className="relative">
                                <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Type range: 1-5, 7, 12-15 or leave empty for all"
                                    className="pl-8 bg-background border-border/50 h-9 font-mono text-sm"
                                    value={rangeInput}
                                    onChange={(e) => handleRangeInputChange(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") navigateToSelection(); }}
                                />
                            </div>
                        </div>

                        {/* Verse Grid */}
                        <ScrollArea className="flex-1">
                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-3">
                                {verseCount > 0 ? (
                                    Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => {
                                        const isSelected = selectedVerses.has(v);
                                        return (
                                            <button
                                                key={v}
                                                className={cn(
                                                    "flex items-center justify-center w-full aspect-square rounded-md text-xs font-medium transition-all hover:scale-105",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/50"
                                                        : "bg-muted/20 hover:bg-primary/15 hover:text-primary text-muted-foreground"
                                                )}
                                                onClick={() => toggleVerse(v)}
                                            >
                                                {v}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mb-2" />
                                        <p>Loading verses...</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-2 p-3 border-t border-border/50 bg-muted/10">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-1"
                                onClick={() => navigateToChapterAll(selectedBookSlug, selectedChapter)}
                            >
                                Show All Verses
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 gap-1"
                                disabled={selectedVerses.size === 0}
                                onClick={navigateToSelection}
                            >
                                <Filter className="h-3 w-3" />
                                Show {selectedVerses.size > 0 ? `${selectedVerses.size} verse${selectedVerses.size > 1 ? "s" : ""}` : "Selected"}
                            </Button>
                        </div>
                    </div>
                )}

            </PopoverContent>
        </Popover>
    );
}
