import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../config/api';
import {
  Conversation,
  ConversationListResponse,
  CreateConversationPayload,
  EnsureDirectConversationPayload,
  MarkConversationReadPayload,
  Message,
  MessageListResponse,
  SendMessagePayload,
} from '../types/messaging';

type BackendCall<T> = () => Promise<ApiResponse<T>>;

const USE_MOCK_MESSAGING = process.env.EXPO_PUBLIC_USE_MOCK_MESSAGING === 'true';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const conversationCache = new Map<string, { data: Conversation; expiry: number }>();
const messageCache = new Map<string, { data: Message[]; expiry: number; lastFetch: number }>();

// Cache helper functions
function getCachedConversation(id: string): Conversation | null {
  const cached = conversationCache.get(id);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  conversationCache.delete(id);
  return null;
}

function setCachedConversation(id: string, data: Conversation) {
  conversationCache.set(id, {
    data,
    expiry: Date.now() + CACHE_TTL
  });
}

function getCachedMessages(conversationId: string): Message[] | null {
  const cached = messageCache.get(conversationId);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  messageCache.delete(conversationId);
  return null;
}

function setCachedMessages(conversationId: string, messages: Message[]) {
  messageCache.set(conversationId, {
    data: messages,
    expiry: Date.now() + CACHE_TTL,
    lastFetch: Date.now()
  });
}

function addMessageToCache(conversationId: string, message: Message) {
  const cached = messageCache.get(conversationId);
  if (cached) {
    // Add new message to beginning of array (newest first)
    cached.data.unshift(message);
    cached.expiry = Date.now() + CACHE_TTL; // Extend cache
  }
}

function clearCache(conversationId?: string) {
  if (conversationId) {
    conversationCache.delete(conversationId);
    messageCache.delete(conversationId);
  } else {
    conversationCache.clear();
    messageCache.clear();
  }
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'mock-conversation-1',
    title: 'Mock Vendor',
    conversationType: 'consumer_vendor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {},
    participants: [
      {
        userId: 'consumer-123',
        role: 'consumer',
        joinedAt: new Date().toISOString(),
        firstName: 'Consumer',
        lastName: 'User',
        email: 'consumer@example.com',
      },
      {
        userId: 'vendor-456',
        role: 'vendor',
        joinedAt: new Date().toISOString(),
        firstName: 'Vendor',
        lastName: 'Pro',
        email: 'vendor@example.com',
      },
    ],
    lastMessage: {
      id: 'mock-message-1',
      conversationId: 'mock-conversation-1',
      senderId: 'vendor-456',
      messageType: 'text',
      content: 'Welcome to FixRx messaging!',
      createdAt: new Date().toISOString(),
      metadata: {},
    },
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'mock-message-1',
    conversationId: 'mock-conversation-1',
    senderId: 'vendor-456',
    messageType: 'text',
    content: 'Welcome to FixRx messaging!',
    metadata: {},
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-message-2',
    conversationId: 'mock-conversation-1',
    senderId: 'consumer-123',
    messageType: 'text',
    content: 'Thanks! Looking forward to working with you.',
    metadata: {},
    createdAt: new Date().toISOString(),
  },
];

class MessagingService {
  private shouldFallbackToMock(error?: string): boolean {
    if (USE_MOCK_MESSAGING) {
      return true;
    }

    if (!error) {
      return false;
    }

    const normalized = error.toLowerCase();
    return (
      normalized.includes('network') ||
      normalized.includes('timeout') ||
      normalized.includes('fetch') ||
      normalized.includes('offline') ||
      normalized === ERROR_MESSAGES.NETWORK_ERROR.toLowerCase() ||
      normalized === ERROR_MESSAGES.TIMEOUT_ERROR.toLowerCase()
    );
  }

  private buildMockResponse<T>(mockData: T, reason: string): ApiResponse<T> {
    return {
      success: true,
      data: mockData,
      message: `Using mock messaging data (${reason})`,
    };
  }

