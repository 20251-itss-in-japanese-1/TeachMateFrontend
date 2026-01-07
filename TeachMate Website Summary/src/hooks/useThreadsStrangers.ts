import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getThreadsStrangers } from '../apis/thread.api';
import { ThreadsResponse } from '../types/thread.type';

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useThreadsStrangers = (enabled: boolean = false): UseQueryResult<ThreadsResponse> => {
  return useQuery<ThreadsResponse>({
    queryKey: ['threads', 'strangers'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 5000 : false,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const response = await getThreadsStrangers();
      return response;
    },
  });
};
