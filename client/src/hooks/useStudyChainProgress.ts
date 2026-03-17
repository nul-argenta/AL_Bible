import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCallback } from "react";

export interface StudyChainProgress {
    chainId: string;
    passageIndicesJson: string;
}

export function useStudyChainProgress() {
    const queryClient = useQueryClient();

    const { data: allProgress = [] } = useQuery<StudyChainProgress[]>({
        queryKey: ["/api/study-chains"],
    });

    const saveMutation = useMutation({
        mutationFn: async ({ chainId, passageIndices }: { chainId: string; passageIndices: number[] }) => {
            await apiRequest("POST", "/api/study-chains", { chainId, passageIndices });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/study-chains"] });
        }
    });

    const resetMutation = useMutation({
        mutationFn: async (chainId: string) => {
            await apiRequest("DELETE", `/api/study-chains/${chainId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/study-chains"] });
        }
    });

    const markVisited = useCallback((chainId: string, passageIndex: number) => {
        const existing = allProgress.find(p => p.chainId === chainId);
        const indices: number[] = existing ? JSON.parse(existing.passageIndicesJson) : [];
        if (indices.includes(passageIndex)) return;

        const updated = [...indices, passageIndex].sort((a, b) => a - b);
        saveMutation.mutate({ chainId, passageIndices: updated });
    }, [allProgress, saveMutation]);

    const getVisited = useCallback((chainId: string): number[] => {
        const found = allProgress.find(p => p.chainId === chainId);
        return found ? JSON.parse(found.passageIndicesJson) : [];
    }, [allProgress]);

    const resetChain = useCallback((chainId: string) => {
        resetMutation.mutate(chainId);
    }, [resetMutation]);

    return { markVisited, getVisited, resetChain };
}
