import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getConversationByName } from '../data/mockConversations';
import { getConsumerConversationByName } from '../data/mockConsumerConversations';
import { useAppContext } from '../context/AppContext';

interface Message {
  id: string;
  type: 'text' | 'image' | 'appointment' | 'quote';
  content?: string;
  sender: 'user' | 'other';
  timestamp: string;
  quoteData?: {
    amount: number;
    description: string;
  };
  appointmentData?: {
    date: string;
    time: string;
    service: string;
  };
  imageUrl?: string;
}

const MessagingScreenDemo: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDarkMode } = useTheme();
  const { userType } = useAppContext();

  // Extract route params
  const params = route.params as any;
  const customerName = params?.userName || params?.customerName || params?.vendorName || 'User';
  const userImage = params?.userImage || 'https://via.placeholder.com/100';
  const serviceDetails = params?.serviceDetails;
  
  // Determine if this is vendor or consumer view
  const isVendorView = userType === 'vendor';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const colors = {
    background: isDarkMode ? '#000000' : '#FFFFFF',
    surface: isDarkMode ? '#1C1C1E' : '#F9FAFB',
    primary: '#2563EB',
    text: isDarkMode ? '#FFFFFF' : '#1F2937',
    secondaryText: isDarkMode ? '#9CA3AF' : '#6B7280',
    border: isDarkMode ? '#38383A' : '#E5E7EB',
    userBubble: '#2563EB',
    otherBubble: isDarkMode ? '#1C1C1E' : '#F3F4F6',
  };

  useEffect(() => {
    loadMessages();
  }, [customerName]);

  const loadMessages = () => {
    console.log('=== LOADING MESSAGES ===');
    console.log('User Name:', customerName);
    console.log('User Type:', userType);
    console.log('Is Vendor View:', isVendorView);
    
    // Try to get conversation from appropriate data source based on userType
    let conversation;
    
    if (isVendorView) {
      // Vendor talks to customers
      conversation = getConversationByName(customerName);
      if (conversation) {
        console.log('✅ Found VENDOR conversation:', conversation.service);
        setMessages(conversation.messages as Message[]);
        return;
      }
    } else {
      // Consumer talks to vendors
      conversation = getConsumerConversationByName(customerName);
      if (conversation) {
        console.log('✅ Found CONSUMER conversation:', conversation.service);
        setMessages(conversation.messages as Message[]);
        return;
      }
    }
    
    // Fallback to default conversation if not found
    console.log('⚠️ No conversation found, using default');
    const service = serviceDetails?.service || 'Home Service';
    const amount = serviceDetails?.amount || 185;

    // Default conversation (VENDOR POV)
    const mockMessages: Message[] = [
      { id: '1', type: 'text', content: `I need help with ${service}. Are you available?`, sender: 'other', timestamp: '2:00 PM' },
      { id: '2', type: 'text', content: `Yes! I saw your request for ${service}. I can help with that!`, sender: 'user', timestamp: '2:05 PM' },
      { id: '3', type: 'text', content: 'Great! Can you provide a quote?', sender: 'other', timestamp: '2:15 PM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '2:20 PM', quoteData: { amount, description: service } },
      { id: '5', type: 'text', content: 'Looks good! When can you start?', sender: 'other', timestamp: '2:25 PM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: '2:30 PM', appointmentData: { date: 'Tomorrow', time: '10:00 AM - 12:00 PM', service } },
    ];

    setMessages(mockMessages);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    // Quote message (Figma design) - VENDOR SENDS (RIGHT SIDE)
    if (item.type === 'quote' && item.quoteData) {
      return (
        <View style={[styles.messageContainer, styles.userMessage]}>
          <View style={[styles.quoteCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.quoteHeader}>
              <Ionicons name="document-text-outline" size={16} color="#2563EB" />
              <Text style={styles.quoteHeaderText}>Quote</Text>
            </View>
            <Text style={[styles.quoteAmount, { color: colors.text }]}>${item.quoteData.amount}</Text>
            <Text style={[styles.quoteDescription, { color: colors.secondaryText }]}>{item.quoteData.description}</Text>
            <TouchableOpacity style={styles.viewInvoiceButton}>
              <Text style={styles.viewInvoiceText}>View Invoice</Text>
            </TouchableOpacity>
            <Text style={[styles.messageTime, { color: colors.secondaryText }]}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    // Appointment message (Figma design) - VENDOR SENDS (RIGHT SIDE)
    if (item.type === 'appointment' && item.appointmentData) {
      return (
        <View style={[styles.messageContainer, styles.userMessage]}>
          <View style={[styles.appointmentCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.appointmentHeader}>
              <Ionicons name="calendar-outline" size={16} color="#2563EB" />
              <Text style={styles.appointmentHeaderText}>Appointment Scheduled</Text>
            </View>
            <Text style={[styles.appointmentDate, { color: colors.text }]}>{item.appointmentData.date}</Text>
            <Text style={styles.appointmentTime}>{item.appointmentData.time}</Text>
            <Text style={[styles.appointmentService, { color: colors.secondaryText }]}>{item.appointmentData.service}</Text>
            <Text style={[styles.messageTime, { color: colors.secondaryText }]}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    // Image message
    if (item.type === 'image' && item.imageUrl) {
      return (
        <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
          <View style={{ maxWidth: '80%' }}>
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
            {item.content && <Text style={[styles.imageCaption, { color: isUser ? '#FFFFFF' : colors.text }]}>{item.content}</Text>}
            <Text style={[styles.messageTime, { color: colors.secondaryText }]}>{item.timestamp}</Text>
          </View>
        </View>
      );
    }

    // Regular text message
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
        <View style={[styles.messageBubble, { backgroundColor: isUser ? colors.userBubble : colors.otherBubble }]}>
          <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : colors.text }]}>{item.content}</Text>
          <Text style={[styles.messageTime, { color: isUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Image source={{ uri: userImage }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{customerName}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.headerStatus, { color: colors.secondaryText }]}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Status Tabs */}
      {messages.length > 0 && (
        <View style={[styles.statusTabs, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          {/* Quoted */}
          {(() => {
            const hasQuote = messages.some(m => m.type === 'quote');
            return (
              <TouchableOpacity style={styles.statusTab}>
                <View style={[styles.statusIcon, { backgroundColor: hasQuote ? '#10B981' : colors.border }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.statusLabel, { color: hasQuote ? colors.text : colors.secondaryText }]}>Quoted</Text>
                {hasQuote && <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />}
              </TouchableOpacity>
            );
          })()}

          {/* Scheduled */}
          {(() => {
            const hasScheduled = messages.some(m => m.type === 'appointment');
            return (
              <TouchableOpacity style={styles.statusTab}>
                <View style={[styles.statusIcon, { backgroundColor: hasScheduled ? colors.primary : colors.border }]}>
                  <View style={styles.statusDot} />
                </View>
                <Text style={[styles.statusLabel, { color: hasScheduled ? colors.text : colors.secondaryText }]}>Scheduled</Text>
                {hasScheduled && <View style={[styles.statusIndicator, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            );
          })()}

          {/* Completed */}
          {(() => {
            // Check if conversation has completed status (could be based on appointment completion)
            const hasCompleted = messages.some(m => m.type === 'appointment' && m.content?.toLowerCase().includes('completed'));
            return (
              <TouchableOpacity style={styles.statusTab}>
                <View style={[styles.statusIcon, { backgroundColor: hasCompleted ? '#10B981' : colors.border }]}>
                  <View style={styles.statusDot} />
                </View>
                <Text style={[styles.statusLabel, { color: hasCompleted ? colors.text : colors.secondaryText }]}>Completed</Text>
                {hasCompleted && <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />}
              </TouchableOpacity>
            );
          })()}
        </View>
      )}

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted={false}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 14,
  },
  headerAction: {
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  quoteCard: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  quoteAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quoteDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  viewInvoiceButton: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewInvoiceText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentCard: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 8,
  },
  appointmentService: {
    fontSize: 14,
    marginBottom: 8,
  },
  messageImage: {
    width: 250,
    height: 180,
    borderRadius: 12,
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  attachButton: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statusTab: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusIndicator: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
});

export default MessagingScreenDemo;
