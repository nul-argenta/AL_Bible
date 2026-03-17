import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Heart, Plus, CheckCircle2, Trash2, X, Feather, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePrayerJournal, type PrayerRequest } from "@/hooks/usePrayerJournal";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
    { id: "personal", label: "Personal", emoji: "🙏" },
    { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
    { id: "world", label: "World", emoji: "🌍" },
    { id: "thanksgiving", label: "Thanksgiving", emoji: "🙌" },
    { id: "other", label: "Other", emoji: "✨" },
] as const;

function PrayerCard({ prayer, onToggle, onDelete }: { prayer: PrayerRequest; onToggle: () => void; onDelete: () => void }) {
    const cat = CATEGORIES.find(c => c.id === prayer.category) || CATEGORIES[4];
    return (
        <div className={`bg-card rounded-xl p-4 border transition-all group ${prayer.is_answered ? "border-green-200 dark:border-green-800/40 opacity-75" : "border-border/40 hover:border-primary/30 hover:shadow-md"}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span title={cat.label}>{cat.emoji}</span>
                        <h3 className={`font-semibold text-sm ${prayer.is_answered ? "line-through text-muted-foreground" : "text-foreground"}`}>{prayer.title}</h3>
                    </div>
                    {prayer.body && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prayer.body}</p>}
                    {prayer.verse_ref && (
                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">{prayer.verse_ref}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={onToggle} className={`p-1.5 rounded-lg transition-colors ${prayer.is_answered ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-green-500"}`} title={prayer.is_answered ? "Mark unanswered" : "Mark answered"}>
                        <CheckCircle2 size={16} />
                    </button>
                    <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(prayer.created_at), { addSuffix: true })}
                </span>
                {prayer.is_answered && prayer.answered_date && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Answered {formatDistanceToNow(new Date(prayer.answered_date), { addSuffix: true })}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function PrayerPage() {
    const { active, answered, isLoading, addPrayer, toggleAnswered, deletePrayer } = usePrayerJournal();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("personal");
    const [verseRef, setVerseRef] = useState("");
    const [filter, setFilter] = useState<"active" | "answered" | "all">("active");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addPrayer.mutate({ title: title.trim(), body: body.trim() || undefined, category, verse_ref: verseRef.trim() || undefined });
        setTitle(""); setBody(""); setVerseRef(""); setCategory("personal"); setShowForm(false);
    };

    const displayed = filter === "active" ? active : filter === "answered" ? answered : [...active, ...answered];

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
                        <Heart size={16} className="text-primary" /> Prayer Journal
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto">
                {/* Header & Stats */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground">Prayer Journal</h2>
                        <p className="text-sm text-muted-foreground mt-1">{active.length} active · {answered.length} answered</p>
                    </div>
                    <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
                        {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Prayer</>}
                    </Button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-5 border border-primary/20 shadow-sm mb-6 space-y-4 animate-fade-in-up">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What would you like to pray for?" className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
                        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Additional details (optional)..." rows={3} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {CATEGORIES.map(c => (
                                        <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 hover:border-primary/30"}`}>
                                            {c.emoji} {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <input value={verseRef} onChange={e => setVerseRef(e.target.value)} placeholder="Attach a verse (e.g. Philippians 4:6)" className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <Button type="submit" disabled={!title.trim() || addPrayer.isPending} className="w-full">
                            {addPrayer.isPending ? "Saving..." : "Add Prayer Request"}
                        </Button>
                    </form>
                )}

                {/* Filter */}
                <div className="flex gap-2 mb-4">
                    {(["active", "answered", "all"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 hover:border-primary/30"}`}>
                            {f === "active" ? `Active (${active.length})` : f === "answered" ? `Answered (${answered.length})` : "All"}
                        </button>
                    ))}
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />)}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in-up">
                        <Heart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {filter === "answered" ? "No answered prayers yet" : "No prayer requests yet"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {filter === "answered" ? "Your answered prayers will appear here." : "Tap \"New Prayer\" to start your prayer journal."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map(p => (
                            <PrayerCard key={p.id} prayer={p} onToggle={() => toggleAnswered.mutate(p.id)} onDelete={() => deletePrayer.mutate(p.id)} />
                        ))}
                    </div>
                )}
            </main>
        </PageWrapper>
    );
}
