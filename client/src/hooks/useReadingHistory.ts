import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface ReadingHistoryEntry {
    bookSlug: string;
    bookName: string;
    chapter: number;
    verse?: number;
    timestamp: number | string;
}

export function useReadingHistory() {
    const queryClient = useQueryClient();

    // Fetch history from API
    const { data: history = [] } = useQuery<ReadingHistoryEntry[]>({
        queryKey: ["/api/history"],
    });

    // Record a visit to a chapter
    const recordMutation = useMutation({
        mutationFn: async (entry: Omit<ReadingHistoryEntry, "timestamp">) => {
            const res = await apiRequest("POST", "/api/history", entry);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/history"] });
        }
    });

    const recordVisit = useCallback((entry: Omit<ReadingHistoryEntry, "timestamp">) => {
        recordMutation.mutate(entry);
    }, [recordMutation]);

    // Get the most recent entries (for "Recently Read" section)
    const getRecent = useCallback((count: number = 5): ReadingHistoryEntry[] => {
        return history.slice(0, count);
    }, [history]);

    // Get the last visited chapter for a specific book
    const getLastVisited = useCallback((bookSlug: string): ReadingHistoryEntry | null => {
        return history.find(e => e.bookSlug === bookSlug) || null;
    }, [history]);

    // Get a formatted relative time string
    const getRelativeTime = useCallback((timestamp: number | string): string => {
        const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
        const diff = Date.now() - time;

        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;

        return new Date(time).toLocaleDateString();
    }, []);

    return {
        history,
        recordVisit,
        getRecent,
        getLastVisited,
        getRelativeTime,
    };
}
