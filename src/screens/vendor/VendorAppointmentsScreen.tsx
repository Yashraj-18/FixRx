import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { makePhoneCall, getMockPhoneNumber } from '../../utils/phoneUtils';
import { MainTabParamList, RootStackParamList } from '../../types/navigation';
import { getUpcomingAppointments, getCompletedAppointments, getNewRequests, Appointment, ServiceRequest } from '../../data/mockVendorData';

type VendorAppointmentsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'VendorAppointments'>,
  StackNavigationProp<RootStackParamList>
>;

const { width } = Dimensions.get('window');

const VendorAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<VendorAppointmentsNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { conversations } = useAppContext();

  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'requests' | 'completed'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const upcomingAppointments = useMemo(() => getUpcomingAppointments(), []);
  const serviceRequests = useMemo(() => getNewRequests(), []);
  const completedAppointments = useMemo(() => getCompletedAppointments(), []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const findConversationForCustomer = useCallback((customerName: string) => {
    const normalized = customerName.trim().toLowerCase();
    return conversations?.find((conversation) => {
      const metadataName = (conversation.metadata as any)?.serviceDetails?.customerName;
      if (metadataName && metadataName.trim().toLowerCase() === normalized) {
        return true;
      }

      return conversation.participants?.some((participant) => {
        const fullName = `${participant.firstName || ''} ${participant.lastName || ''}`.trim().toLowerCase();
        return fullName !== '' && fullName === normalized;
      });
    });
  }, [conversations]);

  const buildServiceDetails = useCallback((appointment: Appointment) => ({
    service: appointment.service,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    amount: appointment.amount,
  }), []);

  const handleMessageCustomer = useCallback((appointment: Appointment) => {
    const conversation = findConversationForCustomer(appointment.customerName);
    const participant = conversation?.participants?.find((participant) => {
      const fullName = `${participant.firstName || ''} ${participant.lastName || ''}`.trim().toLowerCase();
      return fullName !== '' && fullName === appointment.customerName.trim().toLowerCase();
    });

    navigation.navigate('Messaging', {
      conversationId: conversation?.id || 'mock-conversation-1',
      customerName: appointment.customerName,
      userName: conversation?.metadata?.serviceDetails?.customerName || appointment.customerName,
      userImage:
        participant?.avatarUrl ||
        conversation?.metadata?.serviceDetails?.customerAvatar ||
        appointment.customerAvatar ||
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      serviceDetails: conversation?.metadata?.serviceDetails || buildServiceDetails(appointment),
    });
  }, [buildServiceDetails, findConversationForCustomer, navigation]);

  const handleCallCustomer = useCallback((appointment: Appointment) => {
    const phoneNumber = appointment.phone || getMockPhoneNumber(appointment.customerName);
    makePhoneCall(phoneNumber, appointment.customerName);
  }, []);

  const getStatusBadge = useCallback((status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
      case 'in-progress':
        return { label: 'Confirmed', backgroundColor: '#DBEAFE', color: '#1D4ED8' };
      case 'completed':
        return { label: 'Completed', backgroundColor: '#D1FAE5', color: '#047857' };
      case 'cancelled':
        return { label: 'Cancelled', backgroundColor: '#FEE2E2', color: '#B91C1C' };
      default:
        return { label: status, backgroundColor: '#F3F4F6', color: '#6B7280' };
    }
  }, []);

  const getPriorityBadge = useCallback((priority: Appointment['priority']) => {
    switch (priority) {
      case 'high':
        return { label: 'High Priority', backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'medium':
        return { label: 'Medium Priority', backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'low':
      default:
        return { label: 'Low Priority', backgroundColor: '#DBEAFE', color: '#1D4ED8' };
    }
  }, []);

  const renderAppointmentCard = useCallback((appointment: Appointment, isCompleted: boolean) => {
    const statusBadge = getStatusBadge(appointment.status);
    const priorityBadge = getPriorityBadge(appointment.priority);

    return (
      <View key={appointment.id} style={[styles.card, { backgroundColor: colors.card }]}> 
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: appointment.customerAvatar }} style={styles.avatar} />
            <View style={styles.headerContent}>
              <View style={styles.headerRow}>
                <Text style={[styles.serviceText, { color: colors.text }]}>{appointment.service}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: priorityBadge.backgroundColor }]}> 
                  <Text style={[styles.priorityText, { color: priorityBadge.color }]}>{priorityBadge.label}</Text>
                </View>
              </View>
              <Text style={[styles.customerText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{appointment.customerName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.backgroundColor }]}> 
            <Text style={[styles.statusText, { color: statusBadge.color }]}>{statusBadge.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MaterialIcons name="event" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{appointment.date} • {appointment.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialIcons name="location-on" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]} numberOfLines={1}>{appointment.address}</Text>
        </View>

        {appointment.duration && (
          <View style={styles.metaRow}>
            <MaterialIcons name="timer" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{appointment.duration}</Text>
          </View>
        )}

        {isCompleted && appointment.notes && (
          <Text style={[styles.notesText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]}>“{appointment.notes}”</Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={[styles.amountText, { color: colors.text }]}>${appointment.amount}</Text>
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}
              onPress={() => handleMessageCustomer(appointment)}
            >
              <MaterialIcons name="message" size={16} color={colors.primary} />
              <Text style={[styles.messageButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.callButton, { backgroundColor: colors.primary }]}
              onPress={() => handleCallCustomer(appointment)}
            >
              <MaterialIcons name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [colors.card, colors.primary, colors.text, handleCallCustomer, handleMessageCustomer, isDarkMode, getPriorityBadge, getStatusBadge]);

  const renderServiceRequestCard = useCallback((request: ServiceRequest) => {
    const urgencyColors = {
      emergency: { bg: '#FEE2E2', text: '#DC2626' },
      urgent: { bg: '#FEF3C7', text: '#D97706' },
      normal: { bg: '#DBEAFE', text: '#1D4ED8' },
      flexible: { bg: '#D1FAE5', text: '#047857' },
    };
    const urgency = urgencyColors[request.urgency];

    return (
      <TouchableOpacity
        key={request.id}
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('ServiceRequestDetail', { request })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: request.customerAvatar }} style={styles.avatar} />
            <View style={styles.headerContent}>
              <Text style={[styles.serviceText, { color: colors.text }]}>{request.service}</Text>
              <Text style={[styles.customerText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{request.customerName}</Text>
            </View>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
            <Text style={[styles.urgencyText, { color: urgency.text }]}>{request.urgency.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={[styles.descriptionText, { color: isDarkMode ? '#D1D5DB' : '#374151' }]} numberOfLines={2}>
          {request.description}
        </Text>

        <View style={styles.metaRow}>
          <MaterialIcons name="location-on" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>{request.distance} miles away</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.budgetText, { color: colors.text }]}>
            {request.estimatedBudget ? `$${request.estimatedBudget}` : 'Budget TBD'}
          </Text>
          <View style={[styles.viewButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.viewButtonText}>View Request</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [colors, isDarkMode, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Appointments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.tabContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}> 
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'upcoming' && [styles.tabButtonActive, { backgroundColor: colors.primary }]]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, { color: selectedTab === 'upcoming' ? '#FFFFFF' : colors.text }]}>Upcoming</Text>
          <View style={[styles.tabBadge, { backgroundColor: selectedTab === 'upcoming' ? '#FFFFFF' : '#E5E7EB' }]}> 
            <Text style={[styles.tabBadgeText, { color: selectedTab === 'upcoming' ? colors.primary : '#6B7280' }]}>{upcomingAppointments.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'requests' && [styles.tabButtonActive, { backgroundColor: colors.primary }]]}
          onPress={() => setSelectedTab('requests')}
        >
          <Text style={[styles.tabText, { color: selectedTab === 'requests' ? '#FFFFFF' : colors.text }]}>New Requests</Text>
          <View style={[styles.tabBadge, { backgroundColor: selectedTab === 'requests' ? '#FFFFFF' : '#E5E7EB' }]}> 
            <Text style={[styles.tabBadgeText, { color: selectedTab === 'requests' ? colors.primary : '#6B7280' }]}>{serviceRequests.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'completed' && [styles.tabButtonActive, { backgroundColor: colors.primary }]]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, { color: selectedTab === 'completed' ? '#FFFFFF' : colors.text }]}>Completed</Text>
          <View style={[styles.tabBadge, { backgroundColor: selectedTab === 'completed' ? '#FFFFFF' : '#E5E7EB' }]}> 
            <Text style={[styles.tabBadgeText, { color: selectedTab === 'completed' ? colors.primary : '#6B7280' }]}>{completedAppointments.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'requests' ? (
          serviceRequests.map((request) => renderServiceRequestCard(request))
        ) : (
          (selectedTab === 'upcoming' ? upcomingAppointments : completedAppointments).map((appointment) => 
            renderAppointmentCard(appointment, selectedTab === 'completed')
          )
        )}

        {((selectedTab === 'requests' && serviceRequests.length === 0) || 
          (selectedTab !== 'requests' && (selectedTab === 'upcoming' ? upcomingAppointments : completedAppointments).length === 0)) && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}> 
            <MaterialIcons name="event-available" size={32} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {selectedTab === 'requests' ? 'No new requests' : 'No appointments yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Pull to refresh or check back later.</Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  tabBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  headerContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  customerText: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 10,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#FFFFFF',
  },
  emptyState: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 12,
    lineHeight: 20,
  },
  budgetText: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
});

export default VendorAppointmentsScreen;
