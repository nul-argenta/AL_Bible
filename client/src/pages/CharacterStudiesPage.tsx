import { useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { BookOpen, ChevronRight, ChevronLeft, Users, ArrowRight, Clock, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CHARACTER_STUDIES, type CharacterStudy } from "@/shared/characterStudies";

function CharacterGrid({ onSelect }: { onSelect: (c: CharacterStudy) => void }) {
    return (
        <div className="animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-foreground">Character Studies</h2>
                <p className="text-muted-foreground mt-2">Explore the lives and lessons of Scripture's greatest figures.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHARACTER_STUDIES.map(c => (
                    <button key={c.id} onClick={() => onSelect(c)}
                        className="text-left bg-card rounded-xl p-5 border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                        <span className="text-4xl block mb-3">{c.icon}</span>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                        <p className="text-xs text-primary font-medium mt-0.5">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock size={10} /> {c.era}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function CharacterDetail({ character, onBack }: { character: CharacterStudy; onBack: () => void }) {
    return (
        <div className="animate-fade-in-up">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                <ChevronLeft size={16} /> Back to all characters
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
                <span className="text-5xl">{character.icon}</span>
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground">{character.name}</h2>
                    <p className="text-primary font-medium">{character.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={12} /> {character.era}
                    </p>
                </div>
            </div>

            {/* Summary */}
            <p className="text-foreground/90 leading-relaxed mb-8 font-serif text-lg">{character.summary}</p>

            {/* Traits */}
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Traits</h3>
                <div className="flex gap-2 flex-wrap">
                    {character.keyTraits.map(t => (
                        <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">{t}</span>
                    ))}
                </div>
            </div>

            {/* Key Verses */}
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Verses</h3>
                <div className="space-y-3">
                    {character.keyVerses.map(v => (
                        <Link key={v.ref} href={`/read/${v.bookSlug}/${v.chapter}?v=${v.verse}`}>
                            <div className="bg-card rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-primary">{v.ref}</span>
                                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <p className="text-sm text-foreground/80 font-serif italic leading-relaxed">&ldquo;{v.text}&rdquo;</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Life Timeline</h3>
                <div className="space-y-0 relative">
                    <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-border" />
                    {character.timeline.map((event, i) => (
                        <div key={i} className="relative flex items-start gap-4 py-2.5">
                            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 text-primary shrink-0">
                                <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className="text-sm font-medium text-foreground">{event.event}</p>
                                <p className="text-xs text-primary/70 font-medium mt-0.5">{event.ref}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CharacterStudiesPage() {
    const [selected, setSelected] = useState<CharacterStudy | null>(null);
    const [, navigate] = useLocation();
    const [isDetailRoute, params] = useRoute("/characters/:id");
    const urlChar = isDetailRoute && params?.id ? CHARACTER_STUDIES.find(c => c.id === params.id) : null;
    const active = selected || urlChar;

    const handleBack = () => {
        setSelected(null);
        if (urlChar) navigate("/characters");
    };

    return (
        <PageWrapper className="bg-background font-sans">
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <Feather size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Users size={16} className="text-primary" /> Characters
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-y-auto">
                {active ? (
                    <CharacterDetail character={active} onBack={handleBack} />
                ) : (
                    <CharacterGrid onSelect={setSelected} />
                )}
            </main>
        </PageWrapper>
    );
}
