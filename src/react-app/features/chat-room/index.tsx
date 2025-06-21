interface ChatRoomPageProps {
  params: { id: string };
}

export function ChatRoomPage({ params }: ChatRoomPageProps) {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen'>
      <h1 className='text-3xl font-bold text-gray-800'>Room ID: {params.id}</h1>
    </div>
  );
}
