import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, Book, ChevronRight, ChevronDown } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { Book as IBook } from "@/lib/types";

export function BibleNavigation() {
    const [open, setOpen] = useState(false);
    const [location] = useLocation();

    // Parse current book/chapter from URL to highlight
    // URL format: /read/:book/:chapter
    const parts = location.split("/");
    const currentBookSlug = parts[2] || "genesis";
    const currentChapter = parseInt(parts[3] || "1", 10);

    const { data: books, isLoading } = useQuery<IBook[]>({
        queryKey: ["books"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/books");
            return res.json();
        }
    });

    // Grouping by Testament is implicit in order, but we can make it explicit if needed.
    // For now, just a list with accordion or simple expand logic.
    // Let's keep it simple: List of books. Clicking a book expands chapters.

    const [expandedBook, setExpandedBook] = useState<string | null>(currentBookSlug);

    const toggleBook = (slug: string) => {
        setExpandedBook(prev => prev === slug ? null : slug);
    };

    if (isLoading) return <Button variant="ghost" size="icon"><Menu /></Button>;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Books of the Bible
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-1">
                        {books?.map((book) => {
                            const isExpanded = expandedBook === book.slug;
                            const isActive = currentBookSlug === book.slug;

                            return (
                                <div key={book.slug} className="space-y-1">
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className="w-full justify-between font-normal"
                                        onClick={() => toggleBook(book.slug)}
                                    >
                                        <span className={isActive ? "font-semibold" : ""}>{book.name}</span>
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </Button>

                                    {isExpanded && (
                                        <div className="grid grid-cols-5 gap-1 px-2 py-1 bg-muted/20 rounded-md">
                                            {Array.from({ length: book.chapterCount }, (_, i) => i + 1).map((chap) => {
                                                const isChapterActive = isActive && currentChapter === chap;
                                                return (
                                                    <Link
                                                        key={chap}
                                                        href={`/read/${book.slug}/${chap}`}
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <div className={`
                                                            text-xs h-8 flex items-center justify-center rounded-sm cursor-pointer transition-colors
                                                            ${isChapterActive
                                                                ? "bg-primary text-primary-foreground font-bold"
                                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"}
                                                        `}>
                                                            {chap}
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
