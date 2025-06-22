import { MessageForm } from './components/MessageForm';

interface ChatRoomPageProps {
  params: { id: string };
}

export function ChatRoomPage({ params }: ChatRoomPageProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col'>
      {/* メッセージエリア - 将来メッセージ表示に使用 */}
      <div className='flex-1 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-gray-400 mb-2'>
            Welcome to the chat room
          </h1>
          <p className='text-gray-500 text-sm'>Messages will appear here</p>
        </div>
      </div>

      {/* 入力エリア - 下部固定 */}
      <div className='border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4'>
        <MessageForm roomId={params.id} />
      </div>
    </div>
  );
}
