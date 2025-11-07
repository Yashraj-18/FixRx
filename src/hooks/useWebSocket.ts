/**
 * WebSocket Hook for FixRx Mobile
 * Provides easy WebSocket integration with React components
 */

import { useEffect, useState, useCallback } from 'react';
import { websocketService } from '../services/websocketService';
import { sessionManager } from '../utils/sessionManager';

interface WebSocketStatus {
  connected: boolean;
  reconnecting: boolean;
  disabled: boolean;
  failures: number;
  url: string;
}

export const useWebSocket = (autoConnect: boolean = false) => {
  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    reconnecting: false,
    disabled: false,
    failures: 0,
    url: ''
  });

  const updateStatus = useCallback(() => {
    setStatus(websocketService.getStatus());
  }, []);

  const connect = useCallback(async (token?: string) => {
    try {
      const result = await websocketService.connect(token);
      updateStatus();
      return result;
    } catch (error) {
      console.error('WebSocket connect error:', error);
      updateStatus();
      return false;
    }
  }, [updateStatus]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    updateStatus();
  }, [updateStatus]);

  const forceReconnect = useCallback(async (token?: string) => {
    try {
      const result = await websocketService.forceReconnect(token);
      updateStatus();
      return result;
    } catch (error) {
      console.error('WebSocket force reconnect error:', error);
      updateStatus();
      return false;
    }
  }, [updateStatus]);

  const enable = useCallback(() => {
    websocketService.enable();
    updateStatus();
  }, [updateStatus]);

  // Initialize WebSocket on mount
  useEffect(() => {
    const initializeWebSocket = async () => {
      if (autoConnect) {
        try {
          // Enable WebSocket connection for real-time chat
          console.log('🔗 Attempting WebSocket auto-connect...');
          await connect();
          updateStatus();
        } catch (error) {
          console.warn('⚠️ WebSocket initialization failed, will use fallback mode:', error);
          updateStatus();
        }
      }
    };

    initializeWebSocket();

    // Add safe status update interval
    const statusInterval = setInterval(() => {
      try {
        updateStatus();
      } catch (error) {
        console.warn('⚠️ Status update failed:', error);
      }
    }, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [autoConnect, updateStatus]);

  // Listen for WebSocket events
  useEffect(() => {
    const unsubscribeConnected = websocketService.on('connected', () => {
      console.log('🔗 WebSocket connected via hook');
      updateStatus();
    });

    const unsubscribeDisconnected = websocketService.on('disconnected', () => {
      console.log('🔌 WebSocket disconnected via hook');
      updateStatus();
    });

    const unsubscribeError = websocketService.on('error', (error) => {
      console.error('❌ WebSocket error via hook:', error);
      updateStatus();
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, [updateStatus]);

  return {
    status,
    connect,
    disconnect,
    forceReconnect,
    enable,
    // Utility methods
    isConnected: status.connected,
    isReconnecting: status.reconnecting,
    isDisabled: status.disabled,
    connectionUrl: status.url,
    failureCount: status.failures
  };
};

export default useWebSocket;
