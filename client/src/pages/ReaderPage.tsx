import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { BookOpen, ChevronLeft, ChevronRight, Share2, AlignLeft, Columns, X, Filter, StickyNote, Search, Check, PieChart, Headphones, Clock, Star, ArrowLeft } from "lucide-react";
import type { Verse } from "@/lib/types";
import { AT_BIBLE_BOOKS } from "@/lib/bibleData";
import { BibleSelector, parseVerseFilter } from "@/components/BibleSelector";
const StudySidebar = lazy(() => import("@/components/StudySidebar").then(module => ({ default: module.StudySidebar })));
const SearchDialog = lazy(() => import("@/components/SearchDialog").then(module => ({ default: module.SearchDialog })));
const AudioPlayer = lazy(() => import("@/components/AudioPlayer").then(module => ({ default: module.AudioPlayer })));
import { VerseContextMenu } from "@/components/VerseContextMenu";
import { DataSettings } from "@/components/DataSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageWrapper } from "@/components/PageWrapper";
import { ReaderSettingsMenu } from "@/components/ReaderSettingsMenu";
import { useReaderSettings } from "@/hooks/useReaderSettings";
import { useBible } from "@/hooks/useBible";
import { useHighlights, useNotes, type HighlightColor } from "@/hooks/useHighlightsAndNotes";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useEditHistory } from "@/hooks/useEditHistory";
import { useFavourites } from "@/hooks/useFavourites";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SingleColumnView } from "@/components/reader/SingleColumnView";
import { ParallelView } from "@/components/reader/ParallelView";
import { ComparisonView } from "@/components/reader/ComparisonView";

type Version = "web" | "kjv" | "korean" | "chinese" | "both" | "interlinear" | "comparison";


