import { useMemo } from "react";

/**
 * Scripture Comparison View — Side-by-side WEB vs KJV with word-level diff highlighting
 */

interface Verse {
    id: number;
    verse: number;
    text_web?: string | null;
    text_kjv?: string | null;
    [key: string]: any;
}

interface ComparisonViewProps {
    verses: Verse[];
    chapter: number;
    displayTitle: string;
}

/** Simple word-level diff: returns arrays of tokens with diff metadata */
function diffWords(a: string, b: string): { word: string; type: "same" | "added" | "removed" }[][] {
    const wordsA = a.split(/\s+/).filter(Boolean);
    const wordsB = b.split(/\s+/).filter(Boolean);

    // LCS-based diff
    const m = wordsA.length, n = wordsB.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to build diff
    const diffA: { word: string; type: "same" | "removed" }[] = [];
    const diffB: { word: string; type: "same" | "added" }[] = [];
    let i = m, j = n;
    const commonA: boolean[] = Array(m).fill(false);
    const commonB: boolean[] = Array(n).fill(false);

    while (i > 0 && j > 0) {
        if (wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
            commonA[i - 1] = true;
            commonB[j - 1] = true;
            i--; j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    for (let k = 0; k < m; k++) {
        diffA.push({ word: wordsA[k], type: commonA[k] ? "same" : "removed" });
    }
    for (let k = 0; k < n; k++) {
        diffB.push({ word: wordsB[k], type: commonB[k] ? "same" : "added" });
    }

    return [diffA, diffB];
}

export function ComparisonView({ verses, chapter, displayTitle }: ComparisonViewProps) {
    const diffs = useMemo(() => {
        return verses.map(v => {
            const web = v.text_web || "";
            const kjv = v.text_kjv || "";
            if (!web || !kjv) return null;
            return diffWords(web, kjv);
        });
    }, [verses]);

    return (
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center capitalize">
                {displayTitle} {chapter} — <span className="text-muted-foreground font-normal">Comparison View</span>
            </h2>

            {/* Column headers */}
            <div className="grid grid-cols-2 gap-4 mb-4 sticky top-[57px] z-10 bg-background/95 backdrop-blur-md py-2 border-b border-border/40">
                <div className="text-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">WEB (World English Bible)</span>
                </div>
                <div className="text-center">
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">KJV (King James Version)</span>
                </div>
            </div>

            {/* Verses */}
            <div className="space-y-3">
                {verses.map((verse, idx) => {
                    const diff = diffs[idx];
                    if (!diff) {
                        return (
                            <div key={verse.id} className="grid grid-cols-2 gap-4 py-3 border-b border-border/20">
                                <p className="text-sm text-muted-foreground font-scripture leading-relaxed">
                                    <sup className="text-xs font-bold text-primary mr-1">{verse.verse}</sup>
                                    {verse.text_web || <span className="italic">Not available</span>}
                                </p>
                                <p className="text-sm text-muted-foreground font-scripture leading-relaxed">
                                    <sup className="text-xs font-bold text-primary mr-1">{verse.verse}</sup>
                                    {verse.text_kjv || <span className="italic">Not available</span>}
                                </p>
                            </div>
                        );
                    }

                    const [webDiff, kjvDiff] = diff;
                    return (
                        <div key={verse.id} className="grid grid-cols-2 gap-4 py-3 border-b border-border/20 hover:bg-muted/20 transition-colors rounded-lg px-2">
                            {/* WEB side */}
                            <p className="text-sm font-scripture leading-relaxed">
                                <sup className="text-xs font-bold text-primary mr-1">{verse.verse}</sup>
                                {webDiff.map((token, i) => (
                                    <span
                                        key={i}
                                        className={token.type === "removed" ? "bg-red-200/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-sm px-0.5 font-medium" : "text-foreground"}
                                    >
                                        {token.word}{" "}
                                    </span>
                                ))}
                            </p>
                            {/* KJV side */}
                            <p className="text-sm font-scripture leading-relaxed">
                                <sup className="text-xs font-bold text-primary mr-1">{verse.verse}</sup>
                                {kjvDiff.map((token, i) => (
                                    <span
                                        key={i}
                                        className={token.type === "added" ? "bg-green-200/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-sm px-0.5 font-medium" : "text-foreground"}
                                    >
                                        {token.word}{" "}
                                    </span>
                                ))}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
