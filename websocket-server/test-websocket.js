/**
 * Simple WebSocket Connection Test
 * Tests the WebSocket server by simulating client connections
 */

const { io } = require('socket.io-client');

const WS_URL = 'http://localhost:3001';
const TEST_USER = {
  userId: 'test-consumer-1',
  userType: 'consumer',
  token: 'test-token-123'
};

const TEST_VENDOR = {
  userId: 'test-vendor-1',
  userType: 'vendor',
  token: 'test-vendor-token-456'
};

const TEST_CONVERSATION_ID = 'test-conversation-123';

async function testWebSocketConnection() {
  console.log('🧪 Starting WebSocket Connection Test...');
  console.log(`📡 Connecting to: ${WS_URL}`);

  try {
    // Create client connections
    const consumerClient = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    const vendorClient = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    });

    let testResults = {
      consumerConnected: false,
      vendorConnected: false,
      conversationJoined: false,
      messageDelivered: false,
      typingIndicator: false
    };

    // Test consumer connection
    consumerClient.on('connect', () => {
      console.log('✅ Consumer connected successfully');
      testResults.consumerConnected = true;

      // Authenticate consumer
      consumerClient.emit('authenticate', TEST_USER);
    });

    consumerClient.on('authenticated', (data) => {
      console.log('✅ Consumer authenticated:', data);

      // Join conversation
      consumerClient.emit('join:conversation', {
        conversationId: TEST_CONVERSATION_ID,
        userId: TEST_USER.userId
      });
    });

    consumerClient.on('joined:conversation', (data) => {
      console.log('✅ Consumer joined conversation:', data);
      testResults.conversationJoined = true;

      // Send a test message
      consumerClient.emit('message:new', {
        conversationId: TEST_CONVERSATION_ID,
        message: {
          content: 'Hello from consumer!',
          type: 'text'
        },
        senderId: TEST_USER.userId,
        tempId: 'temp-msg-1'
      });
    });

    consumerClient.on('message:delivered', (data) => {
      console.log('✅ Message delivered:', data);
      testResults.messageDelivered = true;
    });

    // Test vendor connection
    vendorClient.on('connect', () => {
      console.log('✅ Vendor connected successfully');
      testResults.vendorConnected = true;

      // Authenticate vendor
      vendorClient.emit('authenticate', TEST_VENDOR);
    });

    vendorClient.on('authenticated', (data) => {
      console.log('✅ Vendor authenticated:', data);

      // Join conversation
      vendorClient.emit('join:conversation', {
        conversationId: TEST_CONVERSATION_ID,
        userId: TEST_VENDOR.userId
      });
    });

    vendorClient.on('message:new', (message) => {
      console.log('✅ Vendor received message:', message);

      // Send typing indicator
      vendorClient.emit('conversation:typing', {
        conversationId: TEST_CONVERSATION_ID,
        userId: TEST_VENDOR.userId,
        isTyping: true
      });

      // Stop typing after 1 second
      setTimeout(() => {
        vendorClient.emit('conversation:typing', {
          conversationId: TEST_CONVERSATION_ID,
          userId: TEST_VENDOR.userId,
          isTyping: false
        });
      }, 1000);
    });

    vendorClient.on('conversation:typing', (data) => {
      console.log('✅ Typing indicator received:', data);
      testResults.typingIndicator = true;
    });

    // Handle errors
    consumerClient.on('connect_error', (error) => {
      console.error('❌ Consumer connection error:', error);
    });

    vendorClient.on('connect_error', (error) => {
      console.error('❌ Vendor connection error:', error);
    });

    consumerClient.on('error', (error) => {
      console.error('❌ Consumer error:', error);
    });

    vendorClient.on('error', (error) => {
      console.error('❌ Vendor error:', error);
    });

    // Wait for tests to complete
    setTimeout(() => {
      console.log('\n📊 Test Results:');
      console.log('-----------------');
      Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
      });

      const allPassed = Object.values(testResults).every(result => result === true);
      console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

      // Clean up
      consumerClient.disconnect();
      vendorClient.disconnect();
      process.exit(allPassed ? 0 : 1);
    }, 5000);

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
  }
}

// Check if server is running first
const healthCheck = io(WS_URL, {
  transports: ['websocket', 'polling'],
  reconnection: false,
  timeout: 3000
});

healthCheck.on('connect', () => {
  console.log('✅ Server is running and accessible');
  healthCheck.disconnect();
  testWebSocketConnection();
});

healthCheck.on('connect_error', (error) => {
  console.error('❌ Cannot connect to WebSocket server at', WS_URL);
  console.error('❌ Make sure the server is running with: npm start');
  console.error('❌ Error details:', error.message);
  process.exit(1);
});

console.log('🔍 Checking if WebSocket server is running...');