import { useQuery } from '@tanstack/react-query';
import { getThreadGroups } from '../apis/thread.api';

const staleTime = 1000 * 60 * 2; // 2 minutes
const gcTime = 1000 * 60 * 10; // 10 minutes
const refetchInterval = 10000; // 10s polling

export const useThreadGroups = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['threadGroups'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? refetchInterval : false,
    queryFn: async () => {
      const response = await getThreadGroups();
      return response;
    },
  });
};
