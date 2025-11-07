# FixRx Local Setup Guide

## 🚀 Complete Local Setup for Real-Time Chat

This guide will help you set up the FixRx application locally with WebSocket real-time chat functionality.

## 📋 **Prerequisites**

### Required Software:
- **Node.js** (v14 or higher)
- **npm** or **yarn** (comes with Node.js)
- **Git** (to clone the repository)
- **Expo Go** (for mobile testing) or modern web browser

### Check Prerequisites:
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## 🔄 **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone [your-repository-url]

# Navigate to the project directory
cd FixRx

# Switch to the correct branch
git checkout compyle/frontend-chat-websocket-realtime

# Pull the latest changes
git pull origin compyle/frontend-chat-websocket-realtime
```

## 🔧 **Step 2: Environment Configuration**

The `.env` file is already configured for local development:

```env
# WebSocket Server Configuration
EXPO_PUBLIC_WS_URL=http://localhost:3001

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_PORT=3000
EXPO_PUBLIC_API_PATH=/api/v1

# Local Development
EXPO_PUBLIC_LOCAL_IP=127.0.0.1

# Real-time Chat Enabled
EXPO_PUBLIC_USE_MOCK_MESSAGING=false
EXPO_PUBLIC_DEMO_MODE=false

# Optional: Add your Google OAuth and Stripe keys
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 🖥️ **Step 3: WebSocket Server Setup**

Open **Terminal 1** and set up the WebSocket server:

```bash
# Navigate to WebSocket server directory
cd FixRx/websocket-server

# Install server dependencies
npm install

# Start the WebSocket server
npm start
```

**Expected Output:**
```
🚀 FixRx WebSocket Server running on port 3001
🌍 Environment: development
📡 WebSocket endpoint: ws://localhost:3001
⚡ Ready for real-time messaging!
```

**Keep this terminal open!** The WebSocket server must be running for real-time chat to work.

## 📱 **Step 4: FixRx Mobile App Setup**

Open **Terminal 2** and set up the mobile app:

```bash
# Navigate to project root (if not already there)
cd FixRx

# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli

# Install project dependencies (if package.json exists)
# Note: This is an Expo managed project, so npm install may not be needed

# Start the Expo development server
npx expo start
```

**Expected Output:**
```
  › Metro waiting on http://localhost:8081
  › Scan the QR code with Expo Go (Android) or Camera app (iOS)
  › Press a │ open Android
  › Press w │ open in web browser
  › Press i │ open iOS simulator
```

## 🌐 **Step 5: Access the Application**

### **Option A: Web Browser (Easiest)**
1. Open your web browser
2. Go to **http://localhost:8081**
3. The app will load in your browser

### **Option B: Mobile Device**
1. Install **Expo Go** app on your mobile device
2. Scan the QR code from the Expo terminal
3. The app will load on your mobile device

### **Option C: iOS Simulator**
1. Press `i` in the Expo terminal
2. This will open the iOS Simulator (macOS only)

### **Option D: Android Emulator**
1. Press `a` in the Expo terminal
2. This will open the Android Emulator

## 💬 **Step 6: Test Real-Time Chat**

### **Testing with Two Browser Windows (Recommended)**

**Window 1 (Consumer):**
1. Open **http://localhost:8081** in browser window 1
2. Click **"I need services"** (Consumer role)
3. Navigate to the **Messages tab** (bottom navigation)
4. Select a conversation to start chatting

**Window 2 (Vendor):**
1. Open **http://localhost:8081** in browser window 2
2. Click **"I provide services"** (Vendor role)
3. Navigate to the **Messages tab** (bottom navigation)
4. Select the same conversation

**Test Real-Time Features:**
- ✅ **Send Messages**: Type and send messages - they appear instantly!
- ✅ **Typing Indicators**: See "..." when someone is typing
- ✅ **Online Status**: See when users are online
- ✅ **No Refresh**: Everything updates in real-time!

## 🛠️ **Development Tools**

### **WebSocket Debug Tools** (in browser console)
```javascript
// Check WebSocket connection status
wsDebug.status()

// Test WebSocket connection
wsDebug.test()

// Manually connect/disconnect
wsDebug.connect()
wsDebug.disconnect()

// Check if connected
wsDebug.ping()
```

