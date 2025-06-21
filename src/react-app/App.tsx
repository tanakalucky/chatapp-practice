import { Route, Router } from 'wouter';
import { useLocation } from 'wouter';

function HomePage() {
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

function RoomPage({ params }: { params: { id: string } }) {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen'>
      <h1 className='text-3xl font-bold text-gray-800'>Room ID: {params.id}</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Route path='/' component={HomePage} />
      <Route path='/room/:id' component={RoomPage} />
    </Router>
  );
}

export default App;
