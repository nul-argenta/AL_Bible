import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PlanProgress {
    id: number;
    plan_id: string;
    start_date: string;
    completed_days: string; // JSON array
    is_active: number;
}

export function useDevotionalPlan() {
    const queryClient = useQueryClient();

    const { data: activePlan, isLoading } = useQuery<PlanProgress | null>({
        queryKey: ["plans", "active"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/plans/active");
            return res.json();
        }
    });

    const startPlan = useMutation({
        mutationFn: async (planId: string) => {
            await apiRequest("POST", "/api/plans/start", { planId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        }
    });

    const completeDay = useMutation({
        mutationFn: async ({ planId, day }: { planId: string; day: number }) => {
            const res = await apiRequest("POST", "/api/plans/complete-day", { planId, day });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        }
    });

    const abandonPlan = useMutation({
        mutationFn: async (planId: string) => {
            await apiRequest("DELETE", `/api/plans/${planId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        }
    });

    const completedDays: number[] = activePlan?.completed_days
        ? JSON.parse(activePlan.completed_days)
        : [];

    return { activePlan, completedDays, isLoading, startPlan, completeDay, abandonPlan };
}
