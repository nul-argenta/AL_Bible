import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface BookQuizResult {
    bookSlug: string;
    totalQuestions: number;
    correctAnswers: number;
    bestScore: number;
    attempts: number;
    lastAttempt: number;
    answeredQuestionsJson?: string;
}

export function useQuizProgress() {
    const queryClient = useQueryClient();

    const { data: results = [] } = useQuery<BookQuizResult[]>({
        queryKey: ["/api/quiz"],
    });

    const saveMutation = useMutation({
        mutationFn: async (result: Partial<BookQuizResult> & { bookSlug: string }) => {
            const res = await apiRequest("POST", "/api/quiz", result);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/quiz"] });
        }
    });

    const resetMutation = useMutation({
        mutationFn: async (bookSlug: string) => {
            const res = await apiRequest("DELETE", `/api/quiz/${bookSlug}`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/quiz"] });
        }
    });

    const saveResult = useCallback((result: BookQuizResult) => {
        saveMutation.mutate(result);
    }, [saveMutation]);

    const getBookResult = useCallback((bookSlug: string): BookQuizResult | null => {
        return results.find(r => r.bookSlug === bookSlug) || null;
    }, [results]);

    const getStats = useCallback(() => {
        const booksAttempted = results.length;
        const booksPerfect = results.filter(r => r.bestScore === r.totalQuestions).length;
        const totalCorrect = results.reduce((sum, r) => sum + r.bestScore, 0);
        const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);

        return { booksAttempted, booksPerfect, totalCorrect, totalQuestions };
    }, [results]);

    const resetBook = useCallback((bookSlug: string) => {
        resetMutation.mutate(bookSlug);
    }, [resetMutation]);

    return {
        progress: results,
        saveResult,
        getBookResult,
        getStats,
        resetBook,
    };
}
