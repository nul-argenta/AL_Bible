import { useQuery } from "@tanstack/react-query";
import type { CrossReference } from "@shared/schema";

export interface FormattedCrossReference extends CrossReference {
    bookName: string;
    chapter: number;
    verse: number;
    previewText?: string;
}

export function useCrossReferences(verseId: number | null) {
    // Fetch cross-references from API based on the selected verse
    const { data: crossReferences = [], isLoading, error } = useQuery<FormattedCrossReference[]>({
        queryKey: ["/api/verses", verseId, "cross-references"],
        enabled: !!verseId, // Only run the query if a verseId is provided
    });

    return {
        crossReferences,
        isLoading,
        error,
        hasReferences: crossReferences.length > 0
    };
}
