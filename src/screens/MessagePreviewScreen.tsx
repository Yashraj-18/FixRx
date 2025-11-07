import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types/navigation';
import SMSService from '../services/SMSService';

type MessagePreviewScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MessagePreview'>;
type MessagePreviewScreenRouteProp = RouteProp<RootStackParamList, 'MessagePreview'>;

const MessagePreviewScreen: React.FC = () => {
  const navigation = useNavigation<MessagePreviewScreenNavigationProp>();
  const route = useRoute<MessagePreviewScreenRouteProp>();
  const { colors, isDarkMode } = useTheme();
  const { userProfile } = useAppContext();
  
  // Safely extract route params with fallbacks
  const selectedContacts = route.params?.selectedContacts || [];
  const inviteType = route.params?.inviteType || 'contractor';
  
  const [personalNote, setPersonalNote] = useState('');
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includeReferralCode, setIncludeReferralCode] = useState(true);
  const [sendNow, setSendNow] = useState(true);
  const [showPersonalNote, setShowPersonalNote] = useState(false);
  const [showContactList, setShowContactList] = useState(false);

  // Generate message based on type
  const generateMessage = () => {
    const senderName = userProfile?.firstName || 'A friend';
    const userName = userProfile?.firstName || 'USER';
    const referralCode = userProfile?.userType === 'vendor' 
      ? `${userName.toUpperCase()}${new Date().getFullYear()}`
      : `${userName.toUpperCase()}${new Date().getFullYear()}`;
    
    let message = '';
    
    // Use SMSService methods for consistent messaging
    if (inviteType === 'contractor') {
      message = `Hi! ${senderName} here! I think you'd be a great fit for FixRx - a platform connecting service professionals with clients.\n\n🚀 Grow your business:\n• Get more clients\n• Manage bookings easily\n• Secure payments\n• Build your reputation`;
    } else if (inviteType === 'client') {
      message = `Hi! This is ${senderName}. I'm now on FixRx - a platform that makes booking and managing services easier for both of us!\n\n💼 Benefits for you:\n• Easy online booking\n• Secure payments\n• Track service history\n• Direct messaging`;
    } else {
      message = `Hey! ${senderName} here! I've been using FixRx to find trusted contractors and wanted to share it with you.\n\n✨ Why you'll love it:\n• Find reliable service pros\n• Get recommendations from friends\n• Easy booking & secure payments`;
    }
    
    if (personalNote && personalNote.trim()) {
      message = `${personalNote.trim()}\n\n${message}`;
    }
    
    if (includeReferralCode) {
      message += `\n\nUse code: ${referralCode}\n\nJoin now: https://fixrx.app/join`;
    }
    
    return message;
  };

  const currentMessage = generateMessage();
  const characterCount = currentMessage.length;
  const messageLimit = 160;
  const messagesNeeded = Math.ceil(characterCount / messageLimit);

  const handleSendInvitations = async () => {
    try {
      console.log('Send button pressed');
      console.log('Selected contacts:', selectedContacts?.length || 0);
      console.log('Invite type:', inviteType);
      
      const contactCount = selectedContacts?.length || 0;
      
      if (contactCount === 0) {
        Alert.alert(
          'No Contacts Selected',
          'Please select at least one contact to send invitations.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Check if SMS is available
      const smsAvailable = await SMSService.isAvailable();
      if (!smsAvailable) {
        Alert.alert(
          'SMS Not Available',
          'SMS messaging is not available on this device.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Prepare SMS messages
      const message = currentMessage;
      const messages = selectedContacts.map(contact => ({
        phoneNumber: SMSService.cleanPhoneNumber(contact.phone),
        message: message,
        recipientName: contact.name,
      }));

      // Send SMS
      const result = await SMSService.sendBulkSMS(messages);
      
      if (result.sent > 0) {
        navigation.navigate('InvitationSuccess', {
          invitationCount: result.sent,
          inviteType: inviteType
        });
      } else {
        Alert.alert(
          'Failed to Send',
          'Failed to send invitations. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      Alert.alert(
        'Error',
        'Failed to send invitations. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
          Contact Selection
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            Review {inviteType === 'contractor' ? 'contractor' : inviteType === 'client' ? 'client' : 'friend'} invitations
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Customize your {inviteType === 'contractor' ? 'contractor' : inviteType === 'client' ? 'client' : 'friend'} invitation message
          </Text>
        </View>

        {/* Message Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewHeader}>
            <Ionicons name="checkbox-outline" size={20} color={colors.secondaryText} />
            <Text style={[styles.previewTitle, { color: colors.primaryText }]}>
              Message Preview
            </Text>
          </View>

          {/* Phone Preview */}
          <View style={[styles.phoneContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.phoneScreen}>
              <View style={styles.phoneHeader}>
                <Text style={styles.phoneTime}>9:41</Text>
                <View style={styles.phoneIcons}>
                  <Ionicons name="cellular" size={12} color="#000" />
                  <Ionicons name="wifi" size={12} color="#000" />
                  <Ionicons name="battery-full" size={12} color="#000" />
                </View>
              </View>

              <View style={styles.messageHeader}>
                <View style={styles.senderInfo}>
                  <View style={[styles.senderAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.senderInitial}>
                      {(userProfile?.firstName || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.senderName}>
                      {userProfile?.firstName || 'You'}
                    </Text>
                    <Text style={styles.messageType}>Text Message</Text>
                  </View>
                </View>
              </View>

              <View style={styles.messageContainer}>
                <View style={[styles.messageBubble, { backgroundColor: colors.primary }]}>
                  <Text style={styles.messageText}>{currentMessage}</Text>
                </View>
                <Text style={styles.deliveredText}>Delivered</Text>
              </View>
            </View>
          </View>

          {/* Character Count */}
          <View style={styles.characterCount}>
            <Text style={[styles.countText, { color: characterCount > messageLimit ? '#EF4444' : colors.secondaryText }]}>
              {characterCount}/{messageLimit} characters
            </Text>
            {selectedContacts && selectedContacts.length > 0 && (
              <Text style={[styles.invitationCountText, { color: colors.primary }]}>
                Sending to {selectedContacts.length} {selectedContacts.length === 1 ? 'contact' : 'contacts'}
              </Text>
            )}
          </View>
        </View>

        {/* Customization Options */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Customization Options
          </Text>

          <TouchableOpacity 
            style={[styles.optionRow, { borderBottomColor: colors.border }]}
            onPress={() => setShowPersonalNote(!showPersonalNote)}
          >
            <Ionicons 
              name={showPersonalNote ? "remove-circle-outline" : "add-circle-outline"} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.optionText, { color: colors.primary }]}>
              Add personal note
            </Text>
            <Ionicons 
              name={showPersonalNote ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.secondaryText} 
            />
          </TouchableOpacity>

          {showPersonalNote && (
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[styles.noteInput, { 
                  color: colors.primaryText,
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border
                }]}
                placeholder="Add a personal message..."
                placeholderTextColor={colors.secondaryText}
                value={personalNote}
                onChangeText={setPersonalNote}
                multiline
                maxLength={100}
              />
              <Text style={[styles.noteCount, { color: colors.secondaryText }]}>
                {personalNote.length}/100
              </Text>
            </View>
          )}
        </View>

        {/* Message Settings */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Message Settings
          </Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.primaryText }]}>
                Include my profile info
              </Text>
              <Text style={[styles.settingDescription, { color: colors.secondaryText }]}>
                Adds star rating, years experience, service types
              </Text>
            </View>
            <Switch
              value={includeProfile}
              onValueChange={setIncludeProfile}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={includeProfile ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.primaryText }]}>
                Include referral code
              </Text>
              <Text style={[styles.settingDescription, { color: colors.secondaryText }]}>
                Code: {userProfile?.userType === 'vendor' 
                  ? `${(userProfile?.firstName || 'USER').toUpperCase()}${new Date().getFullYear()}`
                  : `${(userProfile?.firstName || 'USER').toUpperCase()}${new Date().getFullYear()}`}
              </Text>
            </View>
            <Switch
              value={includeReferralCode}
              onValueChange={setIncludeReferralCode}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={includeReferralCode ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Recipients */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.recipientsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
              Sending to: {selectedContacts?.length || 0} contact{selectedContacts?.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => setShowContactList(!showContactList)}>
              <Text style={[styles.showListButton, { color: colors.primary }]}>
                {showContactList ? 'Hide list' : 'Show list'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showContactList && selectedContacts && selectedContacts.length > 0 && (
            <View style={styles.contactListContainer}>
              {selectedContacts.map((contact, index) => (
                <View key={contact.id || index} style={[styles.contactListItem, { borderBottomColor: colors.border }]}>
                  <View style={[styles.contactListAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.contactListInitial, { color: colors.primary }]}>
                      {contact.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                  <View style={styles.contactListInfo}>
                    <Text style={[styles.contactListName, { color: colors.primaryText }]}>
                      {contact.name || 'Unknown'}
                    </Text>
                    <Text style={[styles.contactListPhone, { color: colors.secondaryText }]}>
                      {contact.phone || 'No phone'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Delivery Options */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Delivery Options
          </Text>
          
          <Text style={[styles.deliveryLabel, { color: colors.secondaryText }]}>
            Send timing
          </Text>
          
          <TouchableOpacity 
            style={[styles.radioOption, { borderColor: sendNow ? colors.primary : colors.border }]}
            onPress={() => setSendNow(true)}
          >
            <View style={[styles.radioCircle, { borderColor: sendNow ? colors.primary : colors.border }]}>
              {sendNow && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.radioText, { color: colors.primaryText }]}>Send now</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.radioOption, { borderColor: !sendNow ? colors.primary : colors.border }]}
            onPress={() => setSendNow(false)}
          >
            <View style={[styles.radioCircle, { borderColor: !sendNow ? colors.primary : colors.border }]}>
              {!sendNow && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.radioText, { color: colors.primaryText }]}>Schedule for later</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Send Button */}
      <TouchableOpacity 
        style={[styles.sendButton, { backgroundColor: colors.primary }]}
        onPress={handleSendInvitations}
        activeOpacity={0.8}
      >
        <Ionicons name="send" size={20} color="#FFFFFF" />
        <Text style={styles.sendButtonText}>
          Send {selectedContacts?.length || 0} invitation{selectedContacts?.length !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
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
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneContainer: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  phoneScreen: {
    width: 280,
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  phoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  phoneTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  phoneIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  messageHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  messageType: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageContainer: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  deliveredText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  characterCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  countText: {
    fontSize: 14,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
  },
  invitationCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  noteInputContainer: {
    marginTop: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  noteCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  recipientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showListButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 16,
  },
  sendButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactListContainer: {
    marginTop: 12,
  },
  contactListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactListAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactListInitial: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactListInfo: {
    flex: 1,
  },
  contactListName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactListPhone: {
    fontSize: 13,
  },
});

export default MessagePreviewScreen;