  private async useBackendOrMock<T>(backendCall: BackendCall<T>, mockData: T): Promise<ApiResponse<T>> {
    if (USE_MOCK_MESSAGING) {
      return this.buildMockResponse(mockData, 'mock mode enabled');
    }

    try {
      const response = await backendCall();
      if (response.success || !this.shouldFallbackToMock(response.error)) {
        return response;
      }

      return this.buildMockResponse(mockData, response.error || 'backend unavailable');
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'unknown error';
      if (this.shouldFallbackToMock(message)) {
        return this.buildMockResponse(mockData, message);
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  async listConversations(): Promise<ApiResponse<ConversationListResponse>> {
    const backendCall = () =>
      apiClient.get<ConversationListResponse>(API_ENDPOINTS.MESSAGING.CONVERSATIONS);

    const mockData: ConversationListResponse = {
      conversations: MOCK_CONVERSATIONS,
    };

    return this.useBackendOrMock(backendCall, mockData);
  }

  async getConversation(conversationId: string, forceRefresh = false): Promise<ApiResponse<Conversation>> {
    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedConversation(conversationId);
      if (cached) {
        return { success: true, data: cached };
      }
    }
    
    const backendCall = () =>
      apiClient.get<Conversation>(`${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}`);

    const mockConversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId) || MOCK_CONVERSATIONS[0];
    const result = await this.useBackendOrMock(backendCall, mockConversation);
    
    // Cache successful result
    if (result.success && result.data) {
      setCachedConversation(conversationId, result.data);
    }
    
    return result;
  }

  async getMessages(
    conversationId: string,
    params: { limit?: number; before?: string } = {}
  ): Promise<ApiResponse<MessageListResponse>> {
    // Check cache first (only if no pagination params)
    if (!params.before) {
      const cached = getCachedMessages(conversationId);
      if (cached) {
        return { success: true, data: { messages: cached } };
      }
    }
    
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.before) searchParams.set('before', params.before);

    const backendCall = () =>
      apiClient.get<MessageListResponse>(
        `${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/messages${
          searchParams.toString() ? `?${searchParams}` : ''
        }`
      );

    const mockData: MessageListResponse = {
      messages: MOCK_MESSAGES.filter((m) => m.conversationId === conversationId),
    };

    const result = await this.useBackendOrMock(backendCall, mockData);
    
    // Cache successful result (only if no pagination)
    if (result.success && result.data && !params.before) {
      setCachedMessages(conversationId, result.data.messages);
    }
    
    return result;
  }

  async sendMessage(
    conversationId: string,
    payload: SendMessagePayload
  ): Promise<ApiResponse<{ message: Message }>> {
    const backendCall = () =>
      apiClient.post<{ message: Message }>(
        `${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/messages`,
        payload
      );

    const mockMessage: Message = {
      id: `mock-message-${Date.now()}`,
      conversationId,
      senderId: 'consumer-123',
      messageType: payload.messageType || 'text',
      content: payload.content || null,
      metadata: payload.metadata,
      attachments: payload.attachments,
      createdAt: new Date().toISOString(),
    };

    const result = await this.useBackendOrMock(backendCall, { message: mockMessage });
    
    // Update cache with new message
    if (result.success && result.data) {
      addMessageToCache(conversationId, result.data.message);
    }
    
    return result;
  }

  async createConversation(
    payload: CreateConversationPayload
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    const backendCall = () =>
      apiClient.post<{ conversation: Conversation }>(
        API_ENDPOINTS.MESSAGING.CONVERSATIONS,
        payload
      );

    const mockConversation: Conversation = {
      ...MOCK_CONVERSATIONS[0],
      id: `mock-conversation-${Date.now()}`,
      participants: MOCK_CONVERSATIONS[0].participants,
      lastMessage: undefined,
      unreadCount: 0,
    };

    return this.useBackendOrMock(backendCall, { conversation: mockConversation });
  }

  async ensureDirectConversation(
    payload: EnsureDirectConversationPayload
  ): Promise<ApiResponse<{ conversation: Conversation }>> {
    const backendCall = () =>
      apiClient.post<{ conversation: Conversation }>(
        `${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/ensure-direct`,
        payload
      );

    const mockConversation = MOCK_CONVERSATIONS[0];
    return this.useBackendOrMock(backendCall, { conversation: mockConversation });
  }

  async markConversationRead(
    conversationId: string,
    payload: MarkConversationReadPayload
  ): Promise<ApiResponse<{ participant: any }>> {
    const backendCall = () =>
      apiClient.post<{ participant: any }>(
        `${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/read`,
        payload
      );

    return this.useBackendOrMock(backendCall, {
      participant: {
        userId: 'consumer-123',
        lastReadMessageId: payload.lastMessageId,
        lastReadAt: new Date().toISOString(),
      },
    });
  }

  async setTyping(conversationId: string, isTyping: boolean): Promise<ApiResponse> {
    const backendCall = () =>
      apiClient.post(
        `${API_ENDPOINTS.MESSAGING.CONVERSATIONS}/${conversationId}/typing`,
        { isTyping }
      );

    return this.useBackendOrMock(backendCall, {
      success: true,
      message: 'Typing status updated (mock)',
    } as ApiResponse);
  }
}

export const messagingService = new MessagingService();
export default messagingService;

// Export cache utilities
export { clearCache, addMessageToCache };
