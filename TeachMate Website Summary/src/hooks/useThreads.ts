import { useQuery } from '@tanstack/react-query';
import { getThreads } from '../apis/thread.api';

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useThreads = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['threads'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 5000 : false,
    queryFn: async () => {
      const response = await getThreads();
      return response;
    },
  });
};
