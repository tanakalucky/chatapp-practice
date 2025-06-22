import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { GetMessagesResponse, SendMessageResponse } from '../types/chat';
import type { Env } from './env';
import { RoomObject } from './room-object';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'https://your-domain.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'Upgrade',
      'Connection',
      'Sec-WebSocket-Key',
      'Sec-WebSocket-Version',
      'Sec-WebSocket-Protocol',
    ],
  }),
);

app.get('/api/', (c) => c.json({ name: 'Cloudflare', version: '1.0.0' }));

app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

app.post('/api/rooms', async (c) => {
  try {
    const roomId = c.env.ROOM.newUniqueId();

    return c.json({ roomId: roomId.toString() });
  } catch (error) {
    console.error('Room creation failed:', error);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

app.post('/api/rooms/:id/messages', async (c) => {
  try {
    const roomId = c.req.param('id');

    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    const body = await c.req.json();

    const response = await roomObject.fetch(
      new Request('https://room/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );

    const result = (await response.json()) as SendMessageResponse;
    return c.json(result);
  } catch (error) {
    console.error('Message send failed:', error);
    return c.json({ success: false, error: 'Failed to send message' }, 500);
  }
});

app.get('/api/rooms/:id/messages', async (c) => {
  try {
    const roomId = c.req.param('id');

    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    const response = await roomObject.fetch(
      new Request('https://room/messages', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = (await response.json()) as GetMessagesResponse;
    return c.json(result);
  } catch (error) {
    console.error('Message fetch failed:', error);
    return c.json({ success: false, error: 'Failed to fetch messages' }, 500);
  }
});

app.get('/api/rooms/:id/ws', async (c) => {
  try {
    const upgradeHeader = c.req.header('upgrade');
    console.log('WebSocket upgrade request:', {
      upgradeHeader,
      url: c.req.url,
    });

    if (upgradeHeader !== 'websocket') {
      console.log('Invalid upgrade header:', upgradeHeader);
      return c.text('Expected Upgrade: websocket', 426);
    }

    const roomId = c.req.param('id');
    console.log('WebSocket connection for room:', roomId);

    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    const response = await roomObject.fetch(
      new Request('https://room/websocket', {
        headers: c.req.raw.headers,
      }),
    );

    console.log('WebSocket response from Durable Object:', response.status);
    return response;
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    return c.text(`WebSocket connection failed: ${error}`, 500);
  }
});

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  return c.redirect('/');
});

export default app;
export { RoomObject };
