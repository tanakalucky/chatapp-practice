import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export const useCreateRoom = () => {
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      setLocation(`/room/${data.roomId}`);
    },
  });
};

const createRoom = async (): Promise<{ roomId: string }> => {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  return response.json();
};
