import type { Message } from '@/types/chat';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  if (messages.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-gray-400 mb-2'>
            Welcome to the chat room
          </h1>
          <p className='text-gray-500 text-sm'>
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className='flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-9rem)]'
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'
        >
          <div className='flex items-start justify-between mb-2'>
            <span className='font-medium text-blue-400'>{message.author}</span>
            <span className='text-xs text-gray-500'>
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
          <p className='text-gray-300 whitespace-pre-wrap break-words'>
            {message.content}
          </p>
        </div>
      ))}
    </div>
  );
}