### **Enable WebSocket Debug Panel** (Optional)
To see a visual debug panel:
1. Edit `App.tsx`
2. Change `<WebSocketManager enabled={false} />` to `<WebSocketManager enabled={true} />`
3. Restart the app - you'll see a debug panel in the top-right corner

## 🧪 **Testing the WebSocket Server**

You can test the WebSocket server independently:

```bash
# Terminal 3: Test WebSocket server
cd FixRx/websocket-server

# Run basic connection test
node test-websocket.js

# Run frontend integration test
node test-frontend-integration.js
```

## 🔧 **Troubleshooting**

### **Common Issues and Solutions**

#### **App Won't Start:**
```bash
# Clear Expo cache
npx expo start -c

# Reset Metro bundler
npx expo start --reset-cache

# Check Node.js version
node --version  # Should be v14 or higher
```

#### **WebSocket Not Connecting:**
1. **Check Server**: Make sure WebSocket server is running on port 3001
2. **Check Console**: Look for WebSocket connection messages
3. **Test Connection**: Use `wsDebug.test()` in browser console
4. **Check Environment**: Verify `EXPO_PUBLIC_WS_URL=http://localhost:3001` in `.env`

#### **Port Already in Use:**
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use different port in .env
EXPO_PUBLIC_WS_URL=http://localhost:3002
```

#### **Real-Time Not Working:**
1. Both windows must be connected to the same WebSocket server
2. Check that both instances show "WebSocket connected" in console
3. Try sending a test message - should appear instantly

#### **Mobile Device Issues:**
1. **Network**: Make sure mobile device is on same WiFi as computer
2. **IP Address**: Update `EXPO_PUBLIC_LOCAL_IP` to your computer's IP
3. **Firewall**: Check that port 3001 is not blocked by firewall

### **Getting Help:**

1. **Check Console**: Look for error messages in browser console
2. **Check Terminal**: Look for WebSocket server logs
3. **Verify Setup**: Make sure both terminals (server and app) are running
4. **Restart**: Try stopping both servers and restarting

## 📱 **Testing on Multiple Devices**

### **Two Mobile Devices:**
1. Install Expo Go on both devices
2. Scan QR code on both devices
3. Test cross-device messaging

### **Browser + Mobile:**
1. Open app in browser
2. Scan QR code on mobile device
3. Test real-time sync between devices

### **Different Roles:**
- **Consumer**: "I need services" - can message vendors
- **Vendor**: "I provide services" - can message consumers
- **Real-Time**: Messages appear instantly regardless of device type

## 🎯 **Success Checklist**

You'll know everything is working when:

- ✅ **WebSocket Server**: Shows "🚀 FixRx WebSocket Server running on port 3001"
- ✅ **App Starts**: Expo server shows "Metro waiting on http://localhost:8081"
- ✅ **App Loads**: Welcome screen appears in browser/mobile
- ✅ **Navigation**: Can switch between screens without crashes
- ✅ **Real-Time Chat**: Messages appear instantly between two instances
- ✅ **Typing Indicators**: See "..." when someone is typing
- ✅ **No Errors**: No crash messages in console

## 🚀 **Ready for Development!**

Once everything is set up, you can:

1. **Modify App**: Edit files in `src/` directory
2. **Add Features**: Implement new real-time features
3. **Test Changes**: Changes auto-reload with Expo
4. **Debug**: Use browser console and debug tools
5. **Deploy**: Ready for production when satisfied

## 📚 **Additional Resources**

- **Expo Documentation**: https://docs.expo.dev/
- **Socket.IO Documentation**: https://socket.io/docs/
- **React Native Debugging**: https://reactnative.dev/docs/debugging

**Your FixRx real-time chat application is now fully set up locally!** 🎉

---

## 📞 **Quick Commands Reference**

```bash
# Terminal 1: WebSocket Server
cd FixRx/websocket-server && npm start

# Terminal 2: Expo App
cd FixRx && npx expo start

# Terminal 3: Optional Testing
cd FixRx/websocket-server && node test-websocket.js

# Clear Cache (if needed)
npx expo start -c

# Check WebSocket Status (in browser console)
wsDebug.status()
```

**Enjoy building real-time chat features with FixRx!** 🚀