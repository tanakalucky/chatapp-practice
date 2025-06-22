import type { SendMessageRequest, SendMessageResponse } from '@/types/chat';
import { useMutation } from '@tanstack/react-query';

export const useSendMessage = (roomId: string) => {
  return useMutation({
    mutationFn: (messageData: SendMessageRequest) =>
      sendMessage(roomId, messageData),
  });
};

const sendMessage = async (
  roomId: string,
  messageData: SendMessageRequest,
): Promise<SendMessageResponse> => {
  const response = await fetch(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
