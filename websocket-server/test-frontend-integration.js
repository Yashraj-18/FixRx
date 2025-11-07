/**
 * Frontend Integration Test
 * Tests that the FixRx frontend can connect to WebSocket server
 */

const { io } = require('socket.io-client');

const WS_URL = 'http://localhost:3001';

async function testFrontendIntegration() {
  console.log('🧪 Testing Frontend WebSocket Integration...');
  console.log(`📡 Connecting to: ${WS_URL}`);

  try {
    // Test connection like the frontend would
    const client = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 10000
    });

    let testResults = {
      connected: false,
      authenticated: false,
      joinedConversation: false,
      messageReceived: false,
      typingReceived: false
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Test timeout - cleaning up...');
        client.disconnect();
        resolve(testResults);
      }, 8000);

      client.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        testResults.connected = true;

        // Authenticate like the frontend does
        client.emit('authenticate', {
          userId: 'test-user-frontend',
          userType: 'consumer',
          token: 'test-token'
        });
      });

      client.on('authenticated', (data) => {
        console.log('✅ Authentication successful:', data);
        testResults.authenticated = true;

        // Join a conversation
        client.emit('join:conversation', {
          conversationId: 'test-conversation-frontend',
          userId: 'test-user-frontend'
        });
      });

      client.on('joined:conversation', (data) => {
        console.log('✅ Joined conversation:', data);
        testResults.joinedConversation = true;

        // Simulate receiving a message (send one to ourselves)
        client.emit('message:new', {
          conversationId: 'test-conversation-frontend',
          message: {
            content: 'Hello from frontend test!',
            type: 'text'
          },
          senderId: 'test-user-frontend',
          tempId: 'frontend-test-msg'
        });
      });

      client.on('message:new', (message) => {
        console.log('✅ Message received:', message);
        testResults.messageReceived = true;

        // Send typing indicator
        client.emit('conversation:typing', {
          conversationId: 'test-conversation-frontend',
          userId: 'test-user-frontend',
          isTyping: true
        });

        setTimeout(() => {
          client.emit('conversation:typing', {
            conversationId: 'test-conversation-frontend',
            userId: 'test-user-frontend',
            isTyping: false
          });
        }, 500);
      });

      client.on('conversation:typing', (data) => {
        console.log('✅ Typing indicator received:', data);
        testResults.typingReceived = true;

        // All tests passed!
        clearTimeout(timeout);
        console.log('\n🎉 All frontend integration tests passed!');
        console.log('📊 Final Results:', testResults);

        client.disconnect();
        resolve(testResults);
      });

      client.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.error('❌ Connection error:', error);
        client.disconnect();
        resolve(testResults);
      });

      client.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

    });

  } catch (error) {
    console.error('💥 Integration test failed:', error);
    return {
      connected: false,
      authenticated: false,
      joinedConversation: false,
      messageReceived: false,
      typingReceived: false,
      error: error.message
    };
  }
}

async function runTest() {
  console.log('🚀 Starting Frontend WebSocket Integration Test\n');

  const results = await testFrontendIntegration();

  console.log('\n📈 Test Summary:');
  console.log('==================');
  Object.entries(results).forEach(([test, passed]) => {
    if (test !== 'error') {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    }
  });

  const allPassed = Object.entries(results)
    .filter(([key]) => key !== 'error')
    .every(([key, value]) => value === true);

  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (results.error) {
    console.log(`\n❌ Error: ${results.error}`);
  }

  console.log('\n💡 Next Steps:');
  console.log('- WebSocket server is ready for frontend connections');
  console.log('- Start the FixRx app with: npx expo start');
  console.log('- Open app in browser/simulator to test real-time chat');

  process.exit(allPassed ? 0 : 1);
}

runTest();