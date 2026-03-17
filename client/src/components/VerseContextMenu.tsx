import { useState, useRef, useEffect } from "react";
import { Highlighter, StickyNote, X, Trash2, Star, Copy, Share2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HIGHLIGHT_COLORS, HIGHLIGHT_LABELS, type HighlightColor, type HighlightLabel } from "@/hooks/useHighlightsAndNotes";

interface VerseContextMenuProps {
    x: number;
    y: number;
    verseId: number;
    verseRef: string;
    verseText: string;
    currentHighlight?: string;
    currentLabel?: string;
    currentNote?: string;
    isFavourite: boolean;
    onHighlight: (color: HighlightColor) => void;
    onRemoveHighlight: () => void;
    onSetLabel: (label?: string) => void;
    onSaveNote: (text: string) => void;
    onDeleteNote: () => void;
    onToggleFavourite: () => void;
    onClose: () => void;
}

export function VerseContextMenu({
    x, y, verseId, verseRef, verseText,
    currentHighlight, currentLabel, currentNote, isFavourite,
    onHighlight, onRemoveHighlight, onSetLabel,
    onSaveNote, onDeleteNote, onToggleFavourite, onClose
}: VerseContextMenuProps) {
    const [showNote, setShowNote] = useState(false);
    const [showLabels, setShowLabels] = useState(false);
    const [noteText, setNoteText] = useState(currentNote || "");
    const [copyFeedback, setCopyFeedback] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    // Close on Escape (stopPropagation prevents bubbling to ReaderPage keyboard shortcuts)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener("keydown", handler, true);
        return () => document.removeEventListener("keydown", handler, true);
    }, [onClose]);

    // Focus textarea when showing note editor
    useEffect(() => {
        if (showNote && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [showNote]);

    // Position adjustment to keep in viewport
    const adjustedX = Math.min(x, window.innerWidth - 280);
    const adjustedY = Math.min(y, window.innerHeight - 400);

    const handleCopy = async () => {
        const copyText = `"${verseText}" — ${verseRef}`;
        try {
            await navigator.clipboard.writeText(copyText);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 1500);
        } catch {
            // Fallback for older browsers
            const ta = document.createElement("textarea");
            ta.value = copyText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 1500);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: verseRef,
            text: `"${verseText}" — ${verseRef}`,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await handleCopy();
            }
        } catch {
            // User cancelled share or error — ignore
        }
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[240px] max-w-[300px] bg-popover border border-border rounded-xl shadow-xl animate-fade-in"
            style={{ left: adjustedX, top: adjustedY }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                <span className="text-xs font-semibold text-muted-foreground truncate">{verseRef}</span>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50">
                <button
                    onClick={onToggleFavourite}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isFavourite
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    title={isFavourite ? "Remove Favourite" : "Add Favourite"}
                >
                    <Star className={`h-3.5 w-3.5 ${isFavourite ? "fill-current" : ""}`} />
                    {isFavourite ? "★" : "☆"}
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="Copy to Clipboard"
                >
                    <Copy className="h-3.5 w-3.5" />
                    {copyFeedback ? "Copied!" : "Copy"}
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="Share Verse"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </button>
            </div>

            {/* Highlight Colors */}
            <div className="px-3 py-2.5 border-b border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                    <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Highlight</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {HIGHLIGHT_COLORS.map((color) => (
                        <button
                            key={color.value}
                            title={color.name}
                            className={`
                                w-7 h-7 rounded-full transition-all hover:scale-110 hover:shadow-md
                                ${color.dot}
                                ${currentHighlight === color.value ? "ring-2 ring-offset-2 ring-foreground/40 scale-110" : "ring-1 ring-black/10"}
                            `}
                            onClick={() => {
                                onHighlight(color.value as HighlightColor);
                                if (!showNote && !showLabels) onClose();
                            }}
                        />
                    ))}
                    {currentHighlight && (
                        <button
                            title="Remove highlight"
                            className="w-7 h-7 rounded-full flex items-center justify-center bg-muted hover:bg-destructive/10 hover:text-destructive transition-all"
                            onClick={() => {
                                onRemoveHighlight();
                                if (!showNote && !showLabels) onClose();
                            }}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* Label Tags */}
                {currentHighlight && (
                    <div className="mt-2.5">
                        {!showLabels ? (
                            <button
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowLabels(true)}
                            >
                                <Tag className="h-3 w-3" />
                                {currentLabel ? `Label: ${HIGHLIGHT_LABELS.find(l => l.value === currentLabel)?.name || currentLabel}` : "Add Label"}
                            </button>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {HIGHLIGHT_LABELS.map((label) => (
                                    <button
                                        key={label.value}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${currentLabel === label.value
                                            ? "bg-primary text-primary-foreground ring-1 ring-primary"
                                            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                            }`}
                                        onClick={() => {
                                            onSetLabel(currentLabel === label.value ? undefined : label.value);
                                        }}
                                    >
                                        <span>{label.emoji}</span>
                                        {label.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Note Section */}
            <div className="px-3 py-2.5">
                {!showNote ? (
                    <button
                        className="flex items-center gap-2 w-full text-xs font-medium text-muted-foreground hover:text-foreground py-1 transition-colors"
                        onClick={() => setShowNote(true)}
                    >
                        <StickyNote className="h-3.5 w-3.5" />
                        {currentNote ? "Edit Note" : "Add Note"}
                        {currentNote && <span className="text-[10px] text-primary/60 ml-auto">has note</span>}
                    </button>
                ) : (
                    <div className="space-y-2">
                        <Textarea
                            ref={textareaRef}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Write your note..."
                            className="min-h-[80px] text-sm resize-none bg-muted/30 border-border/50"
                        />
                        <div className="flex items-center gap-1.5">
                            <Button
                                size="sm"
                                className="flex-1 h-7 text-xs"
                                onClick={() => {
                                    onSaveNote(noteText);
                                    onClose();
                                }}
                            >
                                Save Note
                            </Button>
                            {currentNote && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                    onClick={() => {
                                        onDeleteNote();
                                        onClose();
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
