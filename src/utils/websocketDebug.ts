/**
 * WebSocket Debug Utility
 * Helps debug WebSocket connection issues without causing crashes
 */

import { websocketService } from '../services/websocketService';

export class WebSocketDebugger {
  private static instance: WebSocketDebugger;
  private debugMode: boolean = __DEV__;

  private constructor() {}

  static getInstance(): WebSocketDebugger {
    if (!WebSocketDebugger.instance) {
      WebSocketDebugger.instance = new WebSocketDebugger();
    }
    return WebSocketDebugger.instance;
  }

  enable() {
    if (!this.debugMode) return;

    console.log('🔧 WebSocket Debugger enabled');

    // Add global debugging functions
    (global as any).wsDebug = {
      status: () => {
        const status = websocketService.getStatus();
        console.log('📊 WebSocket Status:', status);
        return status;
      },

      test: async () => {
        console.log('🧪 Testing WebSocket connection...');
        try {
          const result = await websocketService.connect();
          console.log('✅ WebSocket test result:', result);
          return result;
        } catch (error) {
          console.error('❌ WebSocket test failed:', error);
          return false;
        }
      },

      disconnect: () => {
        console.log('🔌 Disconnecting WebSocket...');
        websocketService.disconnect();
      },

      reconnect: async () => {
        console.log('🔄 Force reconnecting WebSocket...');
        try {
          const result = await websocketService.forceReconnect();
          console.log('✅ Force reconnect result:', result);
          return result;
        } catch (error) {
          console.error('❌ Force reconnect failed:', error);
          return false;
        }
      },

      ping: () => {
        if (websocketService.isConnected) {
          console.log('📡 WebSocket is connected');
          return true;
        } else {
          console.log('❌ WebSocket is not connected');
          return false;
        }
      }
    };
  }

  logConnectionAttempt(url: string, attempt: number) {
    if (this.debugMode) {
      console.log(`🔗 WebSocket connection attempt ${attempt} to: ${url}`);
    }
  }

  logConnectionSuccess() {
    if (this.debugMode) {
      console.log('✅ WebSocket connected successfully');
    }
  }

  logConnectionError(error: any) {
    if (this.debugMode) {
      console.error('❌ WebSocket connection error:', error);
    }
  }

  logDisconnection(reason: string) {
    if (this.debugMode) {
      console.log(`🔌 WebSocket disconnected: ${reason}`);
    }
  }
}

export default WebSocketDebugger.getInstance();