import { useQuery } from '@tanstack/react-query';
import { getUserSchedules } from '../apis/schedule.api';
import { ScheduleFilters } from '../types/schedule.type';

const staleTime = 1000 * 60 * 2; // 2 minutes
const gcTime = 1000 * 60 * 10; // 10 minutes
const refetchInterval = 10000; // 10s polling

export const useUserSchedules = (filters: ScheduleFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['userSchedules', filters],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? refetchInterval : false,
    queryFn: async () => {
      const response = await getUserSchedules(filters);
      return response;
    },
  });
};
