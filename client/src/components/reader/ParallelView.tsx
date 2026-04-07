import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Check, StickyNote, Star, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Verse } from "@/lib/types";
import { getHighlightStyle, getHighlightLabel } from "@/hooks/useHighlightsAndNotes";

interface HighlightEntry {
    color: string;
    label?: string;
}

interface ParallelViewProps {
    verses: Verse[];
    chapter: number;
    book: string;
    displayTitle: string;
    selectedVerseId: number | null;
    highlightMap: Map<number, HighlightEntry>;
    noteMap: Map<number, string>;
    favouriteSet: Set<number>;
    isChapterRead: boolean;
    typographyClasses: string;
    redLetters: boolean;
    onVerseClick: (v: Verse) => void;
    onVerseRightClick: (e: React.MouseEvent, v: Verse) => void;
    onToggleRead: () => void;
}

export function ParallelView({
    verses,
    chapter,
    book,
    displayTitle,
    selectedVerseId,
    highlightMap,
    noteMap,
    favouriteSet,
    isChapterRead,
    typographyClasses,
    redLetters,
    onVerseClick,
    onVerseRightClick,
    onToggleRead,
}: ParallelViewProps) {
    const [secondLang, setSecondLang] = useState<"korean" | "chinese">("chinese");

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WEB Column */}
                <div className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/30 bg-muted/20">
                        <h3 className="font-serif text-lg font-bold text-foreground">{displayTitle} {chapter}</h3>
                        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">World English Bible</span>
                    </div>
                    <div className="px-6 py-6 space-y-3">
                        {verses.map((v) => {
                            const isSelected = selectedVerseId === v.id;
                            const hlEntry = highlightMap.get(v.id);
                            const hlStyle = hlEntry ? getHighlightStyle(hlEntry.color) : null;
                            const hlLabel = hlEntry ? getHighlightLabel(hlEntry.label) : null;
                            const hasNote = noteMap.has(v.id);
                            const isFav = favouriteSet.has(v.id);
                            return (
                                <div
                                    key={`web-${v.id}`}
                                    className={`flex gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${isSelected ? "bg-primary/10 ring-1 ring-primary/20" : hlStyle ? hlStyle.bg : "hover:bg-muted/40"}`}
                                    onClick={() => onVerseClick(v)}
                                    onContextMenu={(e) => onVerseRightClick(e, v)}
                                >
                                    <span className="verse-number shrink-0 w-6 text-right pt-0.5">{v.verse}</span>
                                    <span className={`font-scripture ${typographyClasses}`}>
                                        {(() => {
                                            const text = v.text_web || v.text_primary || "";
                                            if (redLetters && ["matthew", "mark", "luke", "john", "revelation", "acts"].includes(book.toLowerCase())) {
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
                                        {isFav && <Star className="inline h-3 w-3 ml-1 text-amber-500 fill-amber-500" />}
                                        {hasNote && <StickyNote className="inline h-3 w-3 ml-1 text-amber-500/70" />}
                                        {hlLabel && (
                                            <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0 rounded-full text-[9px] font-bold tracking-wide bg-primary/10 text-primary align-middle">
                                                <span>{hlLabel.emoji}</span>
                                                {hlLabel.name}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Secondary Column (Korean/Chinese Toggle) */}
                <div className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/30 bg-muted/20 flex justify-between items-center">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-foreground">{displayTitle} {chapter}</h3>
                            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                {secondLang === "korean" ? "Korean (KRV)" : "Chinese (Union)"}
                            </span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-2 text-primary" 
                            onClick={() => setSecondLang(prev => prev === "korean" ? "chinese" : "korean")}
                        >
                            <Languages size={14} />
                            <span className="text-[10px] uppercase font-bold tracking-tighter">Switch to {secondLang === "korean" ? "Chinese" : "Korean"}</span>
                        </Button>
                    </div>
                    <div className="px-6 py-6 space-y-3">
                        {verses.map((v) => {
                            const isSelected = selectedVerseId === v.id;
                            const hlEntry = highlightMap.get(v.id);
                            const hlStyle = hlEntry ? getHighlightStyle(hlEntry.color) : null;
                            const text = secondLang === "korean" ? v.text_korean : v.text_chinese;
                            
                            return (
                                <div
                                    key={`second-${v.id}`}
                                    className={`flex gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${isSelected ? "bg-primary/10 ring-1 ring-primary/20" : hlStyle ? hlStyle.bg : "hover:bg-muted/40"}`}
                                    onClick={() => onVerseClick(v)}
                                    onContextMenu={(e) => onVerseRightClick(e, v)}
                                >
                                    <span className="verse-number shrink-0 w-6 text-right pt-0.5">{v.verse}</span>
                                    <span className={`font-sans font-medium text-[15px] leading-[1.8] text-foreground/90 tracking-wide`}>
                                        {text || <span className="text-muted-foreground italic text-xs">Translation unavailable</span>}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            {/* Parallel Footer Nav */}
            <div className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden">
                <div className="flex justify-between items-center px-8 py-4 bg-muted/10">
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
        </div>
    );
}
