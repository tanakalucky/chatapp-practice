import { Route, Router } from 'wouter';
import { ChatRoomPage } from '../chat-room';
import { CreateRoomPage } from '../create-room';

export function AppRouter() {
  return (
    <Router>
      <Route path='/' component={CreateRoomPage} />
      <Route path='/room/:id' component={ChatRoomPage} />
    </Router>
  );
}
