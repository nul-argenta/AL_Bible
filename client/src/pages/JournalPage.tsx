import { useState, useMemo } from "react";
import { Link } from "wouter";
import { BookOpen, StickyNote, ChevronRight, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NoteEntry {
    id: number;
    verseId: number;
    text: string;
    createdAt: string;
    updatedAt: string;
    verse: number;
    chapter: number;
    verse_text: string;
    book_name: string;
    book_slug: string;
}

export default function JournalPage() {
    const { data: notes = [], isLoading } = useQuery<NoteEntry[]>({
        queryKey: ["journal-all-notes"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/notes/all");
            return res.json();
        }
    });

    const groupedNotes = useMemo(() => {
        const groups: Record<string, NoteEntry[]> = {};
        for (const note of notes) {
            if (!groups[note.book_name]) {
                groups[note.book_name] = [];
            }
            groups[note.book_name].push(note);
        }
        return groups;
    }, [notes]);

    return (
        <PageWrapper className="bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <BookOpen size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <PenTool size={16} className="text-primary" />
                        My Study Journal
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

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-serif font-bold text-foreground">Study Journal</h2>
                    <p className="text-muted-foreground mt-2">
                        Review all your personal notes and insights across the Scriptures.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-xl shadow-sm border border-border mt-8">
                        <div className="bg-muted p-4 rounded-full inline-flex mb-4">
                            <StickyNote className="text-muted-foreground" size={24} />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">Your journal is empty</p>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                            When you add notes to verses while reading, they will appear here as a searchable, global feed.
                        </p>
                        <Link href="/read/genesis/1">
                            <Button>Start Reading</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedNotes).map(([bookName, bookNotes]) => (
                            <section key={bookName} className="animate-fade-in-up">
                                <h3 className="text-xl font-serif font-bold text-primary mb-4 pb-2 border-b border-border/50 flex items-center gap-2">
                                    <BookOpen size={18} /> {bookName}
                                </h3>
                                <div className="space-y-4">
                                    {bookNotes.map((note) => {
                                        const date = new Date(note.updatedAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric"
                                        });
                                        return (
                                            <div key={note.id} className="bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                                                <div className="flex justify-between items-start mb-3">
                                                    <Link href={`/read/${note.book_slug}/${note.chapter}?v=${note.verse}`} className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors bg-muted/50 px-2.5 py-1 rounded-md">
                                                        {bookName} {note.chapter}:{note.verse}
                                                        <ChevronRight size={14} className="opacity-50" />
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/30">
                                                        {date}
                                                    </span>
                                                </div>

                                                <blockquote className="pl-3 border-l-2 border-muted text-sm text-muted-foreground/80 mb-4 italic font-scripture leading-relaxed">
                                                    "{note.verse_text}"
                                                </blockquote>

                                                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                                                    {note.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
