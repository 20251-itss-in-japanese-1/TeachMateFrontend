import { useQuery } from '@tanstack/react-query';
import { getThreadAttachments } from '../apis/thread.api';

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useThreadAttachments = (threadId: string | null | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['threadAttachments', threadId],
    enabled: enabled && !!threadId,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled && threadId ? 2000 : false, // Poll every 2 seconds
    queryFn: async () => {
      if (!threadId) return null;
      const response = await getThreadAttachments(threadId);
      return response;
    },
  });
};
