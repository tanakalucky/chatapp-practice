interface ChatRoomPageProps {
  params: { id: string };
}

export function ChatRoomPage({ params }: ChatRoomPageProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center px-4'>
      <div className='text-center space-y-6 max-w-2xl w-full'>
        <div className='space-y-3'>
          <h1 className='text-4xl font-bold text-white tracking-tight'>
            Chat Room
          </h1>
          <div className='bg-gray-800 border border-gray-700 rounded-xl px-6 py-4'>
            <p className='text-gray-400 text-sm uppercase tracking-wider font-medium mb-1'>
              Room ID
            </p>
            <p className='text-white font-mono text-lg break-all'>
              {params.id}
            </p>
          </div>
        </div>

        <p className='text-gray-500 text-sm'>
          Chat functionality will be implemented here
        </p>
      </div>
    </div>
  );
}
