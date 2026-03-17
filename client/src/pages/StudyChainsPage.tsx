import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { BookOpen, ChevronRight, Map, CheckCircle2, ArrowRight, ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { STUDY_CHAINS, type StudyChain } from "@shared/studyChains";
import { useStudyChainProgress } from "@/hooks/useStudyChainProgress";

function ChainGrid({ onSelect }: { onSelect: (chain: StudyChain) => void }) {
    const { getVisited } = useStudyChainProgress();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STUDY_CHAINS.map(chain => {
                const visited = getVisited(chain.id);
                const progress = chain.passages.length > 0 ? Math.round((visited.length / chain.passages.length) * 100) : 0;

                return (
                    <button
                        key={chain.id}
                        onClick={() => onSelect(chain)}
                        className="text-left bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl">{chain.icon}</span>
                            {progress > 0 && (
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{progress}%</span>
                            )}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{chain.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{chain.description}</p>
                        <p className="text-xs text-muted-foreground mt-3">{chain.passages.length} passages</p>
                        {/* Mini progress bar */}
                        <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

function ChainDetail({ chain, onBack }: { chain: StudyChain; onBack: () => void }) {
    const { markVisited, getVisited, resetChain } = useStudyChainProgress();
    const visited = getVisited(chain.id);

    return (
        <div className="animate-fade-in-up">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                <ChevronLeft size={16} /> Back to all chains
            </button>

            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{chain.icon}</span>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{chain.title}</h2>
                    </div>
                    <p className="text-muted-foreground">{chain.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={() => resetChain(chain.id)}>
                    <RotateCcw size={14} /> Reset
                </Button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(visited.length / chain.passages.length) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{visited.length}/{chain.passages.length}</span>
            </div>

            {/* Stepper */}
            <div className="space-y-0 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border" />
                {chain.passages.map((passage, index) => {
                    const isVisited = visited.includes(index);
                    return (
                        <div key={index} className="relative flex items-start gap-4 py-3">
                            {/* Node */}
                            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 transition-colors ${isVisited ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}>
                                {isVisited ? <CheckCircle2 size={18} /> : <span className="text-sm font-bold">{index + 1}</span>}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 bg-card rounded-xl p-4 border transition-all ${isVisited ? "border-primary/20" : "border-border/40"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-primary">{passage.reference}</span>
                                    <Link
                                        href={`/read/${passage.bookSlug}/${passage.chapter}?v=${passage.verse}`}
                                        onClick={() => markVisited(chain.id, index)}
                                    >
                                        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                                            Read <ArrowRight size={12} />
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{passage.commentary}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function StudyChainsPage() {
    const [selectedChain, setSelectedChain] = useState<StudyChain | null>(null);
    const [, navigate] = useLocation();

    // Check URL param
    const [isDetailRoute, params] = useRoute("/study-chains/:id");
    const urlChain = isDetailRoute && params?.id ? STUDY_CHAINS.find(c => c.id === params.id) : null;
    const activeChain = selectedChain || urlChain;

    const handleBack = () => {
        setSelectedChain(null);
        if (urlChain) navigate("/study-chains");
    };

    return (
        <PageWrapper className="bg-background font-sans">
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <BookOpen size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Map size={16} className="text-primary" />
                        Study Chains
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto">
                {activeChain ? (
                    <ChainDetail chain={activeChain} onBack={handleBack} />
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h2 className="text-3xl font-serif font-bold text-foreground">Topical Study Chains</h2>
                            <p className="text-muted-foreground mt-2">Curated thematic journeys through Scripture. Choose a topic and follow the trail.</p>
                        </div>
                        <ChainGrid onSelect={setSelectedChain} />
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
