import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { BookOpen, ChevronRight, Image, Download, Share2, Type, Palette, Maximize, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";

// ─── Background Presets ──────────────────────────────────────────────
const BACKGROUNDS = [
    { id: "midnight", label: "Midnight", gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", textColor: "#e2e8f0", accentColor: "#a78bfa" },
    { id: "sunset", label: "Sunset", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ff9a44 100%)", textColor: "#ffffff", accentColor: "#fff5f5" },
    { id: "ocean", label: "Ocean", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", textColor: "#f0f4ff", accentColor: "#c4b5fd" },
    { id: "forest", label: "Forest", gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)", textColor: "#ecfdf5", accentColor: "#a7f3d0" },
    { id: "dawn", label: "Dawn", gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", textColor: "#1e293b", accentColor: "#9f1239" },
    { id: "parchment", label: "Parchment", gradient: "linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)", textColor: "#44403c", accentColor: "#92400e" },
    { id: "slate", label: "Slate", gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)", textColor: "#e2e8f0", accentColor: "#38bdf8" },
    { id: "royal", label: "Royal", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", textColor: "#fef3c7", accentColor: "#f59e0b" },
] as const;

type BackgroundId = typeof BACKGROUNDS[number]["id"];

const FONTS = [
    { id: "serif", label: "Serif", family: "'Crimson Pro', Georgia, serif" },
    { id: "sans", label: "Sans", family: "'Inter', system-ui, sans-serif" },
    { id: "script", label: "Script", family: "'Playfair Display', Georgia, serif" },
] as const;

type FontId = typeof FONTS[number]["id"];

const SIZES = [
    { id: "square", label: "Square (1:1)", width: 1080, height: 1080 },
    { id: "story", label: "Story (9:16)", width: 1080, height: 1920 },
    { id: "wide", label: "Wide (16:9)", width: 1920, height: 1080 },
] as const;

type SizeId = typeof SIZES[number]["id"];

// ─── Canvas Drawing ──────────────────────────────────────────────────
function drawVerseImage(
    canvas: HTMLCanvasElement,
    verseText: string,
    reference: string,
    bgId: BackgroundId,
    fontId: FontId,
    sizeId: SizeId,
) {
    const bg = BACKGROUNDS.find(b => b.id === bgId)!;
    const font = FONTS.find(f => f.id === fontId)!;
    const size = SIZES.find(s => s.id === sizeId)!;

    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d")!;

    // Background gradient
    const coords = { x0: 0, y0: 0, x1: size.width, y1: size.height };
    const gradient = ctx.createLinearGradient(coords.x0, coords.y0, coords.x1, coords.y1);
    // Parse gradient stops from CSS string
    const colorsMatch = bg.gradient.match(/#[0-9a-fA-F]{6}/g) || ["#000000", "#333333"];
    colorsMatch.forEach((c, i) => gradient.addColorStop(i / Math.max(1, colorsMatch.length - 1), c));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, size.height);

    // Add subtle texture overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(Math.random() * size.width, Math.random() * size.height, 1, 1);
    }
    ctx.globalAlpha = 1;

    // Decorative elements — top and bottom lines
    const pad = Math.min(size.width, size.height) * 0.08;
    ctx.strokeStyle = bg.accentColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(size.width - pad, pad);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, size.height - pad);
    ctx.lineTo(size.width - pad, size.height - pad);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Small cross/feather accent
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = bg.accentColor;
    const crossSize = 24;
    const crossX = size.width / 2;
    const crossY = pad + 30;
    ctx.fillRect(crossX - 1, crossY - crossSize / 2, 2, crossSize);
    ctx.fillRect(crossX - crossSize / 3, crossY - 1, crossSize / 1.5, 2);
    ctx.globalAlpha = 1;

    // Calculate text area
    const textPadX = pad * 1.5;
    const textAreaWidth = size.width - textPadX * 2;
    const centerY = size.height / 2;

    // Opening quotation mark
    const quoteSize = Math.round(size.height * 0.12);
    ctx.font = `italic ${quoteSize}px ${font.family}`;
    ctx.fillStyle = bg.accentColor;
    ctx.globalAlpha = 0.2;
    ctx.textAlign = "center";
    ctx.fillText("\u201C", size.width / 2, centerY - size.height * 0.18);
    ctx.globalAlpha = 1;

    // Verse text — word-wrap manually
    const verseFontSize = Math.round(Math.min(size.width, size.height) * 0.045);
    ctx.font = `italic ${verseFontSize}px ${font.family}`;
    ctx.fillStyle = bg.textColor;
    ctx.textAlign = "center";

    const words = verseText.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > textAreaWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = verseFontSize * 1.6;
    const totalTextHeight = lines.length * lineHeight;
    const textStartY = centerY - totalTextHeight / 2 + verseFontSize;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], size.width / 2, textStartY + i * lineHeight);
    }

    // Reference
    const refFontSize = Math.round(verseFontSize * 0.65);
    ctx.font = `bold ${refFontSize}px ${font.family}`;
    ctx.fillStyle = bg.accentColor;
    ctx.fillText(`— ${reference}`, size.width / 2, textStartY + totalTextHeight + refFontSize * 1.5);

    // Branding watermark
    const brandSize = Math.round(verseFontSize * 0.35);
    ctx.font = `${brandSize}px ${font.family}`;
    ctx.fillStyle = bg.textColor;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = "right";
    ctx.fillText("Armor & Light", size.width - pad, size.height - pad + brandSize * 0.6);
    ctx.globalAlpha = 1;
}

