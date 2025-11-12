import { useQuery } from "@tanstack/react-query";
import { getThreadDetail } from "../apis/thread.api";

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useChat = (threadId: string | null) => {
    return useQuery({
        queryKey: ["chat", threadId],
        enabled: !!threadId,
        staleTime: staleTime,
        gcTime: gcTime,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        queryFn: async () => {
            if (!threadId) return null;
            const response = await getThreadDetail(threadId);
            return response;
        }
    });
};