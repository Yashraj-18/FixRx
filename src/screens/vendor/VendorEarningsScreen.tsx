import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const VendorEarningsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const earnings = {
    week: { total: 1247, jobs: 5, avg: 249 },
    month: { total: 5890, jobs: 23, avg: 256 },
    year: { total: 68450, jobs: 267, avg: 256 },
  };

  const recentTransactions = [
    { id: '1', client: 'Jennifer Wilson', service: 'Kitchen Sink Repair', amount: 175, date: 'Oct 15', status: 'paid' },
    { id: '2', client: 'Lisa Martinez', service: 'Appliance Repair', amount: 150, date: 'Oct 14', status: 'paid' },
    { id: '3', client: 'David Thompson', service: 'General Maintenance', amount: 100, date: 'Oct 13', status: 'pending' },
    { id: '4', client: 'Sarah Johnson', service: 'Plumbing Repair', amount: 225, date: 'Oct 12', status: 'paid' },
    { id: '5', client: 'Michael Brown', service: 'Electrical Work', amount: 300, date: 'Oct 11', status: 'paid' },
  ];

  const currentEarnings = earnings[selectedPeriod as keyof typeof earnings];

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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>Earnings</Text>
        <TouchableOpacity style={styles.exportButton}>
          <MaterialIcons name="file-download" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {['week', 'month', 'year'].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                { backgroundColor: selectedPeriod === period ? colors.primary : (isDarkMode ? '#374151' : '#F3F4F6') }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                { color: selectedPeriod === period ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#6B7280') }
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Earnings Card */}
        <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>${currentEarnings.total.toLocaleString()}</Text>
          <Text style={styles.totalPeriod}>This {selectedPeriod}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <MaterialIcons name="work" size={32} color="#10B981" />
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>{currentEarnings.jobs}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Jobs Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <MaterialIcons name="trending-up" size={32} color="#3B82F6" />
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>${currentEarnings.avg}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Avg per Job</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
            Recent Transactions
          </Text>
          {recentTransactions.map(transaction => (
            <View
              key={transaction.id}
              style={[styles.transactionCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' }]}>
                  <MaterialIcons name="receipt" size={24} color={colors.primary} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionClient, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                    {transaction.client}
                  </Text>
                  <Text style={[styles.transactionService, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                    {transaction.service}
                  </Text>
                  <Text style={[styles.transactionDate, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
                    {transaction.date}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                  ${transaction.amount}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: transaction.status === 'paid' ? '#D1FAE5' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: transaction.status === 'paid' ? '#059669' : '#D97706' }
                  ]}>
                    {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  totalPeriod: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
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
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionClient: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionService: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default VendorEarningsScreen;
