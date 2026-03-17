import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { X, Book, MessageSquare, Sparkles, ScrollText, ThumbsUp, ThumbsDown, ExternalLink, Link as LinkIcon, Trash2, Star, Send, Settings, Key, Loader2, Bot, User } from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useUserLinks } from "@/hooks/useUserLinks";
import { SearchDialog } from "@/components/SearchDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { LexiconPanel } from "./sidebar/LexiconPanel";

interface StudySidebarProps {
    verseId: number | null;
    verseRef: string; // e.g. "Genesis 1:1"
    initialTab?: string;
    strongsId?: string;
    onClose: () => void;
}

export function StudySidebar({ verseId, verseRef, initialTab, strongsId, onClose }: StudySidebarProps) {
    const [activeTab, setActiveTab] = useState(initialTab || "commentary");

    // Clear state or set active tab when verse/tab changes
    useEffect(() => {
        if (verseId && initialTab) {
            setActiveTab(initialTab);
        }
    }, [verseId, initialTab, strongsId]);

    const isOpen = !!verseId;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[min(300px,90vw)] sm:w-[450px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b bg-muted/10">
                    <SheetTitle className="flex items-center gap-2">
                        <span className="font-scripture text-xl">{verseRef}</span>
                    </SheetTitle>
                    <SheetDescription>
                        Study tools & insights
                    </SheetDescription>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-2">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="commentary">Commentary</TabsTrigger>
                            <TabsTrigger value="lexicon">Lexicon</TabsTrigger>
                            <TabsTrigger value="crossrefs">Cross-Refs</TabsTrigger>
                            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {verseId && (
                            <>
                                <TabsContent value="commentary" className="h-full m-0">
                                    <CommentaryPanel verseId={verseId} />
                                </TabsContent>
                                <TabsContent value="lexicon" className="h-full m-0">
                                    <LexiconPanel strongsId={strongsId} />
                                </TabsContent>
                                <TabsContent value="crossrefs" className="h-full m-0">
                                    <CrossRefsPanel verseId={verseId} onClose={onClose} />
                                </TabsContent>
                                <TabsContent value="ai" className="h-full m-0">
                                    <AIAnalysisPanel verseId={verseId} verseRef={verseRef} />
                                </TabsContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}


function CrossRefsPanel({ verseId, onClose }: { verseId: number; onClose: () => void }) {
    const [, navigate] = useLocation();
    const { userLinks, addLink, removeLink } = useUserLinks(verseId);
    const [linkSearchOpen, setLinkSearchOpen] = useState(false);
    const { toast } = useToast();

    const { data: refs, isLoading } = useQuery<any[]>({
        queryKey: ["crossrefs", verseId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/cross-references/${verseId}`);
            return res.json();
        }
    });

    const goToRef = (ref: any) => {
        // Save current location for back-navigation
        const currentPath = window.location.pathname + window.location.search;
        const pathParts = window.location.pathname.split("/"); // /read/genesis/1
        const currentBook = pathParts[2] || "";
        const currentChapter = pathParts[3] || "1";
        const currentVerse = new URLSearchParams(window.location.search).get("v");
        const label = `${currentBook.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} ${currentChapter}${currentVerse ? `:${currentVerse}` : ""}`;
        sessionStorage.setItem("crossref-back", JSON.stringify({ path: currentPath, label }));

        // Close sidebar first, then navigate after Sheet animation completes
        onClose();
        const target = `/read/${ref.to_book_slug}/${ref.to_chapter}?v=${ref.to_verse}`;
        setTimeout(() => navigate(target), 150);
    };

    const handleAddLink = (result: any) => {
        if (result.isBookMatch) return; // Can't link to a whole book yet

        // Optimistic UI update handled by hook
        addLink.mutate({
            toVerseId: result.id, // SearchResult id might be negative for books, but verses are positive DB ids
            toVerseRef: `${result.book_name} ${result.chapter}:${result.verse}`,
            toBookSlug: result.book_slug,
            toChapter: result.chapter,
            toVerse: result.verse,
            toText: result.text_web || result.text_primary,
        });

        toast({
            title: "Connection Added",
            description: `Linked to ${result.book_name} ${result.chapter}:${result.verse}`,
        });
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (!refs || refs.length === 0) {
        // Only show empty state if NO user links either
        if (userLinks.length === 0) {
            return (
                <div className="p-4 space-y-4">
                    <Button variant="outline" className="w-full gap-2" onClick={() => setLinkSearchOpen(true)}>
                        <LinkIcon size={14} /> Add Personal Connection
                    </Button>
                    <div className="text-sm text-muted-foreground text-center py-8">
                        No cross-references found. Be the first to add one!
                    </div>
                    <SearchDialog open={linkSearchOpen} onOpenChange={setLinkSearchOpen} onSelect={handleAddLink} />
                </div>
            );
        }
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setLinkSearchOpen(true)}>
                    <LinkIcon size={14} /> Add Connection
                </Button>

                {/* User Links Section */}
                {userLinks.length > 0 && (
                    <div className="space-y-1 mb-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Connections</h4>
                        {userLinks.map((link) => (
                            <div
                                key={link.id}
                                className="space-y-1 pb-3 border-b last:border-0 hover:bg-primary/5 p-2 rounded -mx-2 transition-colors group relative"
                            >
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => goToRef({
                                    to_book_slug: link.toBookSlug,
                                    to_chapter: link.toChapter,
                                    to_verse: link.toVerse
                                })}>
                                    <span className="font-semibold text-sm text-primary group-hover:underline flex items-center gap-1.5">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        {link.toVerseRef}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeLink.mutate(link.id);
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 cursor-pointer" onClick={() => goToRef({
                                    to_book_slug: link.toBookSlug,
                                    to_chapter: link.toChapter,
                                    to_verse: link.toVerse
                                })}>
                                    {link.toText}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Global Refs Section */}
                {(refs && refs.length > 0) && (
                    <div className="space-y-1">
                        {userLinks.length > 0 && <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Community Refs</h4>}
                        {refs.map((ref, i) => (
                            <div
                                key={i}
                                className="space-y-1 pb-3 border-b last:border-0 hover:bg-primary/5 p-2 rounded -mx-2 transition-colors cursor-pointer group"
                                onClick={() => goToRef(ref)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-primary group-hover:underline">
                                        {ref.to_book_name} {ref.to_chapter}:{ref.to_verse}
                                        <ExternalLink className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                                    </span>
                                    {ref.votes && <span className="text-xs text-muted-foreground bg-muted px-1.5 rounded-full">{ref.votes} votes</span>}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {ref.to_text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <SearchDialog open={linkSearchOpen} onOpenChange={setLinkSearchOpen} onSelect={handleAddLink} />
        </ScrollArea>
    );
}

function CommentaryPanel({ verseId }: { verseId: number }) {
    const { data: comms, isLoading } = useQuery<any[]>({
        queryKey: ["commentary", verseId],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/commentary/${verseId}`);
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="p-4 space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!comms || comms.length === 0) {
        return <div className="p-4 text-sm text-muted-foreground">No commentary found for this verse.</div>;
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
                {comms.map((c, i) => (
                    <div key={i} className="space-y-2">
                        <h4 className="font-semibold text-sm text-primary border-b pb-1">
                            {c.author} <span className="text-muted-foreground font-normal">({c.source || "Concise"})</span>
                        </h4>
                        <div className="prose prose-sm dark:prose-invert text-sm leading-relaxed text-foreground/90 font-serif">
                            {c.text.split("\n").map((para: string, j: number) => (
                                <p key={j} className="mb-2 last:mb-0">{para}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function AIAnalysisPanel({ verseId, verseRef }: { verseId: number, verseRef: string }) {
    const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_key") || "");
    const [isEditingKey, setIsEditingKey] = useState(!apiKey);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial message based on verse
    useEffect(() => {
        setMessages([
            {
                role: "assistant",
                content: `Here to help with your study of ${verseRef}. I can look up Greek/Hebrew definitions, find cross-references, or provide theological insights. What would you like to know?`
            }
        ]);
    }, [verseRef]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSaveKey = () => {
        localStorage.setItem("gemini_key", apiKey);
        setIsEditingKey(false);
    };

    const handleClearKey = () => {
        localStorage.removeItem("gemini_key");
        setApiKey("");
        setIsEditingKey(true);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || !apiKey) return;

        const newMessages = [...messages, { role: "user" as const, content }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await apiRequest("POST", "/api/ai/gemini-chat", {
                messages: newMessages,
                geminiKey: apiKey
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: `Error: ${data.error || "Failed to get response."}` }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: "assistant", content: "Error: Could not connect to AI service." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditingKey) {
        return (
            <div className="p-4 space-y-6">
                <div className="text-center space-y-2">
                    <Key className="w-10 h-10 mx-auto text-primary opacity-20" />
                    <h3 className="font-bold text-lg">AI Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        To use the AI Assistant, you need to provide your own Gemini API Key. It is stored locally in your browser.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Gemini API Key</label>
                        <Input
                            type="password"
                            placeholder="AIza..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" onClick={handleSaveKey} disabled={!apiKey.trim()}>
                        Save & Continue
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        We connect directly to Google Gemini. Your key is never stored on our servers.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/5 z-10">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Sparkles size={12} /> AI Assistant
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingKey(true)}>
                    <Settings size={14} />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center py-10 opacity-60">
                            <Bot className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Ask a question about {verseRef} or start a deep analysis.</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => sendMessage(`Please analyze ${verseRef}. Provide a deep breakdown.`)}>
                                Analyze Verse
                            </Button>
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.filter(m => m.role !== ("system" as any)).map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                                    ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                                `}>
                                    {m.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                                </div>
                                <div className={`
                                    max-w-[85%] rounded-lg p-3 text-sm
                                    ${m.role === "user" ? "bg-primary/10 text-foreground" : "bg-card border shadow-sm"}
                                `}>
                                    <div className="prose prose-sm dark:prose-invert leading-relaxed whitespace-pre-wrap">
                                        {m.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Sparkles size={14} className="animate-pulse" />
                            </div>
                            <div className="bg-card border shadow-sm rounded-lg p-3 flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t bg-background mt-auto">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage(input);
                    }}
                    className="flex gap-2"
                >
                    <Input
                        placeholder="Ask a theological question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send size={16} />
                    </Button>
                </form>
            </div>
        </div>
    );
}

// Helper for 'prose' - we might need @tailwindcss/typography plugin in tailwind.config.ts asking user to install it.
// Checking package.json... "@tailwindcss/typography": "^0.5.15" is in devDependencies. Good.
