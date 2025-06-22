import { DurableObject } from 'cloudflare:workers';
import { ulid } from 'ulid';
import type {
  Message,
  SendMessageRequest,
  SendMessageResponse,
} from '../types/chat';

export class RoomObject extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === 'POST' && path === '/messages') {
        return await this.handleSendMessage(request);
      }

      // デフォルトレスポンス
      return new Response('Room object created', { status: 200 });
    } catch (error) {
      console.error('RoomObject fetch error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
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

      // ULIDでユニークなメッセージIDを生成
      const messageId = ulid();
      const roomId = this.ctx.id.toString();

      const message: Message = {
        id: messageId,
        content: body.content,
        author: body.author,
        timestamp: new Date().toISOString(),
        roomId,
      };

      // Durable Object Storageに保存
      await this.ctx.storage.put(`message:${messageId}`, message);

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
}
