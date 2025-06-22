import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSendMessage } from '../hooks/useSendMessage';

interface MessageFormProps {
  roomId: string;
  author: string;
  onSendMessage: (content: string) => boolean;
  isConnected: boolean;
}

export function MessageForm({
  roomId,
  author,
  onSendMessage,
  isConnected,
}: MessageFormProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const sendMessageMutation = useSendMessage(roomId);

  const sendMessage = () => {
    if (!content.trim() || !author.trim()) {
      return;
    }

    // WebSocketが接続されている場合はWebSocketで送信、でなければHTTP APIを使用
    if (isConnected) {
      const success = onSendMessage(content.trim());
      if (success) {
        setContent('');
      } else {
        // WebSocket送信に失敗した場合はHTTP APIにフォールバック
        fallbackToHttpSend();
      }
    } else {
      // WebSocketが接続されていない場合はHTTP APIを使用
      fallbackToHttpSend();
    }
  };

  const fallbackToHttpSend = () => {
    sendMessageMutation.mutate(
      { content: content.trim(), author: author.trim() },
      {
        onSuccess: () => {
          setContent('');
          // メッセージ送信成功後に履歴を再取得
          queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !(e.nativeEvent as KeyboardEvent).isComposing
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto'>
      <form onSubmit={handleSubmit} className='flex gap-3 items-start'>
        {/* Message input */}
        <div className='flex-1'>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type your message...'
            rows={1}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            disabled={sendMessageMutation.isPending}
          />
        </div>

        {/* Send button */}
        <button
          type='submit'
          disabled={
            !content.trim() || !author.trim() || sendMessageMutation.isPending
          }
          className={`flex-shrink-0 px-4 py-2 text-white text-sm font-medium rounded-md transition-colors duration-200 ${
            isConnected
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:bg-gray-600 disabled:cursor-not-allowed`}
        >
          {sendMessageMutation.isPending
            ? 'Sending...'
            : isConnected
              ? 'Send (RT)'
              : 'Send'}
        </button>
      </form>

      {/* Status messages */}
      {sendMessageMutation.isError && (
        <div className='mt-2 p-2 bg-red-900/50 border border-red-500 rounded-md'>
          <p className='text-red-300 text-xs'>
            Failed to send message. Please try again.
          </p>
        </div>
      )}

      {sendMessageMutation.isSuccess && (
        <div className='mt-2 p-2 bg-green-900/50 border border-green-500 rounded-md'>
          <p className='text-green-300 text-xs'>Message sent successfully!</p>
        </div>
      )}
    </div>
  );
}
