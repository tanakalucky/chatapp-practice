import { useState } from 'react';
import { useSendMessage } from '../hooks/useSendMessage';

interface MessageFormProps {
  roomId: string;
}

export function MessageForm({ roomId }: MessageFormProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const sendMessageMutation = useSendMessage(roomId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !author.trim()) {
      return;
    }

    sendMessageMutation.mutate(
      { content: content.trim(), author: author.trim() },
      {
        onSuccess: () => {
          setContent('');
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
        },
      },
    );
  };

  return (
    <div className='w-full max-w-2xl'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='author'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Your Name
          </label>
          <input
            id='author'
            type='text'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder='Enter your name'
            className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            disabled={sendMessageMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor='content'
            className='block text-sm font-medium text-gray-300 mb-2'
          >
            Message
          </label>
          <textarea
            id='content'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Type your message here...'
            rows={3}
            className='w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
            disabled={sendMessageMutation.isPending}
          />
        </div>

        <button
          type='submit'
          disabled={
            !content.trim() || !author.trim() || sendMessageMutation.isPending
          }
          className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200'
        >
          {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {sendMessageMutation.isError && (
        <div className='mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg'>
          <p className='text-red-300 text-sm'>
            Failed to send message. Please try again.
          </p>
        </div>
      )}

      {sendMessageMutation.isSuccess && (
        <div className='mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg'>
          <p className='text-green-300 text-sm'>Message sent successfully!</p>
        </div>
      )}
    </div>
  );
}
