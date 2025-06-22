import type { GetMessagesResponse } from '@/types/chat';
import { useQuery } from '@tanstack/react-query';

export const useMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => getMessages(roomId),
    enabled: !!roomId,
  });
};

const getMessages = async (roomId: string): Promise<GetMessagesResponse> => {
  const response = await fetch(`/api/rooms/${roomId}/messages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
