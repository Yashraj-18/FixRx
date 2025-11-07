import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, MessageSquare, User } from 'lucide-react-native';
import { MainTabParamList } from '../types/navigation';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

// Screens
import ConsumerDashboard from '../screens/consumer/ConsumerDashboard';
import VendorDashboard from '../screens/vendor/VendorDashboard';
import ContractorsScreen from '../screens/consumer/ContractorsScreen';
import AllRecommendationsScreen from '../screens/AllRecommendationsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Vendor Screens
import VendorNotificationsScreen from '../screens/vendor/VendorNotificationsScreen';
import VendorAppointmentsScreen from '../screens/vendor/VendorAppointmentsScreen';
import VendorScheduleScreen from '../screens/vendor/VendorScheduleScreen';
import VendorEarningsScreen from '../screens/vendor/VendorEarningsScreen';
import VendorClientsScreen from '../screens/vendor/VendorClientsScreen';
import VendorInvitationScreen from '../screens/vendor/VendorInvitationScreen';
import NotificationSettingsScreen from '../screens/vendor/NotificationSettingsScreen';
import ServiceRequestDetailScreen from '../screens/vendor/ServiceRequestDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainTabParamList>();

// Create a stack navigator for vendor screens
function VendorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorHome" component={VendorDashboard} />
      <Stack.Screen name="VendorNotifications" component={VendorNotificationsScreen} />
      <Stack.Screen name="VendorAppointments" component={VendorAppointmentsScreen} />
      <Stack.Screen name="VendorSchedule" component={VendorScheduleScreen} />
      <Stack.Screen name="VendorEarnings" component={VendorEarningsScreen} />
      <Stack.Screen name="VendorClients" component={VendorClientsScreen} />
      <Stack.Screen name="VendorInvitation" component={VendorInvitationScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { userType } = useAppContext();
  const { colors, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Home size={size} color={color} />;
          } else if (route.name === 'Contractors') {
            return userType === 'vendor' ? <MessageSquare size={size} color={color} /> : <Search size={size} color={color} />;
          } else if (route.name === 'Messages') {
            return <MessageSquare size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <User size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={userType === 'vendor' ? VendorStack : ConsumerDashboard} 
      />
      {userType === 'vendor' ? (
        <Tab.Screen 
          name="Contractors" 
          component={VendorAppointmentsScreen}
          options={{ title: 'Appointments' }}
        />
      ) : (
        <Tab.Screen 
          name="Contractors" 
          component={ContractorsScreen} 
        />
      )}
      <Tab.Screen 
        name="Messages" 
        component={ChatListScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
