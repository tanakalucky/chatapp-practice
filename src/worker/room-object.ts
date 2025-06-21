import { DurableObject } from 'cloudflare:workers';

export class RoomObject extends DurableObject {
  async fetch(_request: Request): Promise<Response> {
    // 将来的にWebSocketや他の機能を追加する際に使用
    return new Response('Room object created', { status: 200 });
  }
}
