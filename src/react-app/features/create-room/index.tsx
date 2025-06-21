import { useCreateRoom } from './hooks/useCreateRoom';

export function CreateRoomPage() {
  const createRoomMutation = useCreateRoom();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center px-4'>
      <div className='text-center space-y-8 max-w-md w-full'>
        <div className='space-y-4'>
          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Chat App
          </h1>
          <p className='text-gray-400 text-lg leading-relaxed'>
            Create a new room to start chatting with others instantly
          </p>
        </div>

        <div className='w-full space-y-4'>
          <button
            type='button'
            onClick={() => createRoomMutation.mutate()}
            disabled={createRoomMutation.isPending}
            className='w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-xl transition duration-300 border border-gray-700 hover:border-gray-600 disabled:border-gray-800 shadow-lg hover:shadow-xl disabled:shadow-none'
          >
            {createRoomMutation.isPending
              ? 'Creating Room...'
              : 'Create Chat Room'}
          </button>

          {createRoomMutation.error && (
            <div className='text-red-400 text-sm text-center'>
              Failed to create room. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
