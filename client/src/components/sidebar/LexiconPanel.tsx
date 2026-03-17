import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Book, Search, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface LexiconPanelProps {
    strongsId?: string;
    onStrongsSelect?: (id: string) => void;
}

export function LexiconPanel({ strongsId, onStrongsSelect }: LexiconPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [activeId, setActiveId] = useState<string | undefined>(strongsId);

    // Sync external clicks with internal state
    useEffect(() => {
        if (strongsId) {
            setActiveId(strongsId);
            setSearchQuery(""); // Clear search when a specific word is clicked from text
        }
    }, [strongsId]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            if (searchQuery) setActiveId(undefined); // Clear active item when searching
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch single definition
    const { data: lexicon, isLoading: isLoadingDef } = useQuery({
        queryKey: ["strongs", activeId],
        queryFn: async () => {
            if (!activeId) return null;
            const res = await apiRequest("GET", `/api/strongs/${activeId}`);
            if (!res.ok) throw new Error("Not found");
            return res.json();
        },
        enabled: !!activeId
    });

    // Fetch search results
    const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
        queryKey: ["strongs-search", debouncedQuery],
        queryFn: async () => {
            if (debouncedQuery.length < 2) return [];
            const res = await apiRequest("GET", `/api/strongs/search?q=${encodeURIComponent(debouncedQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            return res.json();
        },
        enabled: debouncedQuery.length >= 2 && !activeId
    });

    const isSearching = debouncedQuery.length >= 2 && !activeId;

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Sticky Search Header */}
            <div className="sticky top-0 z-10 p-4 border-b bg-background/95 backdrop-blur shrink-0 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search Greek, Hebrew, or English..."
                        className="pl-9 pr-4 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-1 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(""); setActiveId(undefined); }}
                            className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
                {/* 1. Empty State (No Search, No Active Word) */}
                {!activeId && debouncedQuery.length < 2 && (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                        <Book className="w-12 h-12 mb-4 opacity-50" />
                        <p>Search the Lexicon or click any word in Interlinear Mode to view its definition.</p>
                    </div>
                )}

                {/* 2. Loading States */}
                {(isLoadingDef || isLoadingSearch) && (
                    <div className="flex items-center justify-center p-8 h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                )}

                {/* 3. Search Results List */}
                {isSearching && !isLoadingSearch && searchResults && (
                    <div className="p-0">
                        {searchResults.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No matches found for "{debouncedQuery}".</div>
                        ) : (
                            <div className="divide-y">
                                {searchResults.map((result: any) => (
                                    <button
                                        key={result.strongs_number}
                                        className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                                        onClick={() => {
                                            setActiveId(result.strongs_number);
                                            if (onStrongsSelect) onStrongsSelect(result.strongs_number);
                                        }}
                                    >
                                        <div className="space-y-1 overflow-hidden pr-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-lg font-bold ${result.language === 'hebrew' ? 'font-hebrew dir-rtl' : 'font-greek'}`}>
                                                    {result.original_word}
                                                </span>
                                                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {result.strongs_number}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/80 truncate">
                                                {result.definition}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Single Definition View */}
                {activeId && lexicon && !isLoadingDef && (
                    <div className="p-5 space-y-6">
                        {activeId !== strongsId && (
                            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground" onClick={() => setActiveId(undefined)}>
                                ← Back to search results
                            </Button>
                        )}

                        <div className="text-center space-y-2 border-b pb-4">
                            <div className="text-xs font-bold tracking-widest text-primary/80 uppercase">
                                {lexicon.language} &bull; {lexicon.strongs_number}
                            </div>
                            <div className={`text-4xl sm:text-5xl font-bold py-2 ${lexicon.language === 'hebrew' ? 'font-hebrew dir-rtl' : 'font-greek'}`}>
                                {lexicon.original_word || "—"}
                            </div>
                            <div className="text-sm font-mono text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded">
                                {lexicon.transliteration || "—"}
                            </div>
                            {lexicon.pronunciation && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    [{lexicon.pronunciation}]
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pb-8">
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Definition</h4>
                                <p className="text-sm leading-relaxed text-foreground/90">
                                    {lexicon.definition}
                                </p>
                            </div>

                            {lexicon.kjv_usage && (
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">KJV Translation matches</h4>
                                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                                        {lexicon.kjv_usage}
                                    </p>
                                </div>
                            )}

                            {lexicon.outline && (
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">Etymology / Notes</h4>
                                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                        {lexicon.outline.replace(/<br>/g, "\n")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
