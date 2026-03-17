import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ─── Highlight Labels ───────────────────────────────────────────────

export const HIGHLIGHT_LABELS = [
    { name: "Prophecy", value: "prophecy", emoji: "🔮" },
    { name: "Promise", value: "promise", emoji: "🤝" },
    { name: "Command", value: "command", emoji: "⚡" },
    { name: "Prayer", value: "prayer", emoji: "🙏" },
    { name: "Wisdom", value: "wisdom", emoji: "💎" },
] as const;

export type HighlightLabel = typeof HIGHLIGHT_LABELS[number]["value"];

interface HighlightEntry {
    color: string;
    label?: string;
}

interface Note {
    verse_id: number;
    text: string;
    created_at: string;
    updated_at: string;
}

export const HIGHLIGHT_COLORS = [
    { name: "Yellow", value: "yellow", bg: "bg-yellow-200/50", ring: "ring-yellow-300", dot: "bg-yellow-400" },
    { name: "Green", value: "green", bg: "bg-green-200/50", ring: "ring-green-300", dot: "bg-green-400" },
    { name: "Blue", value: "blue", bg: "bg-blue-200/50", ring: "ring-blue-300", dot: "bg-blue-400" },
    { name: "Pink", value: "pink", bg: "bg-pink-200/50", ring: "ring-pink-300", dot: "bg-pink-400" },
    { name: "Purple", value: "purple", bg: "bg-purple-200/50", ring: "ring-purple-300", dot: "bg-purple-400" },
] as const;

export type HighlightColor = typeof HIGHLIGHT_COLORS[number]["value"];

export function getHighlightStyle(color: string) {
    return HIGHLIGHT_COLORS.find(c => c.value === color) || HIGHLIGHT_COLORS[0];
}

export function getHighlightLabel(label?: string) {
    if (!label) return null;
    return HIGHLIGHT_LABELS.find(l => l.value === label) || null;
}

// ─── Highlights Hook (API) ──────────────────────────────────────────

export function useHighlights(book: string, chapter: number) {
    const queryClient = useQueryClient();
    const queryKey = ["highlights", book, chapter];

    const { data: highlightsArray = [] } = useQuery<{ verseId: number, color: string, label: string | null }[]>({
        queryKey,
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/highlights/${book}/${chapter}`);
            return res.json();
        }
    });

    const highlightMap = useMemo(() => {
        const map = new Map<number, HighlightEntry>();
        for (const h of highlightsArray) {
            map.set(h.verseId, { color: h.color, label: h.label || undefined });
        }
        return map;
    }, [highlightsArray]);

    const setHighlight = useMutation({
        mutationFn: async ({ verseId, color, label }: { verseId: number; color: string; label?: string }) => {
            await apiRequest("POST", "/api/highlights", { verse_id: verseId, color, label });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });

    const setHighlightLabel = useMutation({
        mutationFn: async ({ verseId, label }: { verseId: number; label?: string }) => {
            // We need to pass the existing color when updating just the label
            const existing = highlightMap.get(verseId);
            if (!existing) return;
            await apiRequest("POST", "/api/highlights", { verse_id: verseId, color: existing.color, label });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });

    const removeHighlight = useMutation({
        mutationFn: async (verseId: number) => {
            await apiRequest("DELETE", `/api/highlights/${verseId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });

    return { highlightMap, setHighlight, setHighlightLabel, removeHighlight };
}

// ─── Notes Hook (API) ───────────────────────────────────────────────

export function useNotes(book: string, chapter: number) {
    const queryClient = useQueryClient();
    const queryKey = ["notes", book, chapter];

    const { data: notesArray = [] } = useQuery<{ verseId: number, text: string }[]>({
        queryKey,
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/notes/${book}/${chapter}`);
            return res.json();
        }
    });

    const noteMap = useMemo(() => {
        const map = new Map<number, string>();
        for (const n of notesArray) {
            map.set(n.verseId, n.text);
        }
        return map;
    }, [notesArray]);

    const saveNote = useMutation({
        mutationFn: async ({ verseId, text }: { verseId: number; text: string }) => {
            if (!text || !text.trim()) {
                await apiRequest("DELETE", `/api/notes/${verseId}`);
                return;
            }
            await apiRequest("POST", "/api/notes", { verse_id: verseId, text: text.trim() });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });

    const deleteNote = useMutation({
        mutationFn: async (verseId: number) => {
            await apiRequest("DELETE", `/api/notes/${verseId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey })
    });

    return { noteMap, saveNote, deleteNote };
}
