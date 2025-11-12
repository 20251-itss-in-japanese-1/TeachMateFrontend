import { useQuery } from '@tanstack/react-query';
import { friendSuggest, getFriendList, getFriendRequest } from '../apis/friend.api';

const staleTime = 1000 * 60 * 5; // 5 minutes
const gcTime = 1000 * 60 * 20; // 20 minutes

export const useFriendList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friends'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 12000 : false,
    queryFn: async () => {
      const response = await getFriendList();
      return response;
    },
  });
};

export const useFriendRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friendRequests'],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 10000 : false,
    queryFn: async () => {
      const response = await getFriendRequest();
      return response;
    },
  });
};

export const useFriendSuggestions = (
  page: number,
  limit: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['friendSuggestions', page, limit],
    enabled,
    staleTime,
    gcTime,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: enabled ? 10000 : false,
    queryFn: async () => {
      const response = await friendSuggest(page, limit);
      return response;
    },
  });
};
