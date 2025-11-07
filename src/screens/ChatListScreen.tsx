import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { messagingService } from '../services/messagingService';
import { getFormattedConversationsForList } from '../data/mockConversations';
import { getFormattedConsumerConversationsForList } from '../data/mockConsumerConversations';
import { Conversation } from '../types/messaging';
import { useWebSocket } from '../services/websocketService';

type RootStackParamList = {
  ChatList: undefined;
  Messaging: {
    conversationId: string;
    userName: string;
    userImage: string;
    isOnline: boolean;
  };
  [key: string]: any;
};

type ChatListScreenNavigationProp = NavigationProp<RootStackParamList>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const { connect, on, joinConversation, leaveConversation } = useWebSocket();
  const { userProfile, conversations: appConversations, userType } = useAppContext();
  const currentUserId = userProfile?.id;
  const isVendorView = userType === 'vendor';
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const joinedConversationIdsRef = useRef<Set<string>>(new Set());

  // Robust timestamp parser that handles various formats
  const parseTimestamp = (timestamp: string | Date | number): Date => {
    try {
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp === 'number') return new Date(timestamp);
      
      // Try parsing ISO format
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
      
      // Try parsing common date formats
      const formats = [
        'MM/DD/YYYY hh:mm A',
        'YYYY-MM-DD HH:mm:ss',
        'ddd, DD MMM YYYY HH:mm:ss [GMT]',
        'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (zzz)'
      ];
      
      for (const format of formats) {
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) return parsed;
      }
      
      // If all else fails, return current date
      console.warn(`Could not parse timestamp: ${timestamp}`);
      return new Date();
    } catch (error) {
      console.error('Error parsing timestamp:', error);
      return new Date();
    }
  };

  const normalizeConversation = useCallback((conversation: any) => {
    // For mock data, we might have direct access to customer info
    const customerName = conversation.customerName || 
                        conversation.metadata?.customerName || 
                        conversation.serviceDetails?.customerName;
    
    const customerFirstName = conversation.customerFirstName || 
                            conversation.metadata?.customerFirstName || 
                            conversation.serviceDetails?.customerFirstName;
    
    const customerLastName = conversation.customerLastName || 
                           conversation.metadata?.customerLastName || 
                           conversation.serviceDetails?.customerLastName;
    
    const customerAvatar = conversation.customerAvatar || 
                          conversation.metadata?.customerAvatar || 
                          conversation.serviceDetails?.customerAvatar || 
                          'https://via.placeholder.com/50';
    
    const service = conversation.service || 
                   conversation.metadata?.service || 
                   conversation.serviceDetails?.service ||
                   '';
    
    const status = conversation.status || 
                  conversation.metadata?.status || 
                  conversation.serviceDetails?.status ||
                  '';

    // Calculate time ago from lastMessage createdAt
    const getTimeAgo = (timestamp: string | Date | number) => {
      try {
        const now = Date.now();
        const messageTime = parseTimestamp(timestamp).getTime();
        const diffSeconds = Math.floor((now - messageTime) / 1000);
        
        if (diffSeconds < 0) return 'Just now'; // Future date
        if (diffSeconds < 60) return 'Just now';
        
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        
        // For older dates, return formatted date
        return parseTimestamp(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: diffDays > 365 ? 'numeric' : undefined
        });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
      }
    };

    // Determine the display name
    let displayName = 'Conversation';
    if (customerName) {
      displayName = customerName;
    } else if (customerFirstName || customerLastName) {
      displayName = `${customerFirstName || ''} ${customerLastName || ''}`.trim();
    } else if (conversation.participants?.length > 0) {
      // Fallback to participant names if no customer name is available
      const otherParticipants = conversation.participants.filter(
        (p: any) => p.userId !== currentUserId
      );
      if (otherParticipants.length > 0) {
        displayName = otherParticipants
          .map((p: any) => `${p.firstName || ''} ${p.lastName || ''}`.trim())
          .filter(Boolean)
          .join(', ');
      }
    }

    return {
      id: conversation.id,
      userId: conversation.customerId || conversation.id,
      userName: displayName,
      userImage: customerAvatar,
      lastMessage: conversation.lastMessage?.content || 
                  conversation.messages?.[0]?.content || 
                  'Start a conversation',
      time: conversation.lastMessage?.createdAt || conversation.updatedAt
        ? getTimeAgo(conversation.lastMessage?.createdAt || conversation.updatedAt)
        : 'Just now',
      unreadCount: conversation.unreadCount || 0,
      isOnline: false,
      lastActive: '',
      service: service,
      status: status,
    };
  }, [currentUserId]);

  const loadConversations = useCallback(
    async (showLoading = true) => {
      // Skip API calls if no user profile (prevents rate limiting and infinite loops)
      if (!currentUserId) {
        console.log('No user ID, using centralized mock conversations');
        console.log('User Type:', userType, 'Is Vendor View:', isVendorView);
        
        // Use AppContext conversations if available, otherwise use appropriate mock data based on userType
        let mockConversations;
        try {
          mockConversations = isVendorView 
            ? getFormattedConversationsForList() 
            : getFormattedConsumerConversationsForList();
          
          const conversationsToUse = appConversations?.length ? appConversations : mockConversations;
          setConversations(conversationsToUse);
        } catch (error) {
          console.error('Error loading mock conversations:', error);
          setConversations([]);
        } finally {
          if (showLoading) {
            setIsLoading(false);
          }
        }
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await messagingService.listConversations();
        if (response?.success && Array.isArray(response.data?.conversations)) {
          // Filter out any invalid conversations
          const validConversations = response.data.conversations.filter(
            conv => conv?.id && (conv.lastMessage || conv.participants?.length > 0)
          );
          
          setConversations(validConversations);
          
          // Join conversations for real-time updates
          validConversations.forEach((conversation) => {
            if (conversation.id && !joinedConversationIdsRef.current.has(conversation.id)) {
              try {
                joinConversation(conversation.id);
                joinedConversationIdsRef.current.add(conversation.id);
              } catch (error) {
                console.error(`Error joining conversation ${conversation.id}:`, error);
              }
            }
          });
        } else {
          console.warn('Invalid response format from listConversations:', response);
          setConversations([]);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Only show error to user if we don't have any cached conversations
        if (conversations.length === 0) {
          // You might want to show an error message to the user here
          console.warn('Using empty conversations list due to error');
          setConversations([]);
        }
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [joinConversation, currentUserId, userType, isVendorView, appConversations, conversations.length]
  );

  const refresh = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple refresh calls
    
    try {
      setIsRefreshing(true);
      await loadConversations(false);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      // Consider showing an error message to the user
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadConversations]);

  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // Connect to WebSocket
        await connect();
        
        // Load conversations
        if (!currentUserId) {
          console.log('No user ID, loading mock conversations');
          if (isMounted) {
            await loadConversations(true);
          }
          return;
        }
        
        // Load real data if we have a user ID
        if (isMounted) {
          setIsLoading(true);
          try {
            const response = await messagingService.listConversations();
            if (isMounted && response?.success && Array.isArray(response.data?.conversations)) {
              setConversations(response.data.conversations);
              
              // Join conversations for real-time updates
              response.data.conversations.forEach(conversation => {
                if (conversation.id && !joinedConversationIdsRef.current.has(conversation.id)) {
                  joinConversation(conversation.id);
                  joinedConversationIdsRef.current.add(conversation.id);
                }
              });
            }
          } catch (error) {
            console.error('Error loading conversations:', error);
            if (isMounted) {
              setConversations([]);
            }
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
      // Cleanup WebSocket connections
      joinedConversationIdsRef.current.forEach(id => {
        try {
          leaveConversation(id);
        } catch (error) {
          console.error(`Error leaving conversation ${id}:`, error);
        }
      });
      joinedConversationIdsRef.current.clear();
    };

    const unsubscribeMessage = on('message:new', (message) => {
      if (!message?.conversationId) {
        return;
      }
      let shouldJoinConversation = false;
      setConversations((prev) => {
        const next = [...prev];
        const conversationId = message.conversationId as string;
        const existingIndex = next.findIndex((conversation) => conversation.id === conversationId);

        const baseLastMessage: NonNullable<Conversation['lastMessage']> = {
          id: message.id,
          conversationId,
          senderId: message.senderId,
          messageType: message.messageType,
          content: message.content || '',
          metadata: message.metadata || {},
          attachments: message.attachments,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          deletedAt: message.deletedAt,
          sender: message.sender,
        };

        if (existingIndex !== -1) {
          const existing = next[existingIndex];
          const isFromOther = message.senderId && currentUserId
            ? message.senderId !== currentUserId
            : true;

          next[existingIndex] = {
            ...existing,
            lastMessage: baseLastMessage,
            unreadCount: isFromOther ? (existing.unreadCount || 0) + 1 : existing.unreadCount || 0,
            updatedAt: message.createdAt || existing.updatedAt,
          };
        } else {
          shouldJoinConversation = true;
          const now = message.createdAt || new Date().toISOString();
          const newConversation: Conversation = {
            id: conversationId,
            title: undefined,
            conversationType: 'consumer_vendor',
            createdAt: now,
            updatedAt: now,
            metadata: {},
            participants: [],
            lastMessage: baseLastMessage,
            unreadCount:
              message.senderId && currentUserId && message.senderId !== currentUserId
                ? 1
                : 0,
          };
          next.unshift(newConversation);
        }

        next.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || a.updatedAt || a.createdAt).getTime();
          const bTime = new Date(b.lastMessage?.createdAt || b.updatedAt || b.createdAt).getTime();
          return bTime - aTime;
        });

        return next;
      });

      if (shouldJoinConversation && !joinedConversationIdsRef.current.has(message.conversationId)) {
        joinConversation(message.conversationId);
        joinedConversationIdsRef.current.add(message.conversationId);
      }
    });

    const unsubscribeCreated = on('conversation:created', async (payload: Conversation) => {
      if (!payload?.id) {
        return;
      }

      let shouldJoinConversation = false;
      setConversations((prev) => {
        const exists = prev.some((item) => item.id === payload.id);
        if (exists) {
          return prev;
        }
        shouldJoinConversation = true;
        return prev;
      });

      if (!shouldJoinConversation) {
        return;
      }

      try {
        const conversationResponse = await messagingService.getConversation(payload.id);
        if (conversationResponse.success && conversationResponse.data) {
          setConversations((prev) => [conversationResponse.data!, ...prev]);
        } else {
          setConversations((prev) => [payload, ...prev]);
        }
      } catch (serviceError) {
        console.error('Failed to hydrate conversation:', serviceError);
        setConversations((prev) => [payload, ...prev]);
      }

      if (!joinedConversationIdsRef.current.has(payload.id)) {
        joinConversation(payload.id);
        joinedConversationIdsRef.current.add(payload.id);
      }
    });

    const unsubscribeRead = on('conversation:read', (payload) => {
      if (!payload?.conversationId) {
        return;
      }

      if (payload.userId === currentUserId) {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === payload.conversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      }
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeCreated?.();
      unsubscribeRead?.();
      joinedConversationIdsRef.current.forEach((id) => leaveConversation(id));
      joinedConversationIdsRef.current.clear();
    };
  }, [on, joinConversation, leaveConversation]); // Removed currentUserId to prevent infinite loop

  const normalizedConversations = conversations
    .map(normalizeConversation)
    .filter((conversation) =>
      conversation.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get status badge color and text based on Figma design
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { text: 'In Progress', color: '#FF9500' }; // Orange
      case 'scheduled':
      case 'confirmed':
        return { text: 'Scheduled', color: '#007AFF' }; // Blue
      case 'completed':
        return { text: 'Completed', color: '#34C759' }; // Green
      case 'quoted':
        return { text: 'Quoted', color: '#5856D6' }; // Purple
      default:
        return null;
    }
  };

  // Render each conversation item with Figma design
  const renderConversation = ({ item }: { item: ReturnType<typeof normalizeConversation> }) => {
    const statusBadge = getStatusBadge(item.status);
    
    return (
      <TouchableOpacity 
        style={[styles.conversationItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        onPress={() => {
          navigation.navigate('Messaging', { 
            conversationId: item.id,
            userName: item.userName,
            userImage: item.userImage,
            isOnline: item.isOnline,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: item.userImage }} 
            style={styles.avatar}
            defaultSource={{ uri: 'https://via.placeholder.com/50' }}
          />
          {item.isOnline && <View style={styles.onlineBadge} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text 
              style={[
                styles.userName,
                { color: colors.text },
                item.unreadCount > 0 && styles.unreadUserName
              ]}
              numberOfLines={1}
            >
              {item.userName}
            </Text>
            <Text 
              style={[
                styles.time,
                { color: '#8E8E93' },
                item.unreadCount > 0 && { color: '#007AFF', fontWeight: '600' }
              ]}
            >
              {item.time}
            </Text>
          </View>
          
          {/* Service type in gray */}
          {item.service && (
            <Text style={[styles.serviceText, { color: '#8E8E93' }]} numberOfLines={1}>
              {item.service}
            </Text>
          )}
          
          <View style={styles.conversationFooter}>
            <Text 
              style={[
                styles.lastMessage,
                { color: colors.secondaryText },
                item.unreadCount > 0 && { color: colors.text, fontWeight: '500' }
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          </View>
          
          {/* Status badge and unread count on same line */}
          <View style={styles.badgeRow}>
            {statusBadge && (
              <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                <Text style={styles.statusBadgeText}>{statusBadge.text}</Text>
              </View>
            )}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={20} color={colors.secondaryText} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.primaryText }]}
          placeholder="Search conversations..."
          placeholderTextColor={colors.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* New Message Button */}
      <TouchableOpacity 
        style={[styles.newMessageButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          // Navigate to new message screen
          // navigation.navigate('NewMessage');
        }}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Text style={styles.newMessageButtonText}>New Message</Text>
      </TouchableOpacity>
      
      {/* Conversations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>Loading conversations...</Text>
        </View>
      ) : normalizedConversations.length > 0 ? (
        <FlatList
          data={normalizedConversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.secondaryText} />
          <Text style={[styles.emptyStateTitle, { color: colors.primaryText }]}>No conversations found</Text>
          <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
            {searchQuery 
              ? 'No conversations match your search.' 
              : 'Start a new conversation to get started!'
            }
          </Text>
          <TouchableOpacity 
            style={styles.startChatButton}
            onPress={() => {
              // Navigate to new message screen
              // navigation.navigate('NewMessage');
            }}
          >
            <Text style={styles.startChatButtonText}>Start a Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#1F2937',
  },
  newMessageButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#0D6EFD',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMessageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startChatButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0D6EFD',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginBottom: 2,
  },
  unreadUserName: {
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 8,
  },
  unreadTime: {
    color: '#0D6EFD',
    fontWeight: '600',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
    marginBottom: 6,
  },
  unreadMessage: {
    color: '#1F2937',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lastSeenText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
});

export default ChatListScreen;
