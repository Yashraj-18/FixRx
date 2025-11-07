import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserType } from '../types/navigation';
import { authService } from '../services/authService';
import deepLinkHandler, { DeepLinkParams } from '../utils/deepLinkHandler';
import { resetTo } from '../navigation/navigationRef';
import { Conversation } from '../types/messaging';

interface AppContextType {
  userEmail: string;
  setUserEmail: (email: string) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  userType: UserType;
  setUserType: (type: UserType) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  selectedContacts: any[];
  setSelectedContacts: (contacts: any[]) => void;
  invitationType: 'contractors' | 'friends' | null;
  setInvitationType: (type: 'contractors' | 'friends' | null) => void;
  hasContactedContractor: boolean;
  setHasContactedContractor: (value: boolean) => void;
  notificationPermissionGranted: boolean;
  setNotificationPermissionGranted: (value: boolean) => void;
  selectedRequestId: string;
  setSelectedRequestId: (id: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isAuthLoading: boolean;
  authenticateUser: (
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      userType?: string | null;
      phone?: string;
      profileImage?: string;
      avatar?: string;
      metroArea?: string;
    },
    options?: { isNewUser?: boolean }
  ) => void;
  conversations: Conversation[];
  serviceRequests: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userType, setUserType] = useState<UserType>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [invitationType, setInvitationType] = useState<'contractors' | 'friends' | null>(null);
  const [hasContactedContractor, setHasContactedContractor] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Mock data for vendor dashboard - matching service requests
  const [conversations] = useState<Conversation[]>(() => {
    const now = Date.now();

    return [
      {
        id: 'conv_sarah_johnson',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Sarah Johnson',
            service: 'Kitchen Sink Repair',
            date: 'Today',
            time: '2:00 PM',
            status: 'completed',
            amount: 175,
            customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_sarah',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_sarah_1',
          conversationId: 'conv_sarah_johnson',
          senderId: 'consumer_sarah',
          messageType: 'text',
          content: 'All fixed! Your kitchen sink is working perfectly now.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_mike_rodriguez',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Mike Rodriguez',
            service: 'Toilet Repair',
            date: 'Today',
            time: '3:00 PM',
            status: 'confirmed',
            amount: 150,
            customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_mike',
            firstName: 'Mike',
            lastName: 'Rodriguez',
            email: 'mike@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_mike_1',
          conversationId: 'conv_mike_rodriguez',
          senderId: 'consumer_mike',
          messageType: 'text',
          content: 'Perfect! Can you come today?',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 1,
      },
      {
        id: 'conv_lisa_martinez',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Lisa Martinez',
            service: 'Water Heater Maintenance',
            date: 'Today',
            time: '10:00 AM',
            status: 'completed',
            amount: 200,
            customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_lisa',
            firstName: 'Lisa',
            lastName: 'Martinez',
            email: 'lisa@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_lisa_1',
          conversationId: 'conv_lisa_martinez',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'Maintenance completed! Your water heater is in great condition.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 15 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_john_smith',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'John Smith',
            service: 'Bathroom Faucet Installation',
            date: 'Yesterday',
            time: '11:00 AM',
            status: 'completed',
            amount: 125,
            customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_john',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_john_1',
          conversationId: 'conv_john_smith',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'Installation complete! Your new bathroom faucet looks great.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_emily_chen',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Emily Chen',
            service: 'Garbage Disposal Installation',
            date: 'Saturday',
            time: '9:00 AM',
            status: 'confirmed',
            amount: 180,
            customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_emily',
            firstName: 'Emily',
            lastName: 'Chen',
            email: 'emily@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_emily_1',
          conversationId: 'conv_emily_chen',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: "Perfect! I'll schedule you for Saturday.",
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_david_park',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'David Park',
            service: 'Shower Head Replacement',
            date: 'Next week',
            time: 'TBD',
            status: 'quoted',
            amount: 95,
            customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_david',
            firstName: 'David',
            lastName: 'Park',
            email: 'david@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_david_1',
          conversationId: 'conv_david_park',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'I can replace your shower head with a high-pressure model for $95. Would next week work?',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_jessica_martinez',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Jessica Martinez',
            service: 'Pipe Leak Repair',
            date: 'Today',
            time: '4:00 PM',
            status: 'in_progress',
            amount: 220,
            customerAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_jessica',
            firstName: 'Jessica',
            lastName: 'Martinez',
            email: 'jessica@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_jessica_1',
          conversationId: 'conv_jessica_martinez',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'On my way! I\'ll be there in 20 minutes to fix that pipe leak.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 10 * 60 * 1000).toISOString(),
        },
        unreadCount: 2,
      },
      {
        id: 'conv_alex_thompson',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Alex Thompson',
            service: 'Bathtub Drain Unclogging',
            date: 'This week',
            time: 'TBD',
            status: 'quoted',
            amount: 110,
            customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_alex',
            firstName: 'Alex',
            lastName: 'Thompson',
            email: 'alex@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_alex_1',
          conversationId: 'conv_alex_thompson',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'I can unclog your bathtub drain for $110. Includes snake service. When works for you?',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 1,
      },
      {
        id: 'conv_robert_williams',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Robert Williams',
            service: 'Water Pressure Issue',
            date: 'Tomorrow',
            time: '9:00 AM',
            status: 'scheduled',
            amount: 160,
            customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_robert',
            firstName: 'Robert',
            lastName: 'Williams',
            email: 'robert@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_robert_1',
          conversationId: 'conv_robert_williams',
          senderId: 'consumer_robert',
          messageType: 'text',
          content: 'Perfect! See you tomorrow at 9 AM.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
        },
        unreadCount: 0,
      },
      {
        id: 'conv_amanda_davis',
        conversationType: 'consumer_vendor',
        createdAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now - 20 * 60 * 1000).toISOString(),
        metadata: {
          serviceDetails: {
            customerName: 'Amanda Davis',
            service: 'Sewer Line Inspection',
            date: 'Next Monday',
            time: 'TBD',
            status: 'quoted',
            amount: 275,
            customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          },
        },
        participants: [
          { userId: 'vendor_demo', role: 'vendor' },
          {
            userId: 'consumer_amanda',
            firstName: 'Amanda',
            lastName: 'Davis',
            email: 'amanda@example.com',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          },
        ],
        lastMessage: {
          id: 'msg_conv_amanda_1',
          conversationId: 'conv_amanda_davis',
          senderId: 'vendor_demo',
          messageType: 'text',
          content: 'I can do a camera inspection of your sewer line for $275. Includes full report with photos.',
          metadata: {},
          attachments: [],
          createdAt: new Date(now - 20 * 60 * 1000).toISOString(),
          updatedAt: new Date(now - 20 * 60 * 1000).toISOString(),
        },
        unreadCount: 1,
      },
    ];
  });

  const [serviceRequests] = useState([
    {
      id: 'req_1',
      customerName: 'Sarah Johnson',
      // ... rest of the code remains the same ...
      title: 'Kitchen Sink Repair',
      distance: '2.3 mi',
      date: '5 min ago',
      budget: 175,
      priority: 'high',
      description: 'Kitchen sink is leaking and needs immediate repair. Water is pooling under the cabinet.',
      timeRange: 'ASAP',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop&auto=format'
      ],
      address: '1234 Oak Street, San Francisco, CA 94102'
    },
    {
      id: 'req_2',
      customerName: 'John Smith',
      title: 'Bathroom Faucet Installation',
      distance: '4.1 mi',
      date: '15 min ago',
      budget: 125,
      priority: 'medium',
      description: 'Need to install a new bathroom faucet. Old one is corroded and leaking.',
      timeRange: 'This week',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&auto=format'
      ],
      address: '5678 Pine Avenue, Oakland, CA 94612'
    },
    {
      id: 'req_3',
      customerName: 'Lisa Martinez',
      title: 'Water Heater Maintenance',
      distance: '1.8 mi',
      date: '1 hr ago',
      budget: 200,
      priority: 'low',
      description: 'Annual water heater maintenance and inspection needed.',
      timeRange: 'Next 2 weeks',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&auto=format'
      ],
      address: '9012 Elm Drive, Berkeley, CA 94704'
    },
    {
      id: 'req_4',
      customerName: 'Mike Rodriguez',
      title: 'Toilet Repair',
      distance: '3.2 mi',
      date: '2 hrs ago',
      budget: 150,
      priority: 'high',
      description: 'Toilet is constantly running and won\'t stop filling. Need urgent repair.',
      timeRange: 'Today',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop&auto=format'
      ],
      address: '4567 Maple Street, San Jose, CA 95110'
    },
    {
      id: 'req_5',
      customerName: 'Emily Chen',
      title: 'Garbage Disposal Installation',
      distance: '5.7 mi',
      date: '3 hrs ago',
      budget: 180,
      priority: 'medium',
      description: 'Need to install a new garbage disposal unit in kitchen sink.',
      timeRange: 'This weekend',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop&auto=format'
      ],
      address: '7890 Cedar Lane, Palo Alto, CA 94301'
    },
    {
      id: 'req_6',
      customerName: 'David Park',
      title: 'Shower Head Replacement',
      distance: '2.8 mi',
      date: '4 hrs ago',
      budget: 95,
      priority: 'low',
      description: 'Old shower head has low water pressure. Need replacement with high-pressure model.',
      timeRange: 'Next week',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&auto=format'
      ],
      address: '2345 Birch Avenue, Mountain View, CA 94041'
    },
    {
      id: 'req_7',
      customerName: 'Jessica Martinez',
      title: 'Pipe Leak Repair',
      distance: '1.5 mi',
      date: '5 hrs ago',
      budget: 220,
      priority: 'high',
      description: 'Water pipe under kitchen sink is leaking. Water damage spreading.',
      timeRange: 'ASAP',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop&auto=format'
      ],
      address: '8901 Willow Drive, Fremont, CA 94536'
    },
    {
      id: 'req_8',
      customerName: 'Alex Thompson',
      title: 'Bathtub Drain Unclogging',
      distance: '6.2 mi',
      date: '6 hrs ago',
      budget: 110,
      priority: 'medium',
      description: 'Bathtub drain is completely clogged. Water won\'t drain at all.',
      timeRange: 'This week',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&auto=format'
      ],
      address: '3456 Spruce Court, Sunnyvale, CA 94085'
    }
  ]);

  const hydrateUserProfile = (profile: Partial<UserProfile> & { email: string; id: string }) => {
    setUserProfile((prev) => ({
      id: profile.id,
      firstName: profile.firstName || prev?.firstName || '',
      lastName: profile.lastName || prev?.lastName || '',
      email: profile.email,
      phone: profile.phone || prev?.phone,
      userType: (profile.userType as UserType) ?? prev?.userType ?? null,
      avatar: profile.avatar || prev?.avatar,
      profileImage: profile.profileImage || prev?.profileImage,
      businessName: profile.businessName || prev?.businessName,
      metroArea: profile.metroArea || prev?.metroArea,
      services: profile.services || prev?.services,
      portfolio: profile.portfolio || prev?.portfolio,
    }));
  };

  const handleAuthenticatedUser = (
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      userType?: string | null;
      phone?: string;
      profileImage?: string;
      avatar?: string;
      metroArea?: string;
    },
    options?: { isNewUser?: boolean }
  ) => {
    console.log('🔍 [handleAuthenticatedUser] Entry point - User data:', {
      userId: user.id,
      email: user.email,
      providedUserType: user.userType,
      options
    });
    // Normalize the user type from the response
    const normalizedUserType = user.userType 
      ? (user.userType.toLowerCase() as UserType) 
      : userType; // Fall back to current userType if not provided

    console.log('🔍 handleAuthenticatedUser - User type info:', {
      providedUserType: user.userType,
      normalizedUserType,
      currentUserType: userType,
      isNewUser: options?.isNewUser
    });

    setUserEmail(user.email || '');
    setUserPhone(user.phone || '');
    
    // Always set the user type from the response if available
    if (normalizedUserType) {
      setUserType(normalizedUserType);
      console.log('🔄 Updated userType in context:', normalizedUserType);
    }
    
    // Profile completion check with detailed logging
    const isNewUser = options?.isNewUser === true;
    const hasValidFirstName = user.firstName?.trim() && user.firstName.trim() !== 'New';
    const hasValidLastName = user.lastName?.trim() && user.lastName.trim() !== 'User';
    const isProfileComplete = hasValidFirstName && hasValidLastName && !isNewUser;
    
    console.log('🔍 [handleAuthenticatedUser] Profile check:', {
      isNewUser,
      hasValidFirstName,
      hasValidLastName,
      isProfileComplete,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: normalizedUserType
    });
    
    // Force profile setup for new users or users with invalid profile data
    const shouldSetupProfile = isNewUser || !hasValidFirstName || !hasValidLastName;
    
    // Update user profile with the latest data
    hydrateUserProfile({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: normalizedUserType || userType,
      phone: user.phone,
      profileImage: user.profileImage,
      avatar: user.avatar,
      metroArea: user.metroArea,
    });
    
    setIsAuthenticated(true);
    const finalUserType = normalizedUserType || userType;
    
    console.log('🔄 handleAuthenticatedUser navigation:', {
      isNewUser: options?.isNewUser,
      finalUserType,
      isProfileComplete,
      firstName: user.firstName,
      lastName: user.lastName,
      hasValidFirstName,
      hasValidLastName,
      isNewUserFlag: options?.isNewUser
    });

    console.log('🔍 [handleAuthenticatedUser] Navigation decision:', {
      hasUserType: !!finalUserType,
      isNewUser: options?.isNewUser,
      hasValidFirstName,
      hasValidLastName,
      shouldSetupProfile,
      finalUserType
    });

    // For users with missing user type
    if (!finalUserType) {
      console.log('👤 [handleAuthenticatedUser] Missing user type, navigating to UserType selection');
      resetTo('UserType');
      return;
    }
    
    // For new users or users with incomplete profiles
    if (shouldSetupProfile) {
      console.log('👤 [handleAuthenticatedUser] Profile setup required', {
        isNewUser: options?.isNewUser,
        hasValidFirstName,
        hasValidLastName,
        finalUserType,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      if (finalUserType === 'vendor') {
        console.log('➡️ [handleAuthenticatedUser] Navigating to VendorProfileSetup');
        resetTo('VendorProfileSetup');
      } else {
        console.log('➡️ [handleAuthenticatedUser] Navigating to ConsumerProfile');
        resetTo('ConsumerProfile');
      }
      return;
    }
    
    // For users with complete profiles
    console.log('✅ [handleAuthenticatedUser] Profile complete, navigating to MainTabs');
    resetTo('MainTabs');
  };

  useEffect(() => {
    let removeListener: (() => void) | undefined;
    let cleanupLinking: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        setIsAuthLoading(true);
        await authService.initialize();
        
        // Check if user is already authenticated
        const isAuth = await authService.isAuthenticated();
        if (isAuth) {
          const storedUser = await authService.getStoredUser();
          if (storedUser) {
            // Verify token is still valid
            const isTokenValid = await authService.verifyToken();
            
            if (isTokenValid) {
              setIsAuthenticated(true);
              setUserEmail(storedUser.email);
              setUserType(storedUser.userType as UserType);
              setUserProfile({
                id: storedUser.id,
                email: storedUser.email,
                firstName: storedUser.firstName,
                lastName: storedUser.lastName,
                userType: storedUser.userType as UserType,
                phone: storedUser.phone,
              });
              console.log('✅ User session restored');
            } else {
              // Token expired or invalid, clear session
              console.log('⚠️ Token expired, clearing session');
              await authService.logout();
              setIsAuthenticated(false);
              setUserEmail(null);
              setUserType(null);
              setUserProfile(null);
            }
          }
        } else {
          console.log('🔄 No existing session, starting fresh');
        }
        
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    // Deep link verification is now handled by deepLinkHandler itself
    // No need for additional listener here
    
    initializeAuth();
    cleanupLinking = deepLinkHandler.initialize();

    return () => {
      cleanupLinking?.();
    };
  }, []);

  const logout = async () => {
    try {
      setIsAuthLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUserEmail('');
      setUserType(null);
      setUserProfile(null);
      setSelectedContacts([]);
      setInvitationType(null);
      setHasContactedContractor(false);
      setNotificationPermissionGranted(false);
      setSelectedRequestId('');
      setIsAuthenticated(false);
      setIsAuthLoading(false);
      resetTo('Welcome');
    }
  };

  return (
    <AppContext.Provider
      value={{
        userEmail,
        setUserEmail,
        userPhone,
        setUserPhone,
        userType,
        setUserType,
        userProfile,
        setUserProfile,
        selectedContacts,
        setSelectedContacts,
        invitationType,
        setInvitationType,
        hasContactedContractor,
        setHasContactedContractor,
        notificationPermissionGranted,
        setNotificationPermissionGranted,
        selectedRequestId,
        setSelectedRequestId,
        logout,
        isAuthenticated,
        setIsAuthenticated,
        isAuthLoading,
        authenticateUser: handleAuthenticatedUser,
        conversations,
        serviceRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
