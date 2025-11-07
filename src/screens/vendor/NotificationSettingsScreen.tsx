import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../../types/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type NotificationSettingsNavigationProp = StackNavigationProp<MainTabParamList, 'NotificationSettings'>;

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const darkMode = isDarkMode;

  const [settings, setSettings] = useState({
    newRequests: true,
    appointments: true,
    messages: true,
    payments: true,
    marketing: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#1E3A8A' : '#EFF6FF' }]}>
          <MaterialIcons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.primaryText }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: darkMode ? '#374151' : '#E5E7EB', true: colors.primary }}
        thumbColor={value ? '#FFFFFF' : darkMode ? '#9CA3AF' : '#F3F4F6'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Service Notifications</Text>
          
          <NotificationItem
            title="New Service Requests"
            description="Get notified when customers request your services"
            value={settings.newRequests}
            onToggle={() => toggleSetting('newRequests')}
            icon="work"
          />
          
          <NotificationItem
            title="Appointment Updates"
            description="Notifications for appointment confirmations and changes"
            value={settings.appointments}
            onToggle={() => toggleSetting('appointments')}
            icon="event"
          />
          
          <NotificationItem
            title="New Messages"
            description="Get notified when customers send you messages"
            value={settings.messages}
            onToggle={() => toggleSetting('messages')}
            icon="message"
          />
          
          <NotificationItem
            title="Payment Notifications"
            description="Updates on payments and earnings"
            value={settings.payments}
            onToggle={() => toggleSetting('payments')}
            icon="payment"
          />
        </View>

        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Delivery Methods</Text>
          
          <NotificationItem
            title="Push Notifications"
            description="Receive notifications on your device"
            value={settings.pushNotifications}
            onToggle={() => toggleSetting('pushNotifications')}
            icon="notifications"
          />
          
          <NotificationItem
            title="Email Notifications"
            description="Receive notifications via email"
            value={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
            icon="email"
          />
          
          <NotificationItem
            title="SMS Notifications"
            description="Receive notifications via text message"
            value={settings.smsNotifications}
            onToggle={() => toggleSetting('smsNotifications')}
            icon="sms"
          />
        </View>

        {/* Marketing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Marketing</Text>
          
          <NotificationItem
            title="Promotional Updates"
            description="Receive updates about new features and promotions"
            value={settings.marketing}
            onToggle={() => toggleSetting('marketing')}
            icon="campaign"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
});

export default NotificationSettingsScreen;
