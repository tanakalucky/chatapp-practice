import type { Message, WebSocketMessage } from '@/types/chat';
import { useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MessageForm } from './components/MessageForm';
import { MessageList } from './components/MessageList';
import { useMessages } from './hooks/useMessages';
import { useWebSocket } from './hooks/useWebSocket';

interface ChatRoomPageProps {
  params: { id: string };
}

export function ChatRoomPage({ params }: ChatRoomPageProps) {
  const [author, setAuthor] = useState<string>('');
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');

  const { data: messagesResponse, isLoading, error } = useMessages(params.id);

  // WebSocketメッセージの処理
  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === 'message' && wsMessage.messageId) {
        const message: Message = {
          id: wsMessage.messageId,
          content: wsMessage.content,
          author: wsMessage.author,
          timestamp: wsMessage.timestamp || new Date().toISOString(),
          roomId: params.id,
        };

        setRealtimeMessages((prev) => {
          // 重複を防ぐため、既存のメッセージIDをチェック
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    },
    [params.id],
  );

  const { isConnected, isConnecting, sendMessage } = useWebSocket({
    roomId: params.id,
    author: author || 'Anonymous',
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      console.log('Chat room WebSocket connected');
      setConnectionStatus('connected');
    },
    onClose: () => {
      console.log('Chat room WebSocket disconnected');
      setConnectionStatus('disconnected');
    },
    onError: (error) => {
      console.error('Chat room WebSocket error:', error);
    },
  });

  // 接続ステータスの更新
  useEffect(() => {
    if (isConnecting) {
      setConnectionStatus('connecting');
    } else if (isConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, isConnecting]);

  // ユーザー名の設定
  useEffect(() => {
    if (!author) {
      const savedAuthor = localStorage.getItem('chat-author');
      if (savedAuthor) {
        setAuthor(savedAuthor);
      } else {
        const newAuthor = `User-${Math.random().toString(36).substr(2, 5)}`;
        setAuthor(newAuthor);
        localStorage.setItem('chat-author', newAuthor);
      }
    }
  }, [author]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-red-400 mb-2'>
            Error loading messages
          </h1>
          <p className='text-gray-500 text-sm'>Please try again later</p>
        </div>
      </div>
    );
  }

  // 初期メッセージとリアルタイムメッセージを結合
  const initialMessages = messagesResponse?.success
    ? messagesResponse.messages || []
    : [];

  const allMessages = [...initialMessages, ...realtimeMessages]
    .filter(
      (message, index, array) =>
        // 重複を除去（IDベース）
        array.findIndex((m) => m.id === message.id) === index,
    )
    .sort((a, b) => a.id.localeCompare(b.id)); // ULIDでソート

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col'>
      {/* ヘッダー - 接続状態表示 */}
      <div className='bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold text-white'>Chat Room</h1>
          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-400'>as {author}</span>
            <div className='flex items-center gap-2'>
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-400'
                    : connectionStatus === 'connecting'
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-red-400'
                }`}
              />
              <span className='text-sm text-gray-400 capitalize'>
                {connectionStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <MessageList messages={allMessages} />

      {/* 入力エリア - 下部固定 */}
      <div className='border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4'>
        <MessageForm
          roomId={params.id}
          author={author}
          onSendMessage={sendMessage}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
