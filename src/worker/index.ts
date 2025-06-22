import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { GetMessagesResponse, SendMessageResponse } from '../types/chat';
import type { Env } from './env';
import { RoomObject } from './room-object';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'https://your-domain.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// API Routes
app.get('/api/', (c) => c.json({ name: 'Cloudflare', version: '1.0.0' }));

app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// 部屋作成API
app.post('/api/rooms', async (c) => {
  try {
    // 新しいDurable ObjectのIDを生成
    const roomId = c.env.ROOM.newUniqueId();

    // 部屋IDを文字列として返す
    return c.json({ roomId: roomId.toString() });
  } catch (error) {
    console.error('Room creation failed:', error);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

// メッセージ送信API
app.post('/api/rooms/:id/messages', async (c) => {
  try {
    const roomId = c.req.param('id');

    // Durable ObjectのIDを作成
    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    // リクエストボディを取得
    const body = await c.req.json();

    // Durable Objectにリクエストを転送
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

// メッセージ履歴取得API
app.get('/api/rooms/:id/messages', async (c) => {
  try {
    const roomId = c.req.param('id');

    // Durable ObjectのIDを作成
    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    // Durable Objectにリクエストを転送
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

// WebSocket接続API
app.get('/api/rooms/:id/ws', async (c) => {
  try {
    const upgradeHeader = c.req.header('upgrade');
    if (upgradeHeader !== 'websocket') {
      return c.text('Expected Upgrade: websocket', 426);
    }

    const roomId = c.req.param('id');

    // Durable ObjectのIDを作成
    const durableObjectId = c.env.ROOM.idFromString(roomId);
    const roomObject = c.env.ROOM.get(durableObjectId);

    // WebSocketリクエストをDurable Objectに転送
    return roomObject.fetch(
      new Request('https://room/websocket', {
        headers: c.req.raw.headers,
      }),
    );
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    return c.text('WebSocket connection failed', 500);
  }
});

// 404 handler for API routes
app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  // For non-API routes, let the client handle routing
  return c.redirect('/');
});

export default app;
export { RoomObject };
