import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export type EditAction =
    | "highlight_add"
    | "highlight_remove"
    | "highlight_label"
    | "note_add"
    | "note_edit"
    | "note_delete"
    | "favourite_add"
    | "favourite_remove"
    | "link_add"
    | "link_remove";

export interface EditHistoryEntry {
    id: string;
    action: EditAction;
    verseId: number;
    verseRef: string;     // e.g. "John 3:16"
    bookSlug: string;     // e.g. "john"
    chapter: number;
    details: string;      // Human-readable description
    timestamp: number;
}

const MAX_ENTRIES = 500;
const STORAGE_KEY = "armorlight_edit_history";

export function useEditHistory() {
    const [history, setHistory] = useLocalStorage<EditHistoryEntry[]>(STORAGE_KEY, []);

    const addEntry = useCallback((entry: Omit<EditHistoryEntry, "id" | "timestamp">) => {
        const newEntry: EditHistoryEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        setHistory(prev => {
            const updated = [newEntry, ...prev];
            return updated.slice(0, MAX_ENTRIES);
        });
    }, [setHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, [setHistory]);

    return { history, addEntry, clearHistory };
}

// ─── Action Icons & Labels (for rendering) ──────────────────────────

export const ACTION_META: Record<EditAction, { icon: string; label: string; color: string }> = {
    highlight_add: { icon: "🖍️", label: "Highlighted", color: "text-yellow-500" },
    highlight_remove: { icon: "🧹", label: "Removed Highlight", color: "text-muted-foreground" },
    highlight_label: { icon: "🏷️", label: "Labelled", color: "text-purple-500" },
    note_add: { icon: "📝", label: "Added Note", color: "text-blue-500" },
    note_edit: { icon: "✏️", label: "Edited Note", color: "text-blue-400" },
    note_delete: { icon: "🗑️", label: "Deleted Note", color: "text-red-400" },
    favourite_add: { icon: "⭐", label: "Favourited", color: "text-amber-500" },
    favourite_remove: { icon: "☆", label: "Unfavourited", color: "text-muted-foreground" },
    link_add: { icon: "🔗", label: "Added Link", color: "text-green-500" },
    link_remove: { icon: "🔗", label: "Removed Link", color: "text-red-400" },
};
