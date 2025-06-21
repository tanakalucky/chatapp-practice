import { useLocation } from 'wouter';

export function CreateRoomPage() {
  const [, setLocation] = useLocation();

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    setLocation(`/room/${roomId}`);
  };

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

        <button
          type='button'
          onClick={handleCreateRoom}
          className='w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 px-8 rounded-xl transition duration-300 border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl'
        >
          Create Chat Room
        </button>
      </div>
    </div>
  );
}
