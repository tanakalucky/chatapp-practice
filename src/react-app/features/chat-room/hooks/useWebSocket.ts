import type { WebSocketMessage } from '@/types/chat';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  roomId: string;
  author: string;
  onMessage: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useWebSocket({
  roomId,
  author,
  onMessage,
  onError,
  onOpen,
  onClose,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // コールバック関数をref化して依存関係を安定化
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
  });

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/rooms/${roomId}/ws`;
    console.log('WebSocket URL:', url);
    return url;
  }, [roomId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping');
      return;
    }

    // 既存の接続をクリーンアップ
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnecting(true);
    console.log('Connecting to WebSocket:', getWebSocketUrl());

    const ws = new WebSocket(getWebSocketUrl());

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;
      onOpenRef.current?.();
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        onMessageRef.current(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setIsConnected(false);
      setIsConnecting(false);
      onCloseRef.current?.();

      // Auto-reconnect only for unexpected disconnections
      if (
        !event.wasClean &&
        event.code !== 1000 && // Normal closure
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
        reconnectAttemptsRef.current++;

        console.log(
          `Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`,
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, delay);
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.log('Max reconnect attempts reached, giving up');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
      onErrorRef.current?.(error);
    };

    wsRef.current = ws;
  }, [getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const message: WebSocketMessage = {
          type: 'message',
          content,
          author,
        };

        wsRef.current.send(JSON.stringify(message));
        return true;
      }
      return false;
    },
    [author],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: connect/disconnect関数の依存を意図的に除外（無限ループ防止）
  useEffect(() => {
    // 初回接続のみ実行
    let isMounted = true;

    const initConnection = () => {
      if (isMounted) {
        connect();
      }
    };

    initConnection();

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [roomId]); // roomId変更時のみ再接続

  return {
    isConnected,
    isConnecting,
    sendMessage,
    connect,
    disconnect,
  };
}
