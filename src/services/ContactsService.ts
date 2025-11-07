import * as Contacts from 'expo-contacts';
import { Alert, Platform } from 'react-native';

export interface PhoneContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  primaryPhone?: string;
}

class ContactsService {
  private hasPermission: boolean = false;

  /**
   * Request permission to access contacts
   * @returns Promise<boolean> - true if permission granted, false otherwise
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      
      if (!this.hasPermission) {
        Alert.alert(
          'Permission Required',
          'FixRx needs access to your contacts to help you invite service providers. Please enable contacts permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, you can't directly open settings, but this will prompt the user
                  Alert.alert('Settings', 'Please go to Settings > FixRx > Contacts and enable access.');
                }
              }
            }
          ]
        );
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      Alert.alert(
        'Error',
        'Failed to request contacts permission. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }

  /**
   * Check if we have permission to access contacts
   * @returns Promise<boolean>
   */
  async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      return false;
    }
  }

  /**
   * Get all contacts from the device
   * @returns Promise<PhoneContact[]>
   */
  async getContacts(): Promise<PhoneContact[]> {
    try {
      // Check permission first
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          return [];
        }
      }

      // Fetch contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
        ],
      });

      if (!data || data.length === 0) {
        return [];
      }

      // Transform contacts to our format
      const phoneContacts: PhoneContact[] = data
        .filter(contact => {
          // Only include contacts with names and phone numbers
          return contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0;
        })
        .map(contact => {
          const phoneNumbers = contact.phoneNumbers!.map(phone => phone.number || '').filter(num => num);
          const primaryPhone = phoneNumbers[0] || '';

          return {
            id: contact.id,
            name: contact.name || 'Unknown',
            phoneNumbers,
            primaryPhone,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

      console.log(`✅ Successfully loaded ${phoneContacts.length} contacts`);
      return phoneContacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert(
        'Error Loading Contacts',
        'Failed to load your contacts. Please try again.',
        [{ text: 'OK' }]
      );
      return [];
    }
  }

  /**
   * Search contacts by name
   * @param query - Search query
   * @param contacts - List of contacts to search
   * @returns PhoneContact[]
   */
  searchContacts(query: string, contacts: PhoneContact[]): PhoneContact[] {
    if (!query.trim()) {
      return contacts;
    }

    const lowerQuery = query.toLowerCase().trim();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.phoneNumbers.some(phone => phone.includes(query))
    );
  }

  /**
   * Format phone number for display
   * @param phoneNumber - Raw phone number
   * @returns Formatted phone number
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      // US format: (555) 123-4567
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      // US format with country code: +1 (555) 123-4567
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if not standard format
    return phoneNumber;
  }
}

export default new ContactsService();
