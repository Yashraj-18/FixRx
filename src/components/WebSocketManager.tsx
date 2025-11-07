/**
 * Safe WebSocket Manager Component
 * Can be manually enabled to test WebSocket functionality
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';
import websocketDebug from '../utils/websocketDebug';

interface WebSocketManagerProps {
  enabled?: boolean;
}

export const WebSocketManager: React.FC<WebSocketManagerProps> = ({ enabled = false }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<string>('');

  // Only initialize WebSocket if explicitly enabled
  const webSocket = useWebSocket(enabled && false); // Keep autoConnect disabled

  useEffect(() => {
    if (enabled && __DEV__) {
      try {
        websocketDebug.enable();
        console.log('🔧 WebSocket Manager enabled');
      } catch (error) {
        console.warn('⚠️ WebSocket Manager initialization failed:', error);
      }
    }
  }, [enabled]);

  const handleTestConnection = async () => {
    if (!enabled) {
      setConnectionResult('❌ WebSocket Manager not enabled');
      return;
    }

    setIsConnecting(true);
    setConnectionResult('');

    try {
      console.log('🧪 Testing WebSocket connection...');
      const result = await webSocket.connect();

      if (result) {
        setConnectionResult('✅ WebSocket connected successfully!');
      } else {
        setConnectionResult('❌ WebSocket connection failed');
      }
    } catch (error) {
      console.error('WebSocket test error:', error);
      setConnectionResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    try {
      webSocket.disconnect();
      setConnectionResult('🔌 Disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
      setConnectionResult('❌ Disconnect failed');
    }
  };

  const handleStatus = () => {
    try {
      const status = webSocket.status;
      setConnectionResult(`📊 Status: ${status.connected ? 'Connected' : 'Disconnected'}`);
      console.log('WebSocket Status:', status);
    } catch (error) {
      console.error('Status check error:', error);
      setConnectionResult('❌ Status check failed');
    }
  };

  // Don't render anything unless explicitly enabled in development
  if (!__DEV__ || !enabled) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 WebSocket Debug Panel</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={handleTestConnection}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>
            {isConnecting ? 'Connecting...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.statusButton]}
          onPress={handleStatus}
        >
          <Text style={styles.buttonText}>Check Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.disconnectButton]}
          onPress={handleDisconnect}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>

      {connectionResult ? (
        <Text style={styles.result}>{connectionResult}</Text>
      ) : null}

      <Text style={styles.info}>
        Use wsDebug.test() in console for more options
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
    minWidth: 200,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#007AFF',
  },
  statusButton: {
    backgroundColor: '#34C759',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  result: {
    color: 'white',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
  info: {
    color: '#999',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WebSocketManager;