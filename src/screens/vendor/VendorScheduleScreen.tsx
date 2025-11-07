import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const VendorScheduleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [selectedDay, setSelectedDay] = useState('Mon');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const schedule = [
    { day: 'Mon', date: '15', slots: [{ time: '9:00 AM - 11:00 AM', status: 'booked', client: 'David Thompson' }, { time: '2:00 PM - 4:00 PM', status: 'available' }] },
    { day: 'Tue', date: '16', slots: [{ time: '10:00 AM - 12:00 PM', status: 'available' }, { time: '2:00 PM - 4:00 PM', status: 'booked', client: 'Jennifer Wilson' }] },
    { day: 'Wed', date: '17', slots: [{ time: '9:00 AM - 11:00 AM', status: 'available' }, { time: '1:00 PM - 3:00 PM', status: 'available' }] },
    { day: 'Thu', date: '18', slots: [{ time: '10:00 AM - 12:00 PM', status: 'booked', client: 'Lisa Martinez' }, { time: '3:00 PM - 5:00 PM', status: 'available' }] },
    { day: 'Fri', date: '19', slots: [{ time: '9:00 AM - 11:00 AM', status: 'available' }, { time: '2:00 PM - 4:00 PM', status: 'available' }] },
    { day: 'Sat', date: '20', slots: [{ time: '10:00 AM - 12:00 PM', status: 'available' }] },
    { day: 'Sun', date: '21', slots: [] },
  ];

  const selectedSchedule = schedule.find(s => s.day === selectedDay);

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
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>My Schedule</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Week Days */}
        <View style={styles.weekContainer}>
          {weekDays.map(day => {
            const dayData = schedule.find(s => s.day === day);
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  { backgroundColor: isSelected ? colors.primary : (isDarkMode ? '#374151' : '#F3F4F6') }
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : (isDarkMode ? '#D1D5DB' : '#6B7280') }]}>
                  {day}
                </Text>
                <Text style={[styles.dateText, { color: isSelected ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#9CA3AF') }]}>
                  {dayData?.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Time Slots */}
        <View style={styles.slotsContainer}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
            Available Time Slots
          </Text>
          
          {selectedSchedule?.slots.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: isDarkMode ? '#374151' : '#F9FAFB' }]}>
              <MaterialIcons name="event-busy" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                No slots available for this day
              </Text>
            </View>
          ) : (
            selectedSchedule?.slots.map((slot, index) => (
              <View
                key={index}
                style={[
                  styles.slotCard,
                  { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }
                ]}
              >
                <View style={styles.slotLeft}>
                  <MaterialIcons 
                    name={slot.status === 'booked' ? 'event-available' : 'event'} 
                    size={24} 
                    color={slot.status === 'booked' ? '#10B981' : colors.primary} 
                  />
                  <View style={styles.slotInfo}>
                    <Text style={[styles.slotTime, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
                      {slot.time}
                    </Text>
                    {slot.status === 'booked' && slot.client && (
                      <Text style={[styles.clientName, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                        {slot.client}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: slot.status === 'booked' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: slot.status === 'booked' ? '#059669' : '#2563EB' }
                  ]}>
                    {slot.status === 'booked' ? 'Booked' : 'Available'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <MaterialIcons name="event-available" size={32} color="#10B981" />
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>12</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>This Week</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }]}>
            <MaterialIcons name="schedule" size={32} color={colors.primary} />
            <Text style={[styles.statValue, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>8</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>Available</Text>
          </View>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotInfo: {
    marginLeft: 12,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
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
  },
});

export default VendorScheduleScreen;
