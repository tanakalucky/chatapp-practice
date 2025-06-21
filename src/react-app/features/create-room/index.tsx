import { useLocation } from 'wouter';

export function CreateRoomPage() {
  const [, setLocation] = useLocation();

  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID();
    setLocation(`/room/${roomId}`);
  };

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <button
        type='button'
        onClick={handleCreateRoom}
        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300'
      >
        Create Chat Room
      </button>
    </div>
  );
}
