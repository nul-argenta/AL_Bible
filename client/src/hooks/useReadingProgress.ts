import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TOTAL_CHAPTERS } from "@/lib/bibleData";
import { apiRequest } from "@/lib/queryClient";

// Data Structure: { "genesis": [1, 2, 3], "exodus": [1] }
export type ReadingProgress = Record<string, number[]>;

export function useReadingProgress() {
    const queryClient = useQueryClient();

    const { data: progress = {} } = useQuery({
        queryKey: ["reading-progress"],
        queryFn: async (): Promise<ReadingProgress> => {
            const res = await apiRequest("GET", "/api/sync/progress");
            const rows: { book_slug: string, chapter: number, is_read: number }[] = await res.json();

            const cloudProgress: ReadingProgress = {};

            rows.forEach(row => {
                if (row.is_read) {
                    if (!cloudProgress[row.book_slug]) cloudProgress[row.book_slug] = [];
                    cloudProgress[row.book_slug].push(row.chapter);
                }
            });

            return cloudProgress;
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const toggleChapter = useMutation({
        mutationFn: async ({ book, chapter }: { book: string; chapter: number }) => {
            const current = progress;
            const bookProgress = current[book] || [];

            const isCurrentlyRead = bookProgress.includes(chapter);
            const willBeRead = !isCurrentlyRead;

            await apiRequest("POST", "/api/sync/progress", {
                bookSlug: book,
                chapter,
                isRead: willBeRead
            });

            let updatedBookProgress;
            if (isCurrentlyRead) {
                updatedBookProgress = bookProgress.filter(c => c !== chapter);
            } else {
                updatedBookProgress = [...bookProgress, chapter].sort((a, b) => a - b);
            }

            return { ...current, [book]: updatedBookProgress };
        },
        onMutate: async ({ book, chapter }) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ["reading-progress"] });
            const previous = queryClient.getQueryData<ReadingProgress>(["reading-progress"]) || {};

            const bookProgress = previous[book] || [];
            const isCurrentlyRead = bookProgress.includes(chapter);

            let updatedBookProgress;
            if (isCurrentlyRead) {
                updatedBookProgress = bookProgress.filter(c => c !== chapter);
            } else {
                updatedBookProgress = [...bookProgress, chapter].sort((a, b) => a - b);
            }

            const optimistic = { ...previous, [book]: updatedBookProgress };
            queryClient.setQueryData(["reading-progress"], optimistic);

            return { previous };
        },
        onError: (_err, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(["reading-progress"], context.previous);
            }
        },
        onSettled: () => {
            // Background refetch to ensure parity
            queryClient.invalidateQueries({ queryKey: ["reading-progress"] });
        }
    });

    const isRead = (book: string, chapter: number) => {
        return progress[book]?.includes(chapter) || false;
    };

    const getStats = () => {
        let totalRead = 0;
        Object.values(progress).forEach(chapters => {
            totalRead += chapters.length;
        });

        return {
            totalRead,
            totalChapters: TOTAL_CHAPTERS,
            percent: Math.round((totalRead / TOTAL_CHAPTERS) * 100) || 0
        };
    };

    return {
        progress,
        toggleChapter,
        isRead,
        getStats
    };
}