// ─── Component ───────────────────────────────────────────────────────
export default function VerseImagePage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [verseText, setVerseText] = useState("For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.");
    const [reference, setReference] = useState("John 3:16");
    const [bgId, setBgId] = useState<BackgroundId>("midnight");
    const [fontId, setFontId] = useState<FontId>("serif");
    const [sizeId, setSizeId] = useState<SizeId>("square");

    // Redraw on any change
    useEffect(() => {
        if (canvasRef.current) {
            drawVerseImage(canvasRef.current, verseText, reference, bgId, fontId, sizeId);
        }
    }, [verseText, reference, bgId, fontId, sizeId]);

    const handleDownload = useCallback(() => {
        if (!canvasRef.current) return;
        const link = document.createElement("a");
        link.download = `${reference.replace(/\s+/g, "_")}.png`;
        link.href = canvasRef.current.toDataURL("image/png");
        link.click();
    }, [reference]);

    const handleShare = useCallback(async () => {
        if (!canvasRef.current) return;
        try {
            const blob = await new Promise<Blob | null>(resolve => canvasRef.current!.toBlob(resolve, "image/png"));
            if (!blob) return;
            const file = new File([blob], `${reference}.png`, { type: "image/png" });
            if (navigator.share) {
                await navigator.share({ files: [file], title: reference, text: `"${verseText}" — ${reference}` });
            } else {
                handleDownload();
            }
        } catch {
            handleDownload();
        }
    }, [reference, verseText, handleDownload]);

    const currentSize = SIZES.find(s => s.id === sizeId)!;
    const previewAspect = currentSize.width / currentSize.height;

    return (
        <PageWrapper className="bg-background font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors">
                        <Feather size={18} />
                        <span className="hidden sm:inline font-serif">Armor & Light</span>
                    </Link>
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Image size={16} className="text-primary" />
                        Verse Image
                    </h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* ─── Controls ─── */}
                    <div className="space-y-6 animate-fade-in-up">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Create Verse Image</h2>
                            <p className="text-sm text-muted-foreground">Design a beautiful shareable image from any verse.</p>
                        </div>

                        {/* Verse Text */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verse Text</label>
                            <textarea
                                value={verseText}
                                onChange={e => setVerseText(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-serif placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                                placeholder="Type or paste a verse..."
                            />
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reference</label>
                            <input
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                                placeholder="e.g. John 3:16"
                            />
                        </div>

                        {/* Background */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Palette size={12} /> Background
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {BACKGROUNDS.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => setBgId(bg.id)}
                                        className={`h-12 rounded-lg border-2 transition-all ${bgId === bg.id ? "border-primary scale-105 shadow-lg" : "border-transparent hover:border-border"}`}
                                        style={{ background: bg.gradient }}
                                        title={bg.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Font */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Type size={12} /> Font Style
                            </label>
                            <div className="flex gap-2">
                                {FONTS.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFontId(f.id)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${fontId === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-foreground hover:border-primary/30"}`}
                                        style={{ fontFamily: f.family }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Maximize size={12} /> Image Size
                            </label>
                            <div className="flex gap-2">
                                {SIZES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSizeId(s.id)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${sizeId === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/40 text-foreground hover:border-primary/30"}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button className="flex-1 gap-2" onClick={handleDownload}>
                                <Download size={16} /> Download PNG
                            </Button>
                            <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                                <Share2 size={16} /> Share
                            </Button>
                        </div>
                    </div>

                    {/* ─── Preview ─── */}
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-200">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview</div>
                        <div
                            className="w-full rounded-2xl overflow-hidden shadow-2xl border border-border/30"
                            style={{ aspectRatio: previewAspect, maxHeight: "70vh" }}
                        >
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </PageWrapper>
    );
}
