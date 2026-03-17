import { useMemo, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAuth } from "./useSafeAuth";

export interface FavouriteEntry {
    verseId: number;
    verseRef: string;     // "John 3:16"
    bookSlug: string;     // "john"
    chapter: number;
    verse: number;
    bookOrder: number;    // For biblical sort (1=Genesis, 66=Revelation)
    text: string;         // Preview text
    timestamp: number;
}

const STORAGE_KEY = "armorlight_favourites";

export function useFavourites() {
    const queryClient = useQueryClient();
    const { getToken, isSignedIn } = useSafeAuth();

    // Fallback local storage
    const [localFavourites, setLocalFavourites] = useLocalStorage<Record<number, FavouriteEntry>>(STORAGE_KEY, {});

    // Main Query
    const { data: favouritesMap = {} } = useQuery({
        queryKey: ["favourites", isSignedIn],
        queryFn: async (): Promise<Record<number, FavouriteEntry>> => {
            if (!isSignedIn) return localFavourites;

            const token = await getToken();
            const res = await fetch("/api/sync/favourites", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch cloud favourites");

            const rows: any[] = await res.json();
            const cloudMap: Record<number, FavouriteEntry> = {};

            rows.forEach(row => {
                cloudMap[row.verse_id] = {
                    verseId: row.verse_id,
                    verseRef: `${row.book_name} ${row.verse_chapter}:${row.verse_num}`,
                    bookSlug: row.book_name.toLowerCase().replace(/ /g, ""), // Very basic slug mapping for now
                    chapter: row.verse_chapter,
                    verse: row.verse_num,
                    bookOrder: row.book_id,
                    text: row.text_web,
                    timestamp: new Date(row.created_at).getTime()
                };
            });

            return cloudMap;
        },
        staleTime: 1000 * 60 * 5 // 5 min
    });

    const isFavourite = useCallback((verseId: number) => {
        return !!favouritesMap[verseId];
    }, [favouritesMap]);

    const addFavouriteMutation = useMutation({
        mutationFn: async (entry: Omit<FavouriteEntry, "timestamp">) => {
            if (!isSignedIn) {
                setLocalFavourites(prev => ({
                    ...prev,
                    [entry.verseId]: { ...entry, timestamp: Date.now() }
                }));
                return;
            }

            const token = await getToken();
            const res = await fetch("/api/sync/favourites", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ verseId: entry.verseId })
            });

            if (!res.ok) throw new Error("Failed to sync favourite");
        },
        onMutate: async (entry) => {
            await queryClient.cancelQueries({ queryKey: ["favourites", isSignedIn] });
            const previous = queryClient.getQueryData<Record<number, FavouriteEntry>>(["favourites", isSignedIn]) || {};
            queryClient.setQueryData(["favourites", isSignedIn], {
                ...previous,
                [entry.verseId]: { ...entry, timestamp: Date.now() }
            });
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["favourites", isSignedIn], context.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["favourites", isSignedIn] });
        }
    });

    const removeFavouriteMutation = useMutation({
        mutationFn: async (verseId: number) => {
            if (!isSignedIn) {
                setLocalFavourites(prev => {
                    const next = { ...prev };
                    delete next[verseId];
                    return next;
                });
                return;
            }

            const token = await getToken();
            const res = await fetch(`/api/sync/favourites/${verseId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to delete cloud favourite");
        },
        onMutate: async (verseId) => {
            await queryClient.cancelQueries({ queryKey: ["favourites", isSignedIn] });
            const previous = queryClient.getQueryData<Record<number, FavouriteEntry>>(["favourites", isSignedIn]) || {};
            const next = { ...previous };
            delete next[verseId];
            queryClient.setQueryData(["favourites", isSignedIn], next);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["favourites", isSignedIn], context.previous);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["favourites", isSignedIn] });
        }
    });

    const toggleFavourite = useCallback((entry: Omit<FavouriteEntry, "timestamp">) => {
        if (favouritesMap[entry.verseId]) {
            removeFavouriteMutation.mutate(entry.verseId);
        } else {
            addFavouriteMutation.mutate(entry);
        }
    }, [favouritesMap, addFavouriteMutation, removeFavouriteMutation]);

    const removeFavourite = useCallback((verseId: number) => {
        removeFavouriteMutation.mutate(verseId);
    }, [removeFavouriteMutation]);

    const allFavourites = useMemo(() => {
        return Object.values(favouritesMap);
    }, [favouritesMap]);

    const favouriteCount = allFavourites.length;

    return { isFavourite, toggleFavourite, removeFavourite, allFavourites, favouriteCount };
}
