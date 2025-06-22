import { LoadingSpinner } from '../../components/LoadingSpinner';
import { MessageForm } from './components/MessageForm';
import { MessageList } from './components/MessageList';
import { useMessages } from './hooks/useMessages';

interface ChatRoomPageProps {
  params: { id: string };
}

export function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { data: messagesResponse, isLoading, error } = useMessages(params.id);

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

  const messages = messagesResponse?.success
    ? messagesResponse.messages || []
    : [];

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col'>
      {/* メッセージエリア */}
      <MessageList messages={messages} />

      {/* 入力エリア - 下部固定 */}
      <div className='border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4'>
        <MessageForm roomId={params.id} />
      </div>
    </div>
  );
}
