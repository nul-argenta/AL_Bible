import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MemoryCard {
    id: number;
    verse_id: number;
    chapter: number;
    verse: number;
    text_primary: string;
    book_name: string;
    book_slug: string;
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review: string;
}

interface MemoryStats {
    total: number;
    due: number;
    mastered: number;
}

export function useMemoryCards() {
    const queryClient = useQueryClient();

    const { data: dueCards = [], isLoading } = useQuery<MemoryCard[]>({
        queryKey: ["memory", "due"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/memory/due");
            return res.json();
        }
    });

    const { data: stats } = useQuery<MemoryStats>({
        queryKey: ["memory", "stats"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/memory/stats");
            return res.json();
        }
    });

    const addCard = useMutation({
        mutationFn: async (verseId: number) => {
            await apiRequest("POST", "/api/memory/add", { verseId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["memory"] });
        }
    });

    const reviewCard = useMutation({
        mutationFn: async ({ verseId, quality }: { verseId: number; quality: number }) => {
            const res = await apiRequest("POST", "/api/memory/review", { verseId, quality });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["memory"] });
        }
    });

    const removeCard = useMutation({
        mutationFn: async (verseId: number) => {
            await apiRequest("DELETE", `/api/memory/${verseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["memory"] });
        }
    });

    return { dueCards, isLoading, stats, addCard, reviewCard, removeCard };
}
