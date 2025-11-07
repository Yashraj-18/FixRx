import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const VendorNotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'requests' | 'payments'>('all');

  const notifications = [
    {
      id: '1',
      title: 'New Service Request',
      message: 'Kitchen sink repair requested by Sarah Johnson',
      time: '5 min ago',
      unread: true,
      type: 'request'
    },
    {
      id: '2',
      title: 'Urgent Request',
      message: 'Mike Rodriguez needs toilet repair ASAP',
      time: '15 min ago',
      unread: true,
      type: 'request'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Payment of $175 received from Sarah Johnson',
      time: '30 min ago',
      unread: false,
      type: 'payment'
    },
    {
      id: '4',
      title: 'Appointment Confirmed',
      message: 'Emily Chen confirmed garbage disposal installation for Saturday',
      time: '1 hour ago',
      unread: false,
      type: 'appointment'
    },
    {
      id: '5',
      title: 'New Message',
      message: 'Jessica Martinez: "Please hurry! The water damage is getting worse."',
      time: '1 hour ago',
      unread: true,
      type: 'message'
    },
    {
      id: '6',
      title: 'Service Completed',
      message: 'Water heater maintenance for Lisa Martinez marked as completed',
      time: '2 hours ago',
      unread: false,
      type: 'completed'
    },
    {
      id: '7',
      title: 'Payment Received',
      message: 'Payment of $200 received from Lisa Martinez',
      time: '2 hours ago',
      unread: false,
      type: 'payment'
    },
    {
      id: '8',
      title: 'New Review',
      message: 'John Smith left you a 5-star review!',
      time: '3 hours ago',
      unread: false,
      type: 'review'
    },
    {
      id: '9',
      title: 'Appointment Reminder',
      message: 'Upcoming appointment with Alex Thompson at 1:00 PM tomorrow',
      time: '4 hours ago',
      unread: false,
      type: 'appointment'
    },
    {
      id: '10',
      title: 'New Service Request',
      message: 'David Park needs shower head replacement',
      time: '5 hours ago',
      unread: false,
      type: 'request'
    }
  ];

  const getIconName = (type: string) => {
    switch (type) {
      case 'request': return 'build';
      case 'payment': return 'payment';
      case 'appointment': return 'event';
      case 'message': return 'message';
      case 'completed': return 'check-circle';
      case 'review': return 'star';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'request': return isDarkMode ? '#FDE68A' : '#F59E0B'; // Amber
      case 'payment': return isDarkMode ? '#34D399' : '#10B981'; // Green
      case 'appointment': return colors.primary; // Blue
      case 'message': return isDarkMode ? '#A78BFA' : '#8B5CF6'; // Purple
      case 'completed': return isDarkMode ? '#34D399' : '#10B981'; // Green
      case 'review': return '#FCD34D'; // Yellow
      default: return colors.primary;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'request': return isDarkMode ? '#78350F' : '#FEF3C7'; // Amber bg
      case 'payment': return isDarkMode ? '#064E3B' : '#D1FAE5'; // Green bg
      case 'appointment': return isDarkMode ? '#1E3A8A' : '#DBEAFE'; // Blue bg
      case 'message': return isDarkMode ? '#4C1D95' : '#EDE9FE'; // Purple bg
      case 'completed': return isDarkMode ? '#064E3B' : '#D1FAE5'; // Green bg
      case 'review': return isDarkMode ? '#78350F' : '#FEF3C7'; // Yellow bg
      default: return colors.surface;
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => n.unread);
      case 'requests':
        return notifications.filter(n => n.type === 'request');
      case 'payments':
        return notifications.filter(n => n.type === 'payment');
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const renderNotification = (notification: typeof notifications[0]) => (
    <TouchableOpacity 
      key={notification.id}
      style={[
        styles.notificationCard,
        { backgroundColor: colors.cardBackground },
        notification.unread && { borderLeftColor: colors.primary, borderLeftWidth: 4 }
      ]}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBackground(notification.type) }]}>
          <MaterialIcons 
            name={getIconName(notification.type) as any} 
            size={24} 
            color={getIconColor(notification.type)} 
          />
        </View>
        <View style={styles.textContent}>
          <Text style={[
            styles.notificationTitle, 
            { color: colors.primaryText },
            notification.unread && { fontWeight: '600' }
          ]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: colors.secondaryText }]}>
            {notification.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.secondaryText }]}>
            {notification.time}
          </Text>
        </View>
        {notification.unread && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.secondaryText },
            activeTab === 'all' && [styles.activeTabText, { color: colors.primary }]
          ]}>
            All
          </Text>
          {activeTab === 'all' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.secondaryText },
            activeTab === 'unread' && [styles.activeTabText, { color: colors.primary }]
          ]}>
            Unread ({notifications.filter(n => n.unread).length})
          </Text>
          {activeTab === 'unread' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.secondaryText },
            activeTab === 'requests' && [styles.activeTabText, { color: colors.primary }]
          ]}>
            Requests
          </Text>
          {activeTab === 'requests' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Text style={[
            styles.tabText, 
            { color: colors.secondaryText },
            activeTab === 'payments' && [styles.activeTabText, { color: colors.primary }]
          ]}>
            Payments
          </Text>
          {activeTab === 'payments' && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={({ item }) => renderNotification(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Active tab styling handled by indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
  listContent: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default VendorNotificationsScreen;
