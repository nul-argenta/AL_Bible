import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageWrapper } from "@/components/PageWrapper";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AT_BIBLE_BOOKS, BIBLE_CATEGORIES, getCategoryBooks } from "@/lib/bibleData";
import { getBookQuestions, type QuizQuestion } from "@/lib/quizData";
import { useQuizProgress, type BookQuizResult } from "@/hooks/useQuizProgress";
import {
    ChevronLeft, CheckCircle, XCircle,
    RotateCcw, ChevronRight, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";

// ─── Quiz Active View ────────────────────────────────────────────
function QuizActive({
    bookSlug,
    bookName,
    questions,
    onFinish,
    onCancel,
}: {
    bookSlug: string;
    bookName: string;
    questions: QuizQuestion[];
    onFinish: (result: BookQuizResult) => void;
    onCancel: () => void;
}) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [correctCount, setCorrectCount] = useState(0);
    const correctCountRef = useRef(0); // Ref tracks the true count (avoids stale closure)

    const question = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const isCorrect = selectedAnswer === question.correctIndex;

    const handleConfirm = () => {
        if (selectedAnswer === null) return;
        setConfirmed(true);
        setAnswers(prev => ({ ...prev, [question.id]: selectedAnswer }));
        if (isCorrect) {
            correctCountRef.current += 1;
            setCorrectCount(correctCountRef.current);
        }
    };

    const handleNext = () => {
        if (isLast) {
            // Use the ref for the true final count
            const finalCorrect = correctCountRef.current;
            onFinish({
                bookSlug,
                totalQuestions: questions.length,
                correctAnswers: finalCorrect,
                bestScore: finalCorrect,
                attempts: 1,
                lastAttempt: Date.now(),
                answeredQuestionsJson: JSON.stringify(answers),
            });
        } else {
            setCurrentIdx(prev => prev + 1);
            setSelectedAnswer(null);
            setConfirmed(false);
        }
    };

    const progressPct = ((currentIdx + (confirmed ? 1 : 0)) / questions.length) * 100;

    return (
        <PageWrapper className="bg-background font-sans flex flex-col">
            <header className="sticky top-0 z-20 flex items-center px-4 py-3 border-b bg-background/95 backdrop-blur-md">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onCancel}>
                    <ChevronLeft size={16} /> Quit
                </Button>
                <div className="flex-1 text-center font-serif font-bold text-base sm:text-lg">{bookName} Quiz</div>
                <span className="text-sm text-muted-foreground font-medium">{currentIdx + 1}/{questions.length}</span>
            </header>

            <Progress value={progressPct} className="h-1 rounded-none" />

            <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-8 flex flex-col overflow-y-auto">
                {/* Question */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="text-center space-y-2">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                            Question {currentIdx + 1}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold font-serif leading-snug">
                            {question.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {question.options.map((option, i) => {
                            let style = "bg-card border-border/60 hover:border-primary/40 hover:bg-primary/5";

                            if (selectedAnswer === i && !confirmed) {
                                style = "bg-primary/10 border-primary ring-2 ring-primary/30";
                            } else if (confirmed) {
                                if (i === question.correctIndex) {
                                    style = "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300";
                                } else if (selectedAnswer === i && !isCorrect) {
                                    style = "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300 line-through";
                                } else {
                                    style = "bg-card border-border/30 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => !confirmed && setSelectedAnswer(i)}
                                    disabled={confirmed}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 
                                        ${style} ${!confirmed ? "cursor-pointer" : "cursor-default"}`}
                                >
                                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0
                                        ${selectedAnswer === i && !confirmed ? "bg-primary text-primary-foreground border-primary" :
                                            confirmed && i === question.correctIndex ? "bg-green-500 text-white border-green-500" :
                                                confirmed && selectedAnswer === i && !isCorrect ? "bg-red-500 text-white border-red-500" :
                                                    "border-border/60 text-muted-foreground"}`}>
                                        {confirmed && i === question.correctIndex ? <CheckCircle size={16} /> :
                                            confirmed && selectedAnswer === i && !isCorrect ? <XCircle size={16} /> :
                                                String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="font-medium text-sm sm:text-base">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {confirmed && (
                        <div className={`text-center p-3 rounded-lg text-sm font-semibold ${isCorrect
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                            }`}>
                            {isCorrect ? "🎉 Correct!" : `❌ The answer was: ${question.options[question.correctIndex]}`}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="pt-6">
                    {!confirmed ? (
                        <Button
                            className="w-full"
                            size="lg"
                            disabled={selectedAnswer === null}
                            onClick={handleConfirm}
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <Button className="w-full gap-2" size="lg" onClick={handleNext}>
                            {isLast ? "See Results" : "Next Question"}
                            <ChevronRight size={16} />
                        </Button>
                    )}
                </div>
            </main>
        </PageWrapper>
    );
}

// ─── Quiz Results View ───────────────────────────────────────────
function QuizResults({
    bookName,
    result,
    questions,
    onRetry,
    onBack,
}: {
    bookName: string;
    result: BookQuizResult;
    questions: QuizQuestion[];
    onRetry: () => void;
    onBack: () => void;
}) {
    const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
    const isPerfect = result.correctAnswers === result.totalQuestions;
    const isGood = pct >= 80;
    const isOkay = pct >= 60;

    return (
        <PageWrapper className="bg-background font-sans flex flex-col">
            <header className="sticky top-0 z-20 flex items-center px-4 py-3 border-b bg-background/95 backdrop-blur-md">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={onBack}>
                    <ChevronLeft size={16} /> All Quizzes
                </Button>
                <div className="flex-1 text-center font-serif font-bold text-lg">Results</div>
                <ThemeToggle />
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full p-6 sm:p-10 space-y-8 overflow-y-auto">

                {/* ─── Score Summary ─── */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl">
                        {isPerfect ? "🏆" : isGood ? "🌟" : isOkay ? "👍" : "📖"}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold font-serif">{bookName} Quiz</h2>
                        <p className="text-muted-foreground mt-1">
                            {isPerfect ? "Perfect score!" :
                                isGood ? "Great job!" :
                                    isOkay ? "Good effort!" :
                                        "Keep studying!"}
                        </p>
                    </div>

                    <div className="relative h-28 w-28">
                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                            <circle className="text-muted/20 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                            <circle
                                className={`stroke-current transition-all duration-1000 ease-out ${isPerfect ? "text-yellow-500" : isGood ? "text-green-500" : isOkay ? "text-primary" : "text-orange-500"}`}
                                strokeWidth="10" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold">{pct}%</span>
                        </div>
                    </div>

                    <div className="text-lg">
                        <strong className="text-foreground">{result.correctAnswers}</strong>
                        <span className="text-muted-foreground"> / {result.totalQuestions} correct</span>
                    </div>

                    <div className="flex gap-3 w-full max-w-xs">
                        <Button variant="outline" className="flex-1 gap-2" onClick={onRetry}>
                            <RotateCcw size={14} /> Retry
                        </Button>
                        <Button className="flex-1 gap-2" onClick={onBack}>
                            All Quizzes <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>

                {/* ─── Answer Review ─── */}
                <div className="space-y-3">
                    <h3 className="font-serif font-bold text-lg border-b border-border/40 pb-2">Answer Review</h3>

                    {questions.map((q, idx) => {
                        const answeredQuestionsMap = result.answeredQuestionsJson ? JSON.parse(result.answeredQuestionsJson) : {};
                        const userAnswer = answeredQuestionsMap[q.id];
                        const isCorrect = userAnswer === q.correctIndex;
                        const didAnswer = userAnswer !== undefined;

                        return (
                            <div
                                key={q.id}
                                className={`rounded-xl border-2 p-4 transition-colors ${isCorrect
                                    ? "border-green-200 dark:border-green-800/60 bg-green-50/40 dark:bg-green-900/10"
                                    : "border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-900/10"
                                    }`}
                            >
                                {/* Question header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                        }`}>
                                        {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    </span>
                                    <p className="text-sm font-semibold leading-snug flex-1">
                                        <span className="text-muted-foreground font-normal">Q{idx + 1}.</span>{" "}
                                        {q.question}
                                    </p>
                                </div>

                                {/* Options grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-10">
                                    {q.options.map((opt, optIdx) => {
                                        const isThisCorrect = optIdx === q.correctIndex;
                                        const isThisSelected = optIdx === userAnswer;

                                        let optStyle = "text-muted-foreground bg-transparent";
                                        if (isThisCorrect) {
                                            optStyle = "text-green-700 dark:text-green-400 bg-green-100/60 dark:bg-green-900/20 font-semibold";
                                        } else if (isThisSelected && !isThisCorrect) {
                                            optStyle = "text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-900/20 line-through";
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${optStyle}`}
                                            >
                                                <span className="font-mono text-[10px] opacity-60">{String.fromCharCode(65 + optIdx)}</span>
                                                <span>{opt}</span>
                                                {isThisCorrect && <CheckCircle size={11} className="text-green-500 shrink-0" />}
                                                {isThisSelected && !isThisCorrect && <XCircle size={11} className="text-red-500 shrink-0" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── Bottom Actions ─── */}
                <div className="flex gap-3 pb-6">
                    <Button variant="outline" className="flex-1 gap-2" onClick={onRetry}>
                        <RotateCcw size={14} /> Retry Quiz
                    </Button>
                    <Button className="flex-1 gap-2" onClick={onBack}>
                        All Quizzes <ChevronRight size={14} />
                    </Button>
                </div>
            </main>
        </PageWrapper>
    );
}

// ─── Quiz Hub (Main Page) ────────────────────────────────────────
export default function QuizPage() {
    const { saveResult, getBookResult, getStats } = useQuizProgress();
    const stats = getStats();

    const [activeQuiz, setActiveQuiz] = useState<{ bookSlug: string; bookName: string } | null>(null);
    const [quizResult, setQuizResult] = useState<{ bookName: string; result: BookQuizResult } | null>(null);
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (catId: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };

    // Start a quiz
    const startQuiz = (bookSlug: string, bookName: string) => {
        setQuizResult(null);
        setActiveQuiz({ bookSlug, bookName });
    };

    // Handle quiz finish
    const handleFinish = (result: BookQuizResult) => {
        // Capture existing stats BEFORE saving (saveResult is async)
        const existing = getBookResult(result.bookSlug);
        const displayResult = {
            ...result,
            bestScore: Math.max(result.correctAnswers, existing?.bestScore || 0),
            attempts: (existing?.attempts || 0) + 1,
        };
        saveResult(result);
        setActiveQuiz(null);
        const bookName = AT_BIBLE_BOOKS.find(b => b.slug === result.bookSlug)?.name || result.bookSlug;
        setQuizResult({ bookName, result: displayResult });
    };

    // Active quiz view
    if (activeQuiz) {
        const questions = getBookQuestions(activeQuiz.bookSlug);
        if (questions.length === 0) {
            // Schedule state update for next tick (avoid setState during render)
            return (
                <PageWrapper className="bg-background font-sans flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No questions available for this book yet.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => setActiveQuiz(null)}>Back</Button>
                </PageWrapper>
            );
        }
        return (
            <QuizActive
                bookSlug={activeQuiz.bookSlug}
                bookName={activeQuiz.bookName}
                questions={questions}
                onFinish={handleFinish}
                onCancel={() => setActiveQuiz(null)}
            />
        );
    }

    // Results view
    if (quizResult) {
        const questions = getBookQuestions(quizResult.result.bookSlug);
        return (
            <QuizResults
                bookName={quizResult.bookName}
                result={quizResult.result}
                questions={questions}
                onRetry={() => startQuiz(quizResult.result.bookSlug, quizResult.bookName)}
                onBack={() => setQuizResult(null)}
            />
        );
    }

    // Hub view
    return (
        <PageWrapper className="bg-background font-sans flex flex-col">
            <header className="sticky top-0 z-20 flex items-center px-4 py-3 border-b bg-background/95 backdrop-blur-md">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronLeft size={16} /> Back
                    </Button>
                </Link>
                <div className="flex-1 text-center font-serif font-bold text-lg">Bible Quiz</div>
                <ThemeToggle />
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8 overflow-y-auto">

                {/* ─── Hero Stats ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard emoji="📝" value={stats.booksAttempted} label="Books Attempted" />
                    <StatCard emoji="🏆" value={stats.booksPerfect} label="Perfect Scores" />
                    <StatCard emoji="✅" value={stats.totalCorrect} label="Correct Answers" />
                    <StatCard emoji="📊" value={stats.totalQuestions > 0 ? `${Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}%` : "—"} label="Accuracy" />
                </div>

                {/* ─── Books by Category ─── */}
                {(["OT", "NT"] as const).map(testament => (
                    <div key={testament} className="space-y-4">
                        <h3 className="font-bold text-xl font-serif border-b border-border/40 pb-2">
                            {testament === "OT" ? "📖 Old Testament" : "✝️ New Testament"}
                        </h3>

                        {BIBLE_CATEGORIES.filter(cat => cat.testament === testament).map(cat => {
                            const catBooks = getCategoryBooks(cat.id);
                            const catAttempted = catBooks.filter(b => getBookResult(b.slug)).length;
                            const catPerfect = catBooks.filter(b => {
                                const r = getBookResult(b.slug);
                                return r && r.bestScore === r.totalQuestions;
                            }).length;
                            const isCollapsed = collapsedCategories.has(cat.id);

                            return (
                                <div key={cat.id} className="space-y-3">
                                    <button
                                        onClick={() => toggleCategory(cat.id)}
                                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-card border border-border/40 hover:border-primary/20 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.emoji}</span>
                                            <div>
                                                <div className="font-bold text-sm">{cat.label}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {catAttempted}/{catBooks.length} attempted
                                                    {catPerfect > 0 && <span className="text-yellow-600 dark:text-yellow-400"> · {catPerfect} perfect</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <Progress value={(catAttempted / catBooks.length) * 100} className="h-1.5 w-16 sm:w-24" />
                                            {isCollapsed ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
                                        </div>
                                    </button>

                                    {!isCollapsed && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2 sm:pl-4">
                                            {catBooks.map(book => {
                                                const questions = getBookQuestions(book.slug);
                                                const result = getBookResult(book.slug);
                                                const isPerfect = result && result.bestScore === result.totalQuestions;
                                                const bestPct = result ? Math.round((result.bestScore / result.totalQuestions) * 100) : 0;

                                                if (questions.length === 0) return null;

                                                return (
                                                    <div
                                                        key={book.slug}
                                                        className={`bg-card rounded-xl border p-4 transition-colors group
                                                            ${isPerfect ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50/30 dark:bg-yellow-900/10" : "border-border/40 hover:border-primary/30"}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="font-serif font-bold text-sm flex items-center gap-1.5">
                                                                    {book.name}
                                                                    {isPerfect && <Sparkles size={12} className="text-yellow-500" />}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {questions.length} questions
                                                                </div>
                                                            </div>
                                                            {result && (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                                    ${isPerfect ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                                                        bestPct >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                                                                            "bg-primary/10 text-primary"}`}>
                                                                    Best: {bestPct}%
                                                                </span>
                                                            )}
                                                        </div>

                                                        {result && (
                                                            <div className="mb-3">
                                                                <Progress value={bestPct} className="h-1" />
                                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                                    {result.bestScore}/{result.totalQuestions} · {result.attempts} attempt{result.attempts !== 1 ? "s" : ""}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <Button
                                                            variant={result ? "secondary" : "default"}
                                                            size="sm"
                                                            className="w-full text-xs"
                                                            onClick={() => startQuiz(book.slug, book.name)}
                                                        >
                                                            {isPerfect ? "Play Again" : result ? "Retry" : "Start Quiz"}
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </main>
        </PageWrapper>
    );
}

function StatCard({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
    return (
        <div className="bg-card rounded-xl border border-border/40 p-4 text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-xl sm:text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}
