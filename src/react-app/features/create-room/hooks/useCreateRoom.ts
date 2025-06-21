import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';

// 部屋作成API呼び出し関数
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

// 部屋作成カスタムフック
export const useCreateRoom = () => {
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      // 成功時に部屋ページへリダイレクト
      setLocation(`/room/${data.roomId}`);
    },
  });
};
