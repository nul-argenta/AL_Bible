import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Verse } from "@/lib/types";

export function useBible(book: string, chapter: number) {
    return useQuery<Verse[]>({
        queryKey: ["verses", book, chapter],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/bible/${book}/${chapter}`);
            return res.json();
        },
    });
}
