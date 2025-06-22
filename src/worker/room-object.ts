import { DurableObject } from 'cloudflare:workers';
import { ulid } from 'ulid';
import type {
  GetMessagesResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  WebSocketMessage,
} from '../types/chat';

export class RoomObject extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/websocket') {
        console.log('RoomObject: WebSocket connection request');
        const upgradeHeader = request.headers.get('Upgrade');
        console.log('RoomObject: Upgrade header:', upgradeHeader);

        if (!upgradeHeader || upgradeHeader !== 'websocket') {
          console.log('RoomObject: Invalid upgrade header');
          return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.ctx.acceptWebSocket(server);
        console.log('RoomObject: WebSocket accepted');

        return new Response(null, {
          status: 101,
          webSocket: client,
        });
      }

      if (request.method === 'POST' && path === '/messages') {
        return await this.handleSendMessage(request);
      }

      if (request.method === 'GET' && path === '/messages') {
        return await this.handleGetMessages();
      }

      return new Response('Room object created', { status: 200 });
    } catch (error) {
      console.error('RoomObject fetch error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    console.log('RoomObject: Received WebSocket message:', message);
    try {
      const data: WebSocketMessage = JSON.parse(message);

      if (data.type === 'message') {
        const messageId = ulid();
        const roomId = this.ctx.id.toString();

        const savedMessage: Message = {
          id: messageId,
          content: data.content,
          author: data.author,
          timestamp: new Date().toISOString(),
          roomId,
        };

        await this.ctx.storage.put(`message:${messageId}`, savedMessage);
        console.log('RoomObject: Message saved to storage:', messageId);

        const broadcast: WebSocketMessage = {
          type: 'message',
          content: data.content,
          author: data.author,
          timestamp: savedMessage.timestamp,
          messageId: messageId,
        };

        const connectedClients = this.ctx.getWebSockets();
        console.log(
          'RoomObject: Broadcasting to',
          connectedClients.length,
          'clients',
        );

        for (const client of connectedClients) {
          try {
            client.send(JSON.stringify(broadcast));
          } catch (error) {
            console.error('Failed to send message to client:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(
        JSON.stringify({ type: 'error', message: 'Failed to process message' }),
      );
    }
  }

  async webSocketClose(
    _ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    console.log('WebSocket client disconnected:', { code, reason, wasClean });
  }

  async webSocketError(_ws: WebSocket, error: unknown) {
    console.error('WebSocket error:', error);
  }

  private async handleSendMessage(request: Request): Promise<Response> {
    try {
      const body: SendMessageRequest = await request.json();

      if (!body.content || !body.author) {
        const errorResponse: SendMessageResponse = {
          success: false,
          error: 'Content and author are required',
        };
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const messageId = ulid();
      const roomId = this.ctx.id.toString();

      const message: Message = {
        id: messageId,
        content: body.content,
        author: body.author,
        timestamp: new Date().toISOString(),
        roomId,
      };

      await this.ctx.storage.put(`message:${messageId}`, message);

      const broadcast: WebSocketMessage = {
        type: 'message',
        content: message.content,
        author: message.author,
        timestamp: message.timestamp,
        messageId: messageId,
      };

      for (const client of this.ctx.getWebSockets()) {
        try {
          client.send(JSON.stringify(broadcast));
        } catch (error) {
          console.error('Failed to send message to WebSocket client:', error);
        }
      }

      const response: SendMessageResponse = {
        success: true,
        message,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error handling send message:', error);
      const errorResponse: SendMessageResponse = {
        success: false,
        error: 'Failed to send message',
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private async handleGetMessages(): Promise<Response> {
    try {
      const messages: Message[] = [];
      const messageEntries = await this.ctx.storage.list({
        prefix: 'message:',
      });

      for (const [, message] of messageEntries) {
        if (message && typeof message === 'object' && 'id' in message) {
          messages.push(message as Message);
        }
      }

      messages.sort((a, b) => a.id.localeCompare(b.id));

      const response: GetMessagesResponse = {
        success: true,
        messages,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      const errorResponse: GetMessagesResponse = {
        success: false,
        error: 'Failed to get messages',
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
