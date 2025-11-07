import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StripeProvider } from '@stripe/stripe-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { navigationRef } from './src/navigation/navigationRef';
import ErrorBoundary from './src/components/ErrorBoundary';
import { sessionManager } from './src/utils/sessionManager';
import CrashPrevention from './src/utils/crashPrevention';
import { useWebSocket } from './src/hooks/useWebSocket'; // Re-enabled for real-time chat

// Auth Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import EmailAuthScreen from './src/screens/auth/EmailAuthScreen';
import EmailConfirmationScreen from './src/screens/auth/EmailConfirmationScreen';
import UserTypeSelectionScreen from './src/screens/auth/UserTypeSelectionScreen';
import PhoneAuthScreen from './src/screens/auth/PhoneAuthScreen';

// Consumer Screens
import ConsumerProfileSetupScreen from './src/screens/consumer/ConsumerProfileSetupScreen';

// Vendor Screens
import VendorProfileSetupScreen from './src/screens/vendor/VendorProfileSetupScreen';
import VendorServiceSelectionScreen from './src/screens/vendor/VendorServiceSelectionScreen';
import VendorPortfolioUploadScreen from './src/screens/vendor/VendorPortfolioUploadScreen';

// Main App Navigation
import MainTabs from './src/navigation/MainTabs';
import ContactSelectionScreen from './src/screens/ContactSelectionScreen';
import MessagePreviewScreen from './src/screens/MessagePreviewScreen';
import InvitationSuccessScreen from './src/screens/InvitationSuccessScreen';
import ContractorProfileScreen from './src/screens/ContractorProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MessagingScreenDemo from './src/screens/MessagingScreenDemo';
import RatingScreen from './src/screens/RatingScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import ServiceRequestDetailScreen from './src/screens/vendor/ServiceRequestDetailScreen';
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main App Component
export default function App() {
  // Re-enabled WebSocket for real-time chat with proper error handling
  const webSocket = useWebSocket(true); // Enable auto-connect

  // Initialize crash prevention and session manager
  useEffect(() => {
    // Initialize crash prevention systems (run once)
    const initOnce = async () => {
      CrashPrevention.initialize();

      if (__DEV__) {
        await sessionManager.initializeDevSessionClearing();
      }
    };

    initOnce();

    if (__DEV__) {
      // Re-enabled WebSocket tools for development
      WebSocketTester.enableDevTools();

      console.log('🔗 WebSocket Status:', webSocket.status);

      // Global WebSocket testing utilities
      (global as any).wsTest = {
        status: () => console.log('WebSocket Status:', webSocket.status),
        connect: () => webSocket.connect(),
        disconnect: () => webSocket.disconnect(),
        reconnect: () => webSocket.forceReconnect(),
        test: async () => {
          const connected = await webSocket.connect();
          console.log('WebSocket test result:', connected);
          return connected;
        }
      };
    }
  }, []); // Run only once on mount

  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.fixrx">
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppProvider>
              <NavigationContainer ref={navigationRef}>
              <StatusBar style="auto" />
              <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
            }}
          >
            {/* Auth Flow */}
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="EmailAuth" 
              component={EmailAuthScreen} 
            />
            <Stack.Screen 
              name="EmailConfirmation" 
              component={EmailConfirmationScreen} 
            />
            <Stack.Screen 
              name="PhoneAuth" 
              component={PhoneAuthScreen} 
            />
            <Stack.Screen 
              name="UserType" 
              component={UserTypeSelectionScreen} 
            />
            
            {/* Consumer Onboarding */}
            <Stack.Screen 
              name="ConsumerProfile" 
              component={ConsumerProfileSetupScreen} 
            />
            
            {/* Vendor Onboarding */}
            <Stack.Screen 
              name="VendorProfileSetup" 
              component={VendorProfileSetupScreen} 
            />
            <Stack.Screen 
              name="VendorServiceSelection" 
              component={VendorServiceSelectionScreen} 
            />
            <Stack.Screen 
              name="VendorPortfolioUpload" 
              component={VendorPortfolioUploadScreen} 
            />
            
            {/* Main App */}
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{
                gestureEnabled: false,
              }}
            />
            
            {/* Additional Screens */}
            <Stack.Screen 
              name="ContactSelection" 
              component={ContactSelectionScreen} 
            />
            <Stack.Screen 
              name="MessagePreview" 
              component={MessagePreviewScreen} 
            />
            <Stack.Screen 
              name="InvitationSuccess" 
              component={InvitationSuccessScreen} 
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="ContractorProfile" 
              component={ContractorProfileScreen} 
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
            />
            <Stack.Screen 
              name="Messaging" 
              component={MessagingScreenDemo} 
            />
            <Stack.Screen 
              name="Rating" 
              component={RatingScreen} 
            />
            <Stack.Screen 
              name="HelpCenter" 
              component={HelpCenterScreen} 
            />
            <Stack.Screen 
              name="AccountSettings" 
              component={AccountSettingsScreen} 
            />
            <Stack.Screen 
              name="ServiceRequestDetail" 
              component={ServiceRequestDetailScreen} 
            />
            </Stack.Navigator>
              </NavigationContainer>
            </AppProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </StripeProvider>
  );
}
