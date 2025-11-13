import { useQuery } from '@tanstack/react-query';
import { getNoti } from '../apis/noti.api';

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notifications'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 4000 : false,
    queryFn: async () => {
      const response = await getNoti();
      return response;
    },
  });
};
