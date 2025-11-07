import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const ServiceRequestDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDarkMode } = useTheme();
  
  // Get request data from route params
  const { request } = route.params as { request?: any };

  // Fallback data if no request is passed
  const requestData = request || {
    id: 'req_1',
    customerName: 'Sarah Johnson',
    title: 'Kitchen Sink Repair',
    distance: '2.3 mi',
    date: '5 min ago',
    budget: 175,
    priority: 'high',
    description: 'Kitchen sink is leaking and needs immediate repair. Water is pooling under the cabinet.',
    timeRange: 'ASAP',
    status: 'pending'
  };

  const priorityColors = {
    high: { bg: '#FEE2E2', text: '#DC2626' },
    medium: { bg: '#FEF3C7', text: '#D97706' },
    low: { bg: '#DBEAFE', text: '#2563EB' }
  };

  const priorityColor = priorityColors[requestData.priority as keyof typeof priorityColors] || priorityColors.medium;

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
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Service Request</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Customer Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.customerHeader}>
            <Image 
              source={{ 
                uri: `https://images.unsplash.com/photo-${requestData.id === 'req_1' ? '1494790108755-2616b612b786' : '1472099645785-5658abf4ff4e'}?w=150&h=150&fit=crop&crop=face`
              }} 
              style={styles.customerAvatar}
            />
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: colors.primaryText }]}>
                {requestData.customerName}
              </Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color={colors.secondaryText} />
                <Text style={[styles.locationText, { color: colors.secondaryText }]}>
                  {requestData.distance} away
                </Text>
              </View>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor.bg }]}>
              <Text style={[styles.priorityText, { color: priorityColor.text }]}>
                {requestData.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Service Details</Text>
          
          <Text style={[styles.serviceTitle, { color: colors.primaryText }]}>
            {requestData.title}
          </Text>
          
          <Text style={[styles.serviceDescription, { color: colors.secondaryText }]}>
            {requestData.description}
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={20} color={colors.primary} />
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Timeline</Text>
              <Text style={[styles.detailValue, { color: colors.primaryText }]}>
                {requestData.timeRange}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialIcons name="attach-money" size={20} color={colors.primary} />
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Budget</Text>
              <Text style={[styles.detailValue, { color: colors.primaryText }]}>
                ${requestData.budget - 25}-${requestData.budget + 25}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Actions</Text>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Accept Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.primary }]}>
            <MaterialIcons name="message" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Send Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { borderColor: colors.secondaryText }]}>
            <MaterialIcons name="close" size={20} color={colors.secondaryText} />
            <Text style={[styles.actionButtonText, { color: colors.secondaryText }]}>Decline</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#FFFFFF',
  },
});

export default ServiceRequestDetailScreen;
