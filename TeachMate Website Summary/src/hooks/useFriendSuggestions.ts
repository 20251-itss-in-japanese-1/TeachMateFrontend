import { useQuery } from '@tanstack/react-query';
import { friendSuggest, FriendSuggestParams } from '../apis/friend.api';

export const useFriendSuggestions = (params: FriendSuggestParams = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friendSuggestions', params],
    queryFn: () => friendSuggest(params),
    enabled,
    staleTime: 30000,
  });
};
