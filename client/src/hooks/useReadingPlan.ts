import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PlanProgress } from "@shared/schema";
import { ReadingPlanGenerator, ReadingPlan } from "@/lib/ReadingPlanGenerator";

export function useReadingPlan() {
    const queryClient = useQueryClient();

    // Fetch user's active reading plans from API
    const { data: plansData = [], isLoading } = useQuery<PlanProgress[]>({
        queryKey: ["/api/plan-progress"],
    });

    // Start a new reading plan
    const startPlanMutation = useMutation({
        mutationFn: async ({ planId, targetDays, bookSlugs }: { planId: string; targetDays: number; bookSlugs: string[] }) => {
            // First generate the plan logic to ensure it's valid
            ReadingPlanGenerator.generatePlan(planId, bookSlugs, targetDays);

            const res = await apiRequest("POST", "/api/plan-progress", {
                planId,
                startDate: new Date().toISOString(),
                completedDays: "[]",
                isActive: true
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/plan-progress"] });
        }
    });

    // Mark a specific day as completed
    const markDayCompletedMutation = useMutation({
        mutationFn: async ({ id, dayIndex, currentCompleted }: { id: number; dayIndex: number; currentCompleted: number[] }) => {
            const completed = new Set(currentCompleted);
            completed.add(dayIndex);

            const res = await apiRequest("PATCH", `/api/plan-progress/${id}`, {
                completedDays: JSON.stringify(Array.from(completed))
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/plan-progress"] });
        }
    });

    // Mark a specific day as uncomplete
    const markDayUncompletedMutation = useMutation({
        mutationFn: async ({ id, dayIndex, currentCompleted }: { id: number; dayIndex: number; currentCompleted: number[] }) => {
            const completed = new Set(currentCompleted);
            completed.delete(dayIndex);

            const res = await apiRequest("PATCH", `/api/plan-progress/${id}`, {
                completedDays: JSON.stringify(Array.from(completed))
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/plan-progress"] });
        }
    });
    
    // Stop/Archive a reading plan
    const stopPlanMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest("PATCH", `/api/plan-progress/${id}`, {
                isActive: false
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/plan-progress"] });
        }
    });

    // Utility to get the dynamically generated structure alongside the database tracking record
    const getActivePlanDetails = (planProgress: PlanProgress): { record: PlanProgress; template: ReadingPlan } | null => {
        try {
            // This maps the stored DB record to the actual Generated Plan logic.
            // Ideally, the plan definition is stored, but for standard templates we can map it here.
            let template;
            if (planProgress.planId === "whole-bible-365") {
                template = ReadingPlanGenerator.generateWholeBible1Year();
            } else if (planProgress.planId === "gospels-30") {
                template = ReadingPlanGenerator.generateGospels30Days();
            } else {
                throw new Error("Custom plans require bookSlugs parameter storage, currently mapped to presets only.");
            }

            return { record: planProgress, template };
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    return {
        plans: plansData,
        activePlans: plansData.filter(p => p.isActive),
        isLoading,
        startPlan: startPlanMutation.mutate,
        markDayCompleted: markDayCompletedMutation.mutate,
        markDayUncompleted: markDayUncompletedMutation.mutate,
        stopPlan: stopPlanMutation.mutate,
        getActivePlanDetails
    };
}
