import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppContext } from '../context/AppContext';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';
import EmailAuthScreen from '../screens/auth/EmailAuthScreen';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import EmailConfirmationScreen from '../screens/auth/EmailConfirmationScreen';
import TwoFactorVerificationScreen from '../screens/auth/TwoFactorVerificationScreen';
import ConsumerProfileSetupScreen from '../screens/consumer/ConsumerProfileSetupScreen';
import VendorProfileSetupScreen from '../screens/vendor/VendorProfileSetupScreen';
import VendorServiceSelectionScreen from '../screens/vendor/VendorServiceSelectionScreen';
import VendorPortfolioUploadScreen from '../screens/vendor/VendorPortfolioUploadScreen';
import MainTabs from './MainTabs';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AllRecommendationsScreen from '../screens/AllRecommendationsScreen';
import ContactSelectionScreen from '../screens/ContactSelectionScreen';
import MessagePreviewScreen from '../screens/MessagePreviewScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import MessagingScreenDemo from '../screens/MessagingScreenDemo';
import ServiceRequestDetailScreen from '../screens/ServiceRequestDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RatingScreen from '../screens/RatingScreen';
import ContractorProfileScreen from '../screens/ContractorProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import InvoiceUploadScreen from '../screens/InvoiceUploadScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { isAuthenticated } = useAppContext();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="UserType" component={UserTypeSelectionScreen} />
            <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
            <Stack.Screen name="TwoFactorVerification" component={TwoFactorVerificationScreen} options={{ title: '2FA Verification' }} />
            <Stack.Screen name="ConsumerProfile" component={ConsumerProfileSetupScreen} />
            <Stack.Screen name="VendorProfileSetup" component={VendorProfileSetupScreen} />
            <Stack.Screen name="VendorServiceSelection" component={VendorServiceSelectionScreen} />
            <Stack.Screen name="VendorPortfolioUpload" component={VendorPortfolioUploadScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ContactSelection" component={ContactSelectionScreen} />
            <Stack.Screen name="MessagePreview" component={MessagePreviewScreen} />
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="AllRecommendations" component={AllRecommendationsScreen} />
            <Stack.Screen name="Messaging" component={MessagingScreenDemo} />
            <Stack.Screen name="ServiceRequestDetail" component={ServiceRequestDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Rating" component={RatingScreen} />
            <Stack.Screen name="ContractorProfile" component={ContractorProfileScreen} />
            <Stack.Screen 
              name="HelpCenter" 
              component={HelpCenterScreen} 
              options={{
                headerShown: true,
                title: 'Help Center',
                headerBackTitle: 'Back',
                headerStyle: {
                  backgroundColor: 'transparent',
                },
                headerTintColor: '#000',
              }}
            />
            <Stack.Screen 
              name="Payment" 
              component={PaymentScreen}
              options={{
                headerShown: true,
                title: 'Payment',
                headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen 
              name="InvoiceUpload" 
              component={InvoiceUploadScreen}
              options={{
                headerShown: true,
                title: 'Upload Invoice',
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
