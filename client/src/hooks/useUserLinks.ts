import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UserLink {
    id: string;
    fromVerseId: number;
    toVerseId: number;
    toVerseRef: string;
    toBookSlug: string;
    toChapter: number;
    toVerse: number;
    toText: string;
    createdAt: number;
}

export function useUserLinks(fromVerseId: number) {
    const queryClient = useQueryClient();

    // Query: Get links for this verse
    const { data: userLinks = [] } = useQuery<UserLink[]>({
        queryKey: ["/api/user-links", { fromVerseId }],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/user-links?fromVerseId=${fromVerseId}`);
            return res.json();
        }
    });

    // Mutation: Add a link
    const addLink = useMutation({
        mutationFn: async (link: Omit<UserLink, "id" | "createdAt" | "fromVerseId">) => {
            const newLink = {
                ...link,
                id: crypto.randomUUID(),
                fromVerseId,
                createdAt: Date.now()
            };
            await apiRequest("POST", "/api/user-links", newLink);
            return newLink;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user-links", { fromVerseId }] });
        }
    });

    // Mutation: Remove a link
    const removeLink = useMutation({
        mutationFn: async (linkId: string) => {
            await apiRequest("DELETE", `/api/user-links/${linkId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user-links", { fromVerseId }] });
        }
    });

    return {
        userLinks,
        addLink,
        removeLink
    };
}
