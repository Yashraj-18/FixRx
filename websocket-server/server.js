/**
 * FixRx WebSocket Server
 * Handles real-time chat functionality for consumer-vendor messaging
 */

const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

// Create HTTP server
const server = http.createServer();

// Configure Socket.IO with CORS for React Native development
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // Allow fallback to polling
});

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Store active users and their socket IDs
const activeUsers = new Map();
// Store conversation rooms and their members
const conversationRooms = new Map();

// Middleware for logging
io.use((socket, next) => {
  console.log(`🔗 Socket connection attempt: ${socket.id}`);
  next();
});

// Handle new socket connections
io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);

  // Handle user authentication and joining conversations
  socket.on('authenticate', (data) => {
    try {
      const { userId, userType, token } = data;

      // Store user info
      activeUsers.set(socket.id, {
        userId,
        userType,
        socketId: socket.id,
        connectedAt: new Date().toISOString()
      });

      // Join user to their personal room for private notifications
      socket.join(`user:${userId}`);

      console.log(`👤 User authenticated: ${userType} - ${userId}`);

      // Emit success response
      socket.emit('authenticated', {
        success: true,
        userId,
        userType,
        socketId: socket.id
      });

    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('authentication_error', {
        error: 'Authentication failed'
      });
    }
  });

  // Handle joining a conversation room
  socket.on('join:conversation', (data) => {
    try {
      const { conversationId, userId } = data;
      const userInfo = activeUsers.get(socket.id);

      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Join conversation room
      socket.join(`conversation:${conversationId}`);

      // Track room membership
      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId).add(userId);

      console.log(`💬 User ${userId} joined conversation: ${conversationId}`);

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit('user:joined', {
        userId,
        conversationId,
        timestamp: new Date().toISOString()
      });

      // Emit success response
      socket.emit('joined:conversation', {
        success: true,
        conversationId,
        members: Array.from(conversationRooms.get(conversationId) || [])
      });

    } catch (error) {
      console.error('❌ Join conversation error:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Handle leaving a conversation room
  socket.on('leave:conversation', (data) => {
    try {
      const { conversationId, userId } = data;

      socket.leave(`conversation:${conversationId}`);

      // Update room membership
      if (conversationRooms.has(conversationId)) {
        conversationRooms.get(conversationId).delete(userId);
        if (conversationRooms.get(conversationId).size === 0) {
          conversationRooms.delete(conversationId);
        }
      }

      console.log(`🚪 User ${userId} left conversation: ${conversationId}`);

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit('user:left', {
        userId,
        conversationId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Leave conversation error:', error);
    }
  });

  // Handle new messages
  socket.on('message:new', (data) => {
    try {
      const { conversationId, message, senderId, tempId } = data;
      const userInfo = activeUsers.get(socket.id);

      if (!userInfo) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }

      // Add server timestamp and generate message ID if not provided
      const enhancedMessage = {
        id: tempId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId,
        content: message.content || message,
        type: message.type || 'text',
        timestamp: new Date().toISOString(),
        serverTimestamp: Date.now(),
        status: 'sent'
      };

      // Broadcast to all users in the conversation except sender
      socket.to(`conversation:${conversationId}`).emit('message:new', enhancedMessage);

      // Also send confirmation back to sender
      socket.emit('message:delivered', {
        tempId,
        messageId: enhancedMessage.id,
        conversationId,
        timestamp: enhancedMessage.timestamp
      });

      console.log(`📨 New message in conversation ${conversationId} from ${senderId}`);

    } catch (error) {
      console.error('❌ New message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('conversation:typing', (data) => {
    try {
      const { conversationId, userId, isTyping } = data;
      const userInfo = activeUsers.get(socket.id);

      if (!userInfo) return;

      // Broadcast typing indicator to conversation room (except sender)
      socket.to(`conversation:${conversationId}`).emit('conversation:typing', {
        userId,
        conversationId,
        isTyping,
        timestamp: new Date().toISOString()
      });

      console.log(`⌨️ User ${userId} ${isTyping ? 'is typing' : 'stopped typing'} in conversation ${conversationId}`);

    } catch (error) {
      console.error('❌ Typing indicator error:', error);
    }
  });

  // Handle message read status
  socket.on('conversation:read', (data) => {
    try {
      const { conversationId, userId, messageIds } = data;

      // Broadcast read status to conversation room (except sender)
      socket.to(`conversation:${conversationId}`).emit('conversation:read', {
        userId,
        conversationId,
        messageIds,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ User ${userId} read messages in conversation ${conversationId}`);

    } catch (error) {
      console.error('❌ Read status error:', error);
    }
  });

  // Handle online status
  socket.on('user:online', (data) => {
    try {
      const { userId } = data;
      const userInfo = activeUsers.get(socket.id);

      if (userInfo) {
        userInfo.online = true;
        userInfo.lastSeen = new Date().toISOString();

        // Broadcast online status to user's personal room
        socket.to(`user:${userId}`).emit('user:online', {
          userId,
          timestamp: userInfo.lastSeen
        });
      }

    } catch (error) {
      console.error('❌ Online status error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    try {
      const userInfo = activeUsers.get(socket.id);

      if (userInfo) {
        console.log(`🔌 User disconnected: ${userInfo.userId} (${userInfo.userType})`);

        // Remove from active users
        activeUsers.delete(socket.id);

        // Remove from all conversation rooms
        conversationRooms.forEach((members, conversationId) => {
          if (members.has(userInfo.userId)) {
            members.delete(userInfo.userId);

            // Notify others in the conversation
            socket.to(`conversation:${conversationId}`).emit('user:left', {
              userId: userInfo.userId,
              conversationId,
              timestamp: new Date().toISOString()
            });
          }
        });

        // Broadcast offline status
        socket.to(`user:${userInfo.userId}`).emit('user:offline', {
          userId: userInfo.userId,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);

    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });

  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to FixRx WebSocket Server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 FixRx WebSocket Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`⚡ Ready for real-time messaging!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});