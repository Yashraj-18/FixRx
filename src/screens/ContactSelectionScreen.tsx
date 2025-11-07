import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types/navigation';
import ContactsService, { PhoneContact } from '../services/ContactsService';

type ContactSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ContactSelection'>;
type ContactSelectionScreenRouteProp = RouteProp<RootStackParamList, 'ContactSelection'>;

interface Contact {
  id: string;
  name: string;
  phone: string;
  initials: string;
  lastContacted?: string;
  isVerified?: boolean;
  category?: 'potential' | 'recent' | 'favorite';
  service?: string;
}

const ContactSelectionScreen: React.FC = () => {
  const navigation = useNavigation<ContactSelectionScreenNavigationProp>();
  const route = useRoute<ContactSelectionScreenRouteProp>();
  const { colors, isDarkMode } = useTheme();
  
  const inviteType = route.params?.inviteType || 'contractor';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'potential' | 'recent' | 'favorites'>('all');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const phoneContacts = await ContactsService.getContacts();
      
      // Transform PhoneContact to Contact format
      const transformedContacts: Contact[] = phoneContacts.map(contact => {
        const nameParts = contact.name?.trim().split(' ').filter(n => n.length > 0) || [];
        const initials = nameParts.length > 0
          ? nameParts
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)
          : '??';
        
        return {
          id: contact.id,
          name: contact.name || 'Unknown',
          phone: contact.primaryPhone || contact.phoneNumbers[0] || '',
          initials,
          category: 'potential' as const,
        };
      });
      
      setContacts(transformedContacts);
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

  // Filter contacts based on search and tab
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contact.phone.includes(searchQuery);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'potential') return matchesSearch && contact.category === 'potential';
    if (activeTab === 'recent') return matchesSearch && contact.category === 'recent';
    if (activeTab === 'favorites') return matchesSearch && contact.category === 'favorite';
    
    return matchesSearch;
  });

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      }
      return [...prev, contactId];
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

  const handleSendInvitation = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts Selected', 'Please select at least one contact to send an invitation.');
      return;
    }

    navigation.navigate('MessagePreview', {
      selectedContacts: selectedContacts.map(id => 
        contacts.find(c => c.id === id)!
      ),
      inviteType
    });
  };

  const getTabCount = (tab: string) => {
    switch(tab) {
      case 'all': return contacts.length;
      case 'potential': return contacts.filter(c => c.category === 'potential').length;
      case 'recent': return contacts.filter(c => c.category === 'recent').length;
      case 'favorites': return contacts.filter(c => c.category === 'favorite').length;
      default: return 0;
    }
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.contactItem, { borderBottomColor: colors.border }]}
        onPress={() => toggleContactSelection(item.id)}
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
                {item.initials}
              </Text>
            )}
          </View>
          
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.primaryText }]}>
            {item.name}
          </Text>
          <View style={styles.contactMeta}>
            <Text style={[styles.contactPhone, { color: colors.secondaryText }]}>
              {item.phone}
            </Text>
            {item.service && (
              <Text style={[styles.serviceTag, { color: colors.primary }]}>
                {item.service}
              </Text>
            )}
            {item.lastContacted && (
              <>
                <Ionicons name="time-outline" size={12} color={colors.secondaryText} />
                <Text style={[styles.lastContacted, { color: colors.secondaryText }]}>
                  {item.lastContacted}
                </Text>
              </>
            )}
          </View>
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
          {inviteType === 'contractor' ? 'Add Contractors' : inviteType === 'client' ? 'Invite Clients' : 'Invite Friends'}
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="mic-outline" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={colors.secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder={`Search for ${inviteType === 'contractor' ? 'contractors' : inviteType === 'client' ? 'clients' : 'contacts'}`}
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'potential' && [styles.tabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('potential')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'potential' ? '#FFFFFF' : colors.secondaryText }
          ]}>
            Potential Contractors ({getTabCount('potential')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'recent' && [styles.tabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'recent' ? '#FFFFFF' : colors.secondaryText }
          ]}>
            Recent ({getTabCount('recent')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'favorites' && [styles.tabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'favorites' ? '#FFFFFF' : colors.secondaryText }
          ]}>
            Favorites ({getTabCount('favorites')})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selection Info Bar */}
      {selectedContacts.length > 0 && (
        <View style={[styles.selectionBar, { backgroundColor: colors.surface }]}>
          <Text style={[styles.selectionText, { color: colors.primaryText }]}>
            {selectedContacts.length} {inviteType === 'contractor' ? 'contractor' : inviteType === 'client' ? 'client' : 'contact'}{selectedContacts.length !== 1 ? 's' : ''} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity onPress={() => navigation.navigate('MessagePreview', {
              selectedContacts: selectedContacts.map(id => 
                contacts.find(c => c.id === id)!
              ),
              inviteType
            })}>
              <Text style={[styles.previewButton, { color: colors.primary }]}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAll}>
              <Text style={[styles.clearButton, { color: colors.secondaryText }]}>Clear all</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
            Loading contacts...
          </Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.secondaryText} />
          <Text style={[styles.emptyTitle, { color: colors.primaryText }]}>
            {searchQuery ? 'No contacts found' : 'No contacts available'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
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

      {/* Send Button */}
      {selectedContacts.length > 0 && (
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendInvitation}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText} numberOfLines={1}>
            Send {selectedContacts.length} invitation{selectedContacts.length !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 36,
    alignSelf: 'flex-start',
  },
  tabActive: {
    backgroundColor: '#007AFF',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  previewButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    fontSize: 14,
  },
  selectAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactsCount: {
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 12,
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: 100,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactLeft: {
    position: 'relative',
    marginRight: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactPhone: {
    fontSize: 14,
  },
  serviceTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastContacted: {
    fontSize: 12,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
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
});

export default ContactSelectionScreen;
