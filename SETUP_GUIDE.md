# FixRx Real-Time Chat Setup Guide

## 🚀 Complete Setup Instructions

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd FixRx
```

### 2. Switch to the Correct Branch

```bash
git checkout compyle/frontend-chat-websocket-realtime
git pull origin compyle/frontend-chat-websocket-realtime
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies (if package.json exists)
npm install

# Or use yarn
yarn install
```

### 4. Environment Configuration

The `.env` file is already configured for WebSocket real-time chat:

```env
# WebSocket Server Configuration
EXPO_PUBLIC_WS_URL=ws://localhost:3001

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_PORT=3000
EXPO_PUBLIC_API_PATH=/api/v1

# Real-time Chat Enabled
EXPO_PUBLIC_USE_MOCK_MESSAGING=false
EXPO_PUBLIC_DEMO_MODE=false

# Local Development
EXPO_PUBLIC_LOCAL_IP=127.0.0.1
```

### 5. Start WebSocket Server

**Terminal 1 - WebSocket Server:**
```bash
cd FixRx/websocket-server
npm install
npm start
```

You should see:
```
🚀 FixRx WebSocket Server running on port 3001
🌍 Environment: development
📡 WebSocket endpoint: ws://localhost:3001
⚡ Ready for real-time messaging!
```

### 6. Start the FixRx Mobile App

**Terminal 2 - FixRx App:**
```bash
cd FixRx
npx expo start
```

### 7. Test Real-Time Chat

#### Option A: Web Browser Testing
1. Open **http://localhost:8081** in your browser
2. Open a **second browser window** at the same URL
3. **Window 1**: Select "I need services" (Consumer)
4. **Window 2**: Select "I provide services" (Vendor)
5. Both: Navigate to Messages tab
6. Start chatting between windows!

#### Option B: Mobile Device Testing
1. Download **Expo Go** app on your phone
2. Scan QR code from Expo terminal
3. Open app on two devices
4. Test real-time messaging

## 🎯 What You'll See

### Real-Time Features:
- ✅ **Instant Messages**: No refresh needed
- ✅ **Typing Indicators**: See "..." when someone is typing
- ✅ **Online Status**: Green indicators for active users
- ✅ **Read Receipts**: Messages marked as read
- ✅ **Connection Status**: WebSocket connected indicator

### App Flow:
1. **Role Selection**: Consumer vs Vendor
2. **Dashboard**: Main app screen with Messages tab
3. **Messages Screen**: List of conversations
4. **Chat Screen**: Real-time messaging interface

## 🔧 File Structure Created/Modified

```
FixRx/
├── .env                           # ✅ Environment configuration
├── src/hooks/useWebSocket.ts      # ✅ Auto-connect enabled
├── websocket-server/              # ✅ New WebSocket server
│   ├── package.json              # ✅ Server dependencies
│   ├── server.js                 # ✅ Socket.IO server
│   ├── .env                      # ✅ Server config
│   ├── test-websocket.js         # ✅ Connection test
│   └── README.md                 # ✅ Server documentation
└── SETUP_GUIDE.md                # ✅ This setup guide
```

## 🐛 Troubleshooting

### WebSocket Server Issues:
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Kill any existing process on port 3001
kill -9 $(lsof -ti:3001)

# Restart server
cd FixRx/websocket-server && npm start
```

### App Connection Issues:
1. Make sure WebSocket server is running first
2. Check `EXPO_PUBLIC_WS_URL` in `.env` file
3. Verify no firewall blocking port 3001
4. Clear app cache and restart

### Expo Development Server Issues:
```bash
# Clear Expo cache
npx expo start -c

# Reset Metro bundler
npx expo start --reset-cache
```

## 📱 Testing with Two Instances

### Method 1: Two Browser Windows
1. Open http://localhost:8081 in Window 1
2. Open http://localhost:8081 in Window 2
3. Select different roles in each window
4. Navigate to Messages and test chat

### Method 2: Browser + Mobile
1. Open app in browser
2. Scan QR code with mobile device
3. Test real-time sync between devices

### Method 3: Two Mobile Devices
1. Scan QR code with Device 1
2. Scan QR code with Device 2
3. Test cross-device messaging

## 🎉 Success Criteria

You'll know it's working when:
- ✅ WebSocket server shows connection logs
- ✅ App shows "Connected" status in console
- ✅ Messages appear instantly in both instances
- ✅ Typing indicators show in real-time
- ✅ No page refresh needed for updates

## 📞 Need Help?

If you encounter any issues:
1. Check WebSocket server is running on port 3001
2. Verify `.env` file has correct settings
3. Check browser console for connection errors
4. Ensure both instances are using same conversation

**Enjoy your real-time chat functionality! 🚀**