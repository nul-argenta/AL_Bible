import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface PrayerRequest {
    id: number;
    title: string;
    body: string | null;
    category: string;
    verse_ref: string | null;
    is_answered: number;
    answered_date: string | null;
    created_at: string;
    updated_at: string;
}

export function usePrayerJournal() {
    const queryClient = useQueryClient();

    const { data: prayers = [], isLoading } = useQuery<PrayerRequest[]>({
        queryKey: ["prayers"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/prayers");
            return res.json();
        }
    });

    const addPrayer = useMutation({
        mutationFn: async (data: { title: string; body?: string; category?: string; verse_ref?: string }) => {
            const res = await apiRequest("POST", "/api/prayers", data);
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prayers"] })
    });

    const toggleAnswered = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("PATCH", `/api/prayers/${id}/answer`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prayers"] })
    });

    const deletePrayer = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/prayers/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prayers"] })
    });

    const active = prayers.filter(p => !p.is_answered);
    const answered = prayers.filter(p => p.is_answered);

    return { prayers, active, answered, isLoading, addPrayer, toggleAnswered, deletePrayer };
}
