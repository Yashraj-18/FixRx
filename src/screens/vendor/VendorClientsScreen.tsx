import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const VendorClientsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();

  const clients = [
    { id: '1', name: 'Jennifer Wilson', jobs: 8, spent: 1420, lastService: '2 days ago', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: '2', name: 'Lisa Martinez', jobs: 5, spent: 890, lastService: '1 week ago', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
    { id: '3', name: 'David Thompson', jobs: 12, spent: 2150, lastService: '3 days ago', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    { id: '4', name: 'Sarah Johnson', jobs: 6, spent: 1050, lastService: '5 days ago', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: '5', name: 'Michael Brown', jobs: 4, spent: 720, lastService: '1 week ago', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>My Clients</Text>
        <TouchableOpacity style={styles.searchButton}>
          <MaterialIcons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{clients.length}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Total Clients</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Avg Rating</Text>
          </View>
        </View>

        {/* Client List */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>All Clients</Text>
        {clients.map(client => (
          <TouchableOpacity
            key={client.id}
            style={[styles.clientCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}
          >
            <Image source={{ uri: client.avatar }} style={styles.avatar} />
            <View style={styles.clientInfo}>
              <Text style={[styles.clientName, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                {client.name}
              </Text>
              <View style={styles.clientMeta}>
                <MaterialIcons name="star" size={14} color="#F59E0B" />
                <Text style={[styles.rating, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
                  {client.rating}
                </Text>
                <Text style={[styles.metaSeparator, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>•</Text>
                <Text style={[styles.metaText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  {client.jobs} jobs
                </Text>
              </View>
              <Text style={[styles.lastService, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                Last service: {client.lastService}
              </Text>
            </View>
            <View style={styles.clientRight}>
              <Text style={[styles.spent, { color: colors.primary }]}>
                ${client.spent}
              </Text>
              <Text style={[styles.spentLabel, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                Total Spent
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  clientCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  metaSeparator: {
    marginHorizontal: 6,
  },
  metaText: {
    fontSize: 14,
  },
  lastService: {
    fontSize: 12,
  },
  clientRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  spent: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  spentLabel: {
    fontSize: 11,
  },
});

export default VendorClientsScreen;