export default function ReaderPage() {
    const params = useParams<{ book?: string; chapter?: string }>();
    const book = params.book || "genesis";
    const chapterParam = parseInt(params.chapter || "1", 10);
    const chapter = isNaN(chapterParam) || chapterParam < 1 ? 1 : chapterParam;
    const searchString = useSearch();
    const [, navigate] = useLocation();

    // Parse verse filter from URL: ?v=1-5,7,12
    const searchParams = new URLSearchParams(searchString);
    const verseFilterParam = searchParams.get("v") || "";
    const verseFilter = useMemo(() => parseVerseFilter(verseFilterParam), [verseFilterParam]);
    const hasFilter = verseFilter.size > 0;

    const [version, setVersion] = useState<Version>("web");
    const [selectedVerse, setSelectedVerse] = useState<{ id: number; ref: string } | null>(null);
    const [sidebarTab, setSidebarTab] = useState<string | undefined>();
    const [strongsId, setStrongsId] = useState<string | undefined>();

    const { data: verses, isLoading, error } = useBible(book, chapter);

    // Highlights & Notes
    const { highlightMap, setHighlight, setHighlightLabel, removeHighlight } = useHighlights(book, chapter);
    const { noteMap, saveNote, deleteNote } = useNotes(book, chapter);
    const { isRead, toggleChapter } = useReadingProgress();
    const { addEntry } = useEditHistory();
    const { isFavourite, toggleFavourite } = useFavourites();
    const { recordVisit } = useReadingHistory();

    // Build a favourites set for efficient lookup in child views
    const favouriteSet = useMemo(() => {
        if (!verses) return new Set<number>();
        return new Set(verses.filter(v => isFavourite(v.id)).map(v => v.id));
    }, [verses, isFavourite]);

    // Derived state
    const { settings } = useReaderSettings();
    const leadingClass = {
        "tight": "leading-snug",
        "normal": "leading-relaxed",
        "loose": "leading-loose"
    }[settings.lineSpacing] || "leading-relaxed";
    const typographyClasses = `font-${settings.fontFamily} text-${settings.fontSize} ${leadingClass}`;

    const bookTitle = verses?.[0]?.book_name || book;
    const isChapterRead = isRead(book, chapter);
    const [contextMenu, setContextMenu] = useState<{
        x: number; y: number;
        verseId: number; verseRef: string;
        verseText: string;
        bookSlug: string; chapter: number; verse: number;
    } | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [audioOpen, setAudioOpen] = useState(false);

    // Cross-reference back-navigation
    const [backRef, setBackRef] = useState<{ path: string; label: string } | null>(null);
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("crossref-back");
            if (stored) {
                const parsed = JSON.parse(stored);
                // Only show if we're on a different page than where we came from
                const currentPath = window.location.pathname + window.location.search;
                if (parsed.path && parsed.path !== currentPath) {
                    setBackRef(parsed);
                } else {
                    sessionStorage.removeItem("crossref-back");
                }
            }
        } catch { /* ignore parse errors */ }
    }, [book, chapter, verseFilterParam]);

    // Audio Text Logic
    const textToPlay = useMemo(() => {
        if (!verses) return "";
        return verses.map(v => {
            const text = version === "kjv" ? v.text_kjv : version === "korean" ? v.text_korean : version === "chinese" ? v.text_chinese : v.text_web;
            return text;
        }).join(" ");
    }, [verses, version]);


    // Filter verses based on URL param
    const displayedVerses = useMemo(() => {
        if (!verses || !hasFilter) return verses;
        return verses.filter(v => verseFilter.has(v.verse));
    }, [verses, verseFilter, hasFilter]);

    const clearFilter = () => {
        navigate(`/read/${book}/${chapter}`);
    };

    // Scroll to top on chapter change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [book, chapter]);

    // Auto-record visit when chapter loads
    useEffect(() => {
        if (verses && verses.length > 0) {
            const bookName = verses[0]?.book_name || book;
            recordVisit({ bookSlug: book, bookName, chapter });
        }
    }, [book, chapter, verses, recordVisit]);

    // Auto-mark-read when scrolled to bottom
    const autoMarkRef = useRef(false);
    useEffect(() => {
        autoMarkRef.current = false; // Reset on chapter change
    }, [book, chapter]);

    const bottomSentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const sentinel = bottomSentinelRef.current;
        if (!sentinel || !verses || verses.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !autoMarkRef.current && !isChapterRead) {
                    autoMarkRef.current = true;
                    toggleChapter.mutate({ book, chapter });
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [book, chapter, verses, isChapterRead, toggleChapter]);

    // Smooth scroll to filtered verse
    useEffect(() => {
        if (hasFilter && verseFilterParam) {
            const firstVerse = verseFilterParam.split(",")[0]?.split("-")[0];
            if (firstVerse) {
                setTimeout(() => {
                    const el = document.querySelector(`[data-verse="${firstVerse}"]`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
            }
        }
    }, [hasFilter, verseFilterParam]);

    // ─── Keyboard Shortcuts ──────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't fire if user is typing in an input/textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === "ArrowLeft" && chapter > 1) {
                navigate(`/read/${book}/${chapter - 1}`);
            } else if (e.key === "ArrowRight") {
                navigate(`/read/${book}/${chapter + 1}`);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [book, chapter, navigate]);

    const handleVerseClick = (v: Verse) => {
        setSelectedVerse({
            id: v.id,
            ref: `${v.book_name} ${v.chapter}:${v.verse}`
        });
    };

    const handleVerseRightClick = useCallback((e: React.MouseEvent, v: Verse) => {
        e.preventDefault();
        const text = (version === "kjv" ? v.text_kjv : v.text_web) || v.text_primary || "";
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            verseId: v.id,
            verseRef: `${v.book_name} ${v.chapter}:${v.verse}`,
            verseText: text,
            bookSlug: book,
            chapter: v.chapter,
            verse: v.verse,
        });
    }, [version, book]);

    // ─── Context Menu Handlers (with history logging) ────────────────

    const handleHighlight = (color: HighlightColor) => {
        if (!contextMenu) return;
        setHighlight.mutate({ verseId: contextMenu.verseId, color });
        addEntry({
            action: "highlight_add",
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            details: `Highlighted ${color}`,
        });
    };

    const handleRemoveHighlight = () => {
        if (!contextMenu) return;
        removeHighlight.mutate(contextMenu.verseId);
        addEntry({
            action: "highlight_remove",
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            details: "Removed highlight",
        });
    };

    const handleSetLabel = (label?: string) => {
        if (!contextMenu) return;
        setHighlightLabel.mutate({ verseId: contextMenu.verseId, label });
        if (label) {
            addEntry({
                action: "highlight_label",
                verseId: contextMenu.verseId,
                verseRef: contextMenu.verseRef,
                bookSlug: contextMenu.bookSlug,
                chapter: contextMenu.chapter,
                details: `Labelled as "${label}"`,
            });
        }
    };

    const handleSaveNote = (text: string) => {
        if (!contextMenu) return;
        const hadNote = noteMap.has(contextMenu.verseId);
        const isEmpty = !text || !text.trim();
        saveNote.mutate({ verseId: contextMenu.verseId, text });
        addEntry({
            action: isEmpty ? "note_delete" : hadNote ? "note_edit" : "note_add",
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            details: isEmpty ? "Deleted note" : hadNote ? "Edited note" : `Added note: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        });
    };

    const handleDeleteNote = () => {
        if (!contextMenu) return;
        deleteNote.mutate(contextMenu.verseId);
        addEntry({
            action: "note_delete",
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            details: "Deleted note",
        });
    };

    const handleToggleFavourite = () => {
        if (!contextMenu) return;
        const wasFav = isFavourite(contextMenu.verseId);
        toggleFavourite({
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            verse: contextMenu.verse,
            bookOrder: AT_BIBLE_BOOKS.findIndex(b => b.slug === contextMenu.bookSlug) + 1,
            text: contextMenu.verseText.slice(0, 120),
        });
        addEntry({
            action: wasFav ? "favourite_remove" : "favourite_add",
            verseId: contextMenu.verseId,
            verseRef: contextMenu.verseRef,
            bookSlug: contextMenu.bookSlug,
            chapter: contextMenu.chapter,
            details: wasFav ? "Removed from favourites" : "Added to favourites",
        });
    };

    const displayTitle = book.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    return (
        <PageWrapper className="bg-background font-sans">
            {/* ─── Topbar ───────────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-2.5 border-b bg-background/95 backdrop-blur-md shadow-sm relative">
                {/* Left: Logo */}
                <div className="flex items-center gap-3 z-10">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <BookOpen size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                </div>

                {/* Center: Prev / BibleSelector / Next */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
                    <NavButton href={`/read/${book}/${Math.max(1, chapter - 1)}`} icon={<ChevronLeft size={16} />} disabled={chapter <= 1} />
                    <BibleSelector currentBook={book} currentChapter={chapter} currentVerseFilter={verseFilterParam} />
                    <NavButton href={`/read/${book}/${chapter + 1}`} icon={<ChevronRight size={16} />} />
                </div>

                {/* Right: Version toggle + tools */}
                <div className="flex items-center gap-1.5 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 px-0 sm:w-auto sm:px-3 gap-2">
                                {version === "both" ? <Columns size={16} /> : <AlignLeft size={16} />}
                                <span className="hidden sm:inline uppercase text-[10px] font-bold tracking-wider">
                                    {version === "both" ? "Parallel" : version === "interlinear" ? "Interlinear" : version === "korean" ? "Korean" : version === "comparison" ? "Compare" : version}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setVersion("web")} className="justify-between">
                                WEB (Modern) {version === "web" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVersion("kjv")} className="justify-between">
                                KJV (Classic) {version === "kjv" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVersion("korean")} className="justify-between">
                                KRV (Korean) {version === "korean" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVersion("chinese")} className="justify-between">
                                CUV (Chinese) {version === "chinese" && "✓"}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setVersion("both")} className="justify-between">
                                Parallel View {version === "both" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setVersion("interlinear")} className="justify-between">
                                Interlinear Mode {version === "interlinear" && "✓"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVersion("comparison")} className="justify-between">
                                WEB vs KJV Diff {version === "comparison" && "✓"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => setSearchOpen(true)} title="Search (Ctrl+K)">
                        <Search size={16} />
                    </Button>

                    <Link href="/plans">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" title="My Progress">
                            <PieChart size={16} />
                        </Button>
                    </Link>

                    <Link href="/journal">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" title="Study Journal">
                            <StickyNote size={16} />
                        </Button>
                    </Link>

                    <Link href="/favourites">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" title="Favourites">
                            <Star size={16} />
                        </Button>
                    </Link>

                    <Link href="/activity">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" title="Activity Log">
                            <Clock size={16} />
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={audioOpen ? "text-primary bg-primary/10" : "text-muted-foreground"}
                        onClick={() => setAudioOpen(!audioOpen)}
                        title="Listen to Chapter"
                    >
                        <Headphones size={16} />
                    </Button>

                    <ReaderSettingsMenu />
                    <ThemeToggle />
                    <DataSettings />

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                        <Share2 size={16} />
                    </Button>
                </div>
            </header>

            {/* ─── Cross-Ref Back Button ──────────────────────────────── */}
            {backRef && (
                <div className="sticky top-[52px] z-15 flex justify-center py-1.5 pointer-events-none">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem("crossref-back");
                            setBackRef(null);
                            navigate(backRef.path);
                        }}
                        className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                    >
                        <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to {backRef.label}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                sessionStorage.removeItem("crossref-back");
                                setBackRef(null);
                            }}
                            className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 cursor-pointer"
                        >
                            <X size={10} />
                        </span>
                    </button>
                </div>
            )}

            {/* ─── Content ──────────────────────────────────────────────── */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading scripture…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="bg-destructive/10 p-4 rounded-full text-destructive mb-4">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Could not load scripture</h3>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Please check your connection or try another book.
                        </p>
                        <Link href="/">
                            <Button>Return Home</Button>
                        </Link>
                    </div>
                ) : verses && verses.length > 0 ? (
                    <div className={`transition-all duration-300 ${version === "both" || version === "comparison" ? "max-w-6xl" : "max-w-3xl mx-auto"}`}>
                        {version === "comparison" ? (
                            <ComparisonView
                                verses={displayedVerses || []}
                                chapter={chapter}
                                displayTitle={displayTitle}
                            />
                        ) : version === "both" ? (
                            <ParallelView
                                verses={displayedVerses || []}
                                chapter={chapter}
                                book={book}
                                displayTitle={displayTitle}
                                selectedVerseId={selectedVerse?.id || null}
                                highlightMap={highlightMap}
                                noteMap={noteMap}
                                favouriteSet={favouriteSet}
                                isChapterRead={isChapterRead}
                                typographyClasses={typographyClasses}
                                redLetters={settings.redLetters}
                                onVerseClick={handleVerseClick}
                                onVerseRightClick={handleVerseRightClick}
                                onToggleRead={() => toggleChapter.mutate({ book, chapter })}
                            />
                        ) : (
                            <SingleColumnView
                                verses={displayedVerses || []}
                                chapter={chapter}
                                book={book}
                                displayTitle={displayTitle}
                                version={version as "web" | "kjv" | "korean" | "chinese" | "interlinear"}

                                selectedVerseId={selectedVerse?.id || null}
                                highlightMap={highlightMap}
                                noteMap={noteMap}
                                favouriteSet={favouriteSet}
                                isChapterRead={isChapterRead}
                                hasFilter={hasFilter}
                                verseFilterParam={verseFilterParam}
                                typographyClasses={typographyClasses}
                                redLetters={settings.redLetters}
                                onVerseClick={handleVerseClick}
                                onWordClick={(v, s) => {
                                    setSelectedVerse({ id: v.id, ref: `${v.book_name} ${v.chapter}:${v.verse}` });
                                    setSidebarTab("lexicon");
                                    setStrongsId(s);
                                }}
                                onVerseRightClick={handleVerseRightClick}
                                onToggleRead={() => toggleChapter.mutate({ book, chapter })}
                                onClearFilter={clearFilter}
                            />

                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-xl shadow-sm border border-border">
                        <div className="bg-muted p-4 rounded-full inline-flex mb-4">
                            <BookOpen className="text-muted-foreground" size={24} />
                        </div>
                        <p className="text-lg text-foreground font-medium mb-2">No verses found</p>
                        <p className="text-muted-foreground text-sm">
                            We couldn't find <strong className="capitalize text-foreground">{displayTitle} {chapter}</strong>.
                        </p>
                    </div>
                )}

                {/* Invisible sentinel for scroll-to-bottom auto-mark-read */}
                <div ref={bottomSentinelRef} className="h-1" aria-hidden="true" />
            </main>

            <Suspense fallback={null}>
                <StudySidebar
                    verseId={selectedVerse?.id || null}
                    verseRef={selectedVerse?.ref || ""}
                    initialTab={sidebarTab}
                    strongsId={strongsId}
                    onClose={() => {
                        setSelectedVerse(null);
                        setSidebarTab(undefined);
                        setStrongsId(undefined);
                    }}
                />

                {/* Verse Context Menu (right-click) */}
                {contextMenu && (
                    <VerseContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        verseId={contextMenu.verseId}
                        verseRef={contextMenu.verseRef}
                        verseText={contextMenu.verseText}
                        currentHighlight={highlightMap.get(contextMenu.verseId)?.color}
                        currentLabel={highlightMap.get(contextMenu.verseId)?.label}
                        currentNote={noteMap.get(contextMenu.verseId)}
                        isFavourite={isFavourite(contextMenu.verseId)}
                        onHighlight={handleHighlight}
                        onRemoveHighlight={handleRemoveHighlight}
                        onSetLabel={handleSetLabel}
                        onSaveNote={handleSaveNote}
                        onDeleteNote={handleDeleteNote}
                        onToggleFavourite={handleToggleFavourite}
                        onClose={() => setContextMenu(null)}
                    />
                )}

                <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

                <AudioPlayer
                    text={textToPlay}
                    title={`${displayTitle} ${chapter}`}
                    isOpen={audioOpen}
                    onClose={() => setAudioOpen(false)}
                />
            </Suspense>
        </PageWrapper>
    );
}

function NavButton({ href, icon, disabled }: { href: string; icon: React.ReactNode; disabled?: boolean }) {
    if (disabled) {
        return <Button variant="ghost" size="icon" disabled className="h-8 w-8 opacity-30">{icon}</Button>;
    }
    return (
        <Link href={href}>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background hover:text-primary hover:shadow-sm">{icon}</Button>
        </Link>
    );
}
