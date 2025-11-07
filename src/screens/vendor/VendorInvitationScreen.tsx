import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../../types/navigation';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import ContactsService, { PhoneContact } from '../../services/ContactsService';
import SMSService from '../../services/SMSService';

type VendorInvitationNavigationProp = StackNavigationProp<MainTabParamList, 'VendorInvitation'>;
type VendorInvitationRouteProp = RouteProp<MainTabParamList, 'VendorInvitation'>;

const VendorInvitationScreen: React.FC = () => {
  const navigation = useNavigation<VendorInvitationNavigationProp>();
  const route = useRoute<VendorInvitationRouteProp>();
  const { theme, isDarkMode, colors } = useTheme();
  const { userProfile } = useAppContext();
  const darkMode = isDarkMode;
  
  // Get invite type from route params (default to 'contractor' for backward compatibility)
  const inviteType = route.params?.inviteType || 'contractor';
  
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<PhoneContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'potential' | 'recent' | 'favorites'>('all');

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = ContactsService.searchContacts(searchQuery, contacts);
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const loadedContacts = await ContactsService.getContacts();
      setContacts(loadedContacts);
      setFilteredContacts(loadedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert(
        'Error',
        'Failed to load contacts. Please check permissions and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSelection = prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId];
      return newSelection;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = filteredContacts.map(c => c.id);
    setSelectedContacts(prev => {
      const newSelection = [...prev];
      visibleIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  const clearAll = () => {
    setSelectedContacts([]);
  };

  const getTabCount = (tab: string) => {
    return contacts.length;
  };

  const getInitials = (name: string) => {
    const nameParts = name?.trim().split(' ').filter(n => n.length > 0) || [];
    return nameParts.length > 0
      ? nameParts
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??';
  };

  const handleSendInvites = () => {
    if (selectedContacts.length === 0) {
      Alert.alert(
        'Select Contacts First', 
        'Please select at least one contact to send invitations to.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Get selected contact details and navigate to MessagePreview
    const selectedContactDetails = filteredContacts.filter(c => selectedContacts.includes(c.id));
    
    // Transform PhoneContact to the format expected by MessagePreview
    const contactsForPreview = selectedContactDetails.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.primaryPhone || contact.phoneNumbers[0] || '',
      initials: contact.name.charAt(0).toUpperCase(),
    }));

    (navigation as any).navigate('MessagePreview', {
      selectedContacts: contactsForPreview,
      inviteType: inviteType
    });
  };

  const handleSkip = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedContacts([]);
    loadContacts();
  };

  const renderContact = ({ item }: { item: PhoneContact }) => {
    const isSelected = selectedContacts.includes(item.id);
    const displayPhone = ContactsService.formatPhoneNumber(item.primaryPhone || item.phoneNumbers[0] || '');
    const initials = getInitials(item.name);
    
    return (
      <TouchableOpacity 
        style={[styles.contactItem, { borderBottomColor: colors.border }]}
        onPress={() => toggleContact(item.id)}
      >
        <View style={styles.contactLeft}>
          <View style={[
            styles.avatarContainer,
            { backgroundColor: isSelected ? colors.primary : colors.surface }
          ]}>
            {isSelected ? (
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.initials,
                { color: isSelected ? '#FFFFFF' : colors.primaryText }
              ]}>
                {initials}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.contactInfoSection}>
          <Text style={[styles.contactName, { color: colors.primaryText }]}>
            {item.name}
          </Text>
          <Text style={[styles.contactPhone, { color: colors.secondaryText }]}>
            {displayPhone}
          </Text>
        </View>

        <View style={[
          styles.selectionCircle,
          { 
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent'
          }
        ]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            {inviteType === 'friend' ? 'Invite Friends' : inviteType === 'client' ? 'Invite Clients' : 'Invite Service Providers'}
          </Text>
          <Text style={[styles.subtitle, { color: darkMode ? '#9CA3AF' : '#6C757D' }]}>
            {inviteType === 'friend' 
              ? 'Share FixRx with your friends and help them find trusted contractors!'
              : inviteType === 'client'
              ? 'Invite your clients to connect with you on FixRx for easier booking and payments!'
              : 'Know other contractors or service providers? Invite them to join FixRx!'}
          </Text>
        </View>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.statItem}>
          <MaterialIcons name="people" size={32} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.primaryText }]}>{selectedContacts.length}</Text>
          <Text style={[styles.statLabel, { color: darkMode ? '#9CA3AF' : '#6C757D' }]}>Selected</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <MaterialIcons name="attach-money" size={32} color="#10B981" />
          <Text style={[styles.statValue, { color: colors.primaryText }]}>$30</Text>
          <Text style={[styles.statLabel, { color: darkMode ? '#9CA3AF' : '#6C757D' }]}>Per Referral</Text>
        </View>
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: darkMode ? '#1E3A8A' : '#E7F5FF' }]}>
        <MaterialIcons name="info" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: darkMode ? '#D1D5DB' : '#0D6EFD' }]}>
          Earn $30 for each service provider who joins and completes their first job!
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder="Search contacts..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && [styles.tabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'all' ? '#FFFFFF' : colors.secondaryText }
          ]}>
            All ({getTabCount('all')})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selection Info Bar */}
      {selectedContacts.length > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.selectionText, { color: colors.primaryText }]}>
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.clearButton, { color: colors.secondaryText }]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Select All Option */}
      <TouchableOpacity 
        style={[styles.selectAllButton]}
        onPress={selectAllVisible}
      >
        <Text style={[styles.selectAllText, { color: colors.primary }]}>
          Select all visible ({filteredContacts.length})
        </Text>
      </TouchableOpacity>

      {/* Contacts Count */}
      <Text style={[styles.contactsCount, { color: colors.secondaryText }]}>
        {filteredContacts.length} of {contacts.length} contacts
      </Text>

      {/* Contacts List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>
            Loading your contacts...
          </Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="contacts" size={64} color={darkMode ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>
            {searchQuery ? 'No contacts found' : 'No contacts available'}
          </Text>
          <Text style={[styles.emptyText, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>
            {searchQuery 
              ? 'Try a different search term' 
              : 'Make sure you have granted contacts permission'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadContacts}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredContacts.length <= 3 && { flexGrow: 1 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSendInvites}
          activeOpacity={0.8}
          disabled={isSending}
        >
          <MaterialIcons name="send" size={20} color="#FFFFFF" />
          <Text style={styles.buttonPrimaryText} numberOfLines={1}>
            Send Invites ({selectedContacts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonSecondaryText, { color: darkMode ? '#9CA3AF' : '#6C757D' }]} numberOfLines={1}>
            Skip for Now
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E7F5FF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0D6EFD',
    marginLeft: 8,
    lineHeight: 18,
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  contactCardSelected: {
    borderColor: '#0D6EFD',
    backgroundColor: '#F0F7FF',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarSelected: {
    backgroundColor: '#0D6EFD',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
  },
  contactAvatarTextSelected: {
    color: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
    color: '#6C757D',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ADB5BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0D6EFD',
    borderColor: '#0D6EFD',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 50,
  },
  buttonPrimary: {
    backgroundColor: '#0D6EFD',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
  },
  buttonSecondaryText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#212529',
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6C757D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // New Consumer-style UI elements
  tabsContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    maxHeight: 44,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  tabActive: {
    backgroundColor: '#0D6EFD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactsCount: {
    paddingHorizontal: 16,
    fontSize: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactInfoSection: {
    flex: 1,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VendorInvitationScreen;
