import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessage } from '../types';

interface UseWebSocketOptions {
  url: string;
  onMessage: (message: WebSocketMessage) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectCountRef = useRef(0);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress, skipping');
      return;
    }

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCountRef.current = 0;
        isConnectingRef.current = false;

        // Start ping/pong keepalive (every 30 seconds)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type !== 'pong') {
            console.log('WebSocket message:', message);
            onMessage(message);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        isConnectingRef.current = false;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection with exponential backoff
        if (reconnectCountRef.current < maxReconnectAttempts) {
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectCountRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectCountRef.current += 1;
            connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      isConnectingRef.current = false;
    }
  }, [url, onMessage, maxReconnectAttempts, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [connect]);

  return { isConnected };
}

