# FixRx WebSocket Server

A simple Socket.IO server for real-time chat functionality in the FixRx mobile application.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Test the connection
node test-websocket.js
```

## Server Details

- **Port**: 3001 (configurable via PORT env variable)
- **WebSocket Endpoint**: `ws://localhost:3001`
- **Environment**: Development (configurable via NODE_ENV)

## Features Implemented

✅ **Real-time Messaging**: Instant message delivery between users
✅ **Typing Indicators**: Shows when users are typing
✅ **Conversation Rooms**: Room-based message routing
✅ **User Authentication**: Basic user identification and role tracking
✅ **Connection Management**: Handles user connections, disconnections, and reconnections
✅ **CORS Support**: Configured for React Native development
✅ **Event Logging**: Development-friendly console logs

## WebSocket Events Handled

### Client → Server
- `authenticate` - User authentication with userId, userType, token
- `join:conversation` - Join a conversation room
- `leave:conversation` - Leave a conversation room
- `message:new` - Send a new message
- `conversation:typing` - Send typing indicator
- `conversation:read` - Mark messages as read
- `user:online` - Set user online status

### Server → Client
- `authenticated` - Authentication success response
- `joined:conversation` - Successfully joined conversation
- `message:new` - Receive new message
- `message:delivered` - Message delivery confirmation
- `conversation:typing` - Receive typing indicator
- `conversation:read` - Receive read status
- `user:joined` - User joined conversation
- `user:left` - User left conversation
- `user:online` - User came online
- `user:offline` - User went offline
- `welcome` - Connection welcome message
- `error` - Error notifications

## Testing

The server includes a comprehensive test suite (`test-websocket.js`) that verifies:
- Client connections and authentication
- Conversation joining
- Real-time message delivery
- Typing indicators
- Message delivery confirmations

Run tests with:
```bash
node test-websocket.js
```

## Environment Variables

Create a `.env` file:
```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

## Architecture

The server implements a simple but robust architecture:
- **Active Users Tracking**: Maintains a map of connected users
- **Conversation Rooms**: Manages room-based message routing
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Shutdown**: Proper cleanup on server termination

## Integration with FixRx App

The FixRx app is configured to connect to this server via:
- Environment variable: `EXPO_PUBLIC_WS_URL=ws://localhost:3001`
- Auto-connect functionality enabled in `useWebSocket.ts`
- Fallback to REST API if WebSocket unavailable

## Development Notes

- Server supports both WebSocket and polling transports
- CORS is configured to allow all origins for development
- Connection status is logged for debugging
- Server gracefully handles client disconnections