import { useState, useCallback } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Brain, RotateCcw, CheckCircle2, Star, Zap, ThumbsUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMemoryCards } from "@/hooks/useMemoryCards";

export default function MemoryPage() {
    const { dueCards, isLoading, stats, reviewCard } = useMemoryCards();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const currentCard = dueCards[currentIndex];
    const remaining = dueCards.length - currentIndex;

    const handleReview = useCallback((quality: number) => {
        if (!currentCard || isAnimating) return;
        setIsAnimating(true);

        reviewCard.mutate(
            { verseId: currentCard.verse_id, quality },
            {
                onSuccess: () => {
                    setTimeout(() => {
                        setIsFlipped(false);
                        setCurrentIndex(prev => prev + 1);
                        setIsAnimating(false);
                    }, 300);
                },
                onError: () => setIsAnimating(false)
            }
        );
    }, [currentCard, isAnimating, reviewCard]);

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
                        <Brain size={16} className="text-primary" />
                        Memory Trainer
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link href="/favourites">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Star size={14} /> Favourites
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto">
                {/* Stats Bar */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
                        <div className="bg-card rounded-xl p-4 border border-border/40 text-center">
                            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Total Cards</p>
                        </div>
                        <div className="bg-card rounded-xl p-4 border border-border/40 text-center">
                            <p className="text-3xl font-bold text-primary">{stats.due}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Due Today</p>
                        </div>
                        <div className="bg-card rounded-xl p-4 border border-border/40 text-center">
                            <p className="text-3xl font-bold text-green-500">{stats.mastered}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Mastered</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : dueCards.length === 0 || currentIndex >= dueCards.length ? (
                    /* All Done / Empty State */
                    <div className="text-center py-20 animate-fade-in-up">
                        <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full inline-flex mb-6">
                            <CheckCircle2 className="text-green-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                            {stats && stats.total > 0 ? "All Caught Up!" : "No Cards Yet"}
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            {stats && stats.total > 0
                                ? "You've reviewed all your due cards for today. Come back tomorrow for more."
                                : "Add verses to your memory deck from your Favourites page."}
                        </p>
                        <Link href="/favourites">
                            <Button className="gap-2">
                                <Star size={16} /> Go to Favourites
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* Flashcard */
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{remaining} left</span>
                        </div>

                        {/* Card */}
                        <div
                            className={`relative min-h-[320px] cursor-pointer perspective-1000 ${isAnimating ? "pointer-events-none" : ""}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className={`relative w-full min-h-[320px] transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                                {/* Front: Reference */}
                                <div className="absolute inset-0 w-full min-h-[320px] bg-card rounded-2xl border border-border/60 shadow-lg flex flex-col items-center justify-center p-8 text-center backface-hidden">
                                    <div className="bg-primary/10 p-3 rounded-full mb-6">
                                        <BookOpen className="text-primary" size={28} />
                                    </div>
                                    <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-3">Can you recite?</p>
                                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
                                        {currentCard.book_name} {currentCard.chapter}:{currentCard.verse}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
                                        Tap to reveal <ArrowRight size={14} />
                                    </p>
                                </div>

                                {/* Back: Full text */}
                                <div className="absolute inset-0 w-full min-h-[320px] bg-card rounded-2xl border border-primary/30 shadow-lg flex flex-col items-center justify-center p-8 text-center backface-hidden rotate-y-180">
                                    <p className="text-sm font-bold tracking-widest text-primary uppercase mb-4">
                                        {currentCard.book_name} {currentCard.chapter}:{currentCard.verse}
                                    </p>
                                    <p className="font-serif text-xl sm:text-2xl text-foreground leading-relaxed italic max-w-lg">
                                        &ldquo;{currentCard.text_primary}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quality Buttons (only show when flipped) */}
                        {isFlipped && (
                            <div className="grid grid-cols-4 gap-3 animate-fade-in-up">
                                {([
                                    { quality: 1, icon: <RotateCcw size={18} />, label: "Again", colors: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30" },
                                    { quality: 3, icon: <Zap size={18} />, label: "Hard", colors: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30" },
                                    { quality: 4, icon: <ThumbsUp size={18} />, label: "Good", colors: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30" },
                                    { quality: 5, icon: <CheckCircle2 size={18} />, label: "Easy", colors: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30" },
                                ] as const).map(btn => (
                                    <button
                                        key={btn.quality}
                                        onClick={() => handleReview(btn.quality)}
                                        className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl border transition-colors ${btn.colors}`}
                                    >
                                        {btn.icon}
                                        <span className="text-xs font-semibold">{btn.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
