import { useParams, Link } from "wouter";
import { BookOpen, ExternalLink, MapPin, ArrowLeft, Feather, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDropById, type DropData } from "@shared/drops";

export default function DropPage() {
    const params = useParams<{ id: string }>();
    const drop = getDropById(params.id || "");

    if (!drop) {
        return (
            <PageWrapper>
                <div className="min-h-screen flex flex-col bg-background">
                    <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/60 backdrop-blur-md">
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                            <Feather size={18} />
                            <span className="font-serif">Armor & Light</span>
                        </Link>
                        <ThemeToggle />
                    </header>
                    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                        <div className="bg-destructive/10 p-5 rounded-full text-destructive mb-6">
                            <BookOpen size={36} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Drop Not Found</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            The QR code you scanned does not match any known seasonal drop. Please check the code and try again.
                        </p>
                        <Link href="/">
                            <Button className="gap-2"><ArrowLeft size={16} /> Return Home</Button>
                        </Link>
                    </main>
                </div>
            </PageWrapper>
        );
    }

    const readerLink = `/read/${drop.verseReference.book}/${drop.verseReference.chapter}?v=${drop.verseReference.verse}`;

    return (
        <PageWrapper>
            <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
                {/* ─── Minimal Header ─────────────────────────────────────── */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <Feather size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="uppercase tracking-widest font-semibold text-primary/70">Drop</span>
                        <ChevronRight size={12} />
                        <span className="capitalize font-medium">{drop.theme}</span>
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex-1 overflow-y-auto">
                    {/* ─── Hero: Stylized Verse ────────────────────────────────── */}
                    <section className="relative flex flex-col items-center justify-center px-6 py-20 sm:py-28 text-center overflow-hidden">
                        {/* Subtle radial gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08),transparent_70%)] pointer-events-none" />

                        <span className="relative z-10 inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            {drop.theme}
                        </span>

                        <blockquote className="relative z-10 max-w-3xl">
                            <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground/95">
                                "{drop.versePrimary}"
                            </p>
                        </blockquote>

                        <p className="relative z-10 mt-6 text-sm font-medium text-muted-foreground tracking-widest uppercase">
                            — {drop.verseReference.book.charAt(0).toUpperCase() + drop.verseReference.book.slice(1)} {drop.verseReference.chapter}:{drop.verseReference.verse}
                        </p>

                        <Link href={readerLink} className="relative z-10 mt-8">
                            <Button variant="outline" className="gap-2 font-semibold rounded-full px-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                                <BookOpen size={16} /> Read Full Chapter
                            </Button>
                        </Link>
                    </section>

                    {/* ─── Exegesis & Context ──────────────────────────────────── */}
                    <section className="w-full max-w-3xl mx-auto px-6 py-12 sm:py-16">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                                    <span className="w-8 h-px bg-primary/40" />
                                    Context & Exegesis
                                </h3>
                                <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-serif">
                                    {drop.exegesis}
                                </p>
                            </div>

                            <div className="border-t border-border/30 pt-8">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                                    <span className="w-8 h-px bg-primary/40" />
                                    Modern Application
                                </h3>
                                <ul className="space-y-4">
                                    {drop.modernApplication.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3 group">
                                            <span className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                                                {i + 1}
                                            </span>
                                            <span className="text-foreground/85 leading-relaxed">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* ─── Media Gallery ───────────────────────────────────────── */}
                    {(drop.media.images.length > 0 || drop.media.maps.length > 0) && (
                        <section className="w-full max-w-5xl mx-auto px-6 py-12">
                            {drop.media.images.length > 0 && (
                                <div className="mb-10">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                                        <span className="w-8 h-px bg-primary/40" />
                                        Gallery
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {drop.media.images.map((img, i) => (
                                            <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border/30 shadow-lg group">
                                                <img
                                                    src={img}
                                                    alt={`${drop.theme} image ${i + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {drop.media.maps.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                                        <MapPin size={14} />
                                        Maps
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {drop.media.maps.map((mapImg, i) => (
                                            <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border/30 shadow-lg">
                                                <img
                                                    src={mapImg}
                                                    alt={`Map ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ─── Links & Community ───────────────────────────────────── */}
                    {drop.links.length > 0 && (
                        <section className="w-full max-w-3xl mx-auto px-6 py-12 border-t border-border/30">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                                <span className="w-8 h-px bg-primary/40" />
                                Community & Institutions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {drop.links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 px-5 py-4 rounded-xl border border-border/40 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group"
                                    >
                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {link.label}
                                        </span>
                                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Footer CTA ─────────────────────────────────────────── */}
                    <footer className="w-full border-t border-border/30 bg-card/40">
                        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Explore the full scripture in the <strong className="text-foreground">Armor & Light</strong> reader.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href={readerLink}>
                                    <Button className="gap-2 rounded-full px-6">
                                        <BookOpen size={16} /> Open in Reader
                                    </Button>
                                </Link>
                                <Link href="/">
                                    <Button variant="outline" className="gap-2 rounded-full px-6">
                                        <ArrowLeft size={16} /> Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </PageWrapper>
    );
}
