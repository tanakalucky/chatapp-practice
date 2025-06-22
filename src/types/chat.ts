export interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  roomId: string;
}

export interface SendMessageRequest {
  content: string;
  author: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface RoomInfo {
  id: string;
  messageCount: number;
  createdAt: string;
}
