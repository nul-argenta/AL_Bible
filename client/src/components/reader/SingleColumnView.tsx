import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Check, Filter, X, StickyNote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Verse } from "@/lib/types";
import { getHighlightStyle, getHighlightLabel } from "@/hooks/useHighlightsAndNotes";

interface HighlightEntry {
    color: string;
    label?: string;
}

interface SingleColumnViewProps {
    verses: Verse[];
    chapter: number;
    book: string;
    displayTitle: string;
    version: "web" | "kjv" | "korean" | "chinese" | "interlinear";

    selectedVerseId: number | null;
    highlightMap: Map<number, HighlightEntry>;
    noteMap: Map<number, string>;
    favouriteSet: Set<number>;
    isChapterRead: boolean;
    hasFilter: boolean;
    verseFilterParam: string;
    typographyClasses: string;
    redLetters: boolean;
    onVerseClick: (v: Verse) => void;
    onWordClick?: (v: Verse, strongs: string) => void;
    onVerseRightClick: (e: React.MouseEvent, v: Verse) => void;
    onToggleRead: () => void;
    onClearFilter: () => void;
}

export function SingleColumnView({
    verses,
    chapter,
    book,
    displayTitle,
    version,
    selectedVerseId,
    highlightMap,
    noteMap,
    favouriteSet,
    isChapterRead,
    hasFilter,
    verseFilterParam,
    typographyClasses,
    redLetters,
    onVerseClick,
    onWordClick,
    onVerseRightClick,
    onToggleRead,
    onClearFilter
}: SingleColumnViewProps) {
    return (
        <div className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
            {/* Chapter Header */}
            <div className="px-8 sm:px-12 pt-10 pb-6 border-b border-border/30 bg-muted/20">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                    {displayTitle}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-muted-foreground tracking-widest uppercase font-medium">
                        Chapter {chapter}
                    </p>
                    {hasFilter && (
                        <button
                            onClick={onClearFilter}
                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
                        >
                            <Filter className="h-3 w-3" />
                            Verses {verseFilterParam}
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Verse Body */}
            <div className="px-8 sm:px-12 py-8 sm:py-10">
                <div className="space-y-0">
                    {verses.map((v, i) => {
                        const isSelected = selectedVerseId === v.id;
                        const showBreak = i > 0 && v.verse % 5 === 1;
                        const hlEntry = highlightMap.get(v.id);
                        const hlStyle = hlEntry ? getHighlightStyle(hlEntry.color) : null;
                        const hlLabel = hlEntry ? getHighlightLabel(hlEntry.label) : null;
                        const hasNote = noteMap.has(v.id);
                        const isFav = favouriteSet.has(v.id);

                        return (
                            <span key={v.id}>
                                {showBreak && <span className="block h-4" />}
                                <span
                                    className={`
                                        inline cursor-pointer transition-colors duration-150 rounded-sm relative
                                        ${isSelected
                                            ? "bg-primary/15 text-primary ring-1 ring-primary/20 px-0.5 -mx-0.5"
                                            : hlStyle
                                                ? `${hlStyle.bg} px-0.5 -mx-0.5`
                                                : "hover:bg-muted/60"}
                                    `}
                                    onClick={() => onVerseClick(v)}
                                    onContextMenu={(e) => onVerseRightClick(e, v)}
                                >
                                    <sup className="verse-number">{v.verse}</sup>
                                    <span className={`font-scripture ${typographyClasses}`}>
                                        {(() => {
                                            if (version === "interlinear" && v.interlinear_data) {
                                                try {
                                                    const parts = JSON.parse(v.interlinear_data) as { e: string, s: string, o?: string }[];
                                                    return (
                                                        <span className="flex flex-col gap-1 pb-3">
                                                            <span className="inline-flex flex-wrap gap-x-2.5 gap-y-3 pt-3 pb-1 align-top items-end leading-none">
                                                                {parts.map((p, pIdx) => (
                                                                    <span
                                                                        key={pIdx}
                                                                        className="inline-flex flex-col items-center group cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (onWordClick) onWordClick(v, p.s);
                                                                        }}
                                                                    >
                                                                        <span className="text-xs text-muted-foreground/80 mb-1 group-hover:text-primary transition-colors min-h-[16px] text-center max-w-[80px]">
                                                                            {p.o ? (
                                                                                <span className={p.s.startsWith('H') ? 'font-hebrew text-sm' : 'font-greek text-sm'}>{p.o}</span>
                                                                            ) : (
                                                                                (p.e || "").replace(/[.,?;:!]/g, "")
                                                                            )}
                                                                        </span>
                                                                        <span className="text-[13px] font-bold text-foreground/90 group-hover:text-primary transition-colors">{p.e}</span>
                                                                        <span className="text-[10px] text-primary/60 font-mono mt-0.5 group-hover:text-primary transition-colors tracking-tighter">{p.s}</span>
                                                                    </span>
                                                                ))}
                                                            </span>
                                                            {v.text_korean && (
                                                                <span className="font-sans font-medium text-[14px] leading-relaxed text-muted-foreground/90 tracking-wide mt-1 pl-2 border-l-2 border-primary/30">
                                                                    {v.text_korean}
                                                                </span>
                                                            )}
                                                            {v.text_chinese && (
                                                                <span className="font-sans font-medium text-[14px] leading-relaxed text-muted-foreground/90 tracking-wide mt-1 mb-2 pl-2 border-l-2 border-secondary/30">
                                                                    {v.text_chinese}
                                                                </span>
                                                            )}
                                                        </span>
                                                    );
                                                } catch (e) {
                                                    console.error("Failed to parse interlinear", e);
                                                    return (v.text_web || v.text_primary);
                                                }
                                            }

                                            const text = (version === "web" ? v.text_web : version === "kjv" ? v.text_kjv : version === "korean" ? v.text_korean : version === "chinese" ? v.text_chinese : v.text_primary) || v.text_primary;


                                            // Red Letter Rendering Logic
                                            // This is a naive split based on quotation marks. Real "Words of Christ" 
                                            // usually requires a dedicated dataset or tagging per word/phrase. 
                                            // For this MVP, we will try to loosely catch quotes in the Gospels.
                                            if (redLetters && ["matthew", "mark", "luke", "john", "revelation", "acts"].includes(book.toLowerCase())) {
                                                // Split by double quotes
                                                const parts = text.split(/(".*?")/g);
                                                return parts.map((part: string, idx: number) => {
                                                    if (part.startsWith('"') && part.endsWith('"')) {
                                                        return <span key={idx} className="text-red-600 dark:text-red-400">{part}</span>;
                                                    }
                                                    return <span key={idx}>{part}</span>;
                                                });
                                            }

                                            return text;
                                        })()}
                                    </span>
                                    {isFav && (
                                        <Star className="inline h-3 w-3 ml-0.5 text-amber-500 fill-amber-500" />
                                    )}
                                    {hasNote && (
                                        <StickyNote className="inline h-3 w-3 ml-0.5 text-amber-500/70" />
                                    )}
                                    {hlLabel && (
                                        <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0 rounded-full text-[9px] font-bold tracking-wide bg-primary/10 text-primary align-middle">
                                            <span>{hlLabel.emoji}</span>
                                            {hlLabel.name}
                                        </span>
                                    )}
                                </span>{" "}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Footer Nav */}
            <div className="flex justify-between items-center px-8 sm:px-12 py-6 border-t border-border/30 bg-muted/10">
                <Link href={`/read/${book}/${Math.max(1, chapter - 1)}`}>
                    <Button variant="ghost" disabled={chapter <= 1} className="gap-2">
                        <ChevronLeft size={16} /> Previous
                    </Button>
                </Link>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        {displayTitle} {chapter}
                    </span>
                    <Button
                        variant={isChapterRead ? "default" : "outline"}
                        size="sm"
                        className={`gap-2 h-8 ${isChapterRead ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}`}
                        onClick={onToggleRead}
                    >
                        <Check size={14} className={isChapterRead ? "opacity-100" : "opacity-40"} />
                        {isChapterRead ? "Read" : "Mark Read"}
                    </Button>
                </div>

                <Link href={`/read/${book}/${chapter + 1}`}>
                    <Button variant="outline" className="gap-2">
                        Next <ChevronRight size={16} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
