// Consumer-side conversations - Consumer talks to VENDORS/CONTRACTORS
// This is the OPPOSITE perspective from mockConversations.ts (vendor side)

export interface ConsumerConversationMessage {
  id: string;
  type: 'text' | 'quote' | 'appointment' | 'image';
  content: string;
  sender: 'user' | 'other'; // 'user' = consumer (right), 'other' = vendor (left)
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

export interface ConsumerConversation {
  id: string;
  vendorName: string; // Contractor/business name
  vendorFirstName: string;
  vendorLastName: string;
  vendorEmail: string;
  vendorAvatar: string;
  vendorRating: number;
  service: string;
  amount: number;
  status: 'upcoming' | 'completed' | 'new_request';
  messages: ConsumerConversationMessage[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Helper to get time ago
const getTimeAgo = (hoursAgo: number): string => {
  const now = new Date();
  const messageTime = new Date(now.getTime() - hoursAgo * 3600000);
  return messageTime.toISOString();
};

import { CONVERSATION_IDS } from './mockConversations';

export const CONSUMER_CONVERSATIONS: ConsumerConversation[] = [
  // UPCOMING APPOINTMENTS - Consumer has scheduled services
  {
    id: CONVERSATION_IDS.ELECTRICAL,
    vendorName: 'John\'s Electrical Services',
    vendorFirstName: 'John',
    vendorLastName: 'Martinez',
    vendorEmail: 'john@johnselectrical.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.9,
    service: 'Electrical Outlet Installation',
    amount: 185,
    status: 'upcoming',
    unreadCount: 1,
    createdAt: getTimeAgo(48),
    updatedAt: getTimeAgo(0.17),
    messages: [
      { id: '1', type: 'text', content: 'Hi! I need 3 new electrical outlets installed in my home office. Can you help?', sender: 'user', timestamp: 'Yesterday 3:00 PM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a licensed electrician with 15+ years experience. Where do you need the outlets installed?', sender: 'other', timestamp: 'Yesterday 3:15 PM' },
      { id: '3', type: 'text', content: 'Two on the wall behind my desk and one near the door. The room currently only has one outlet.', sender: 'user', timestamp: 'Yesterday 3:20 PM' },
      { id: '4', type: 'text', content: 'Perfect! I\'ll need to run new wiring from the breaker panel. Let me send you a quote.', sender: 'other', timestamp: 'Yesterday 3:25 PM' },
      { id: '5', type: 'quote', content: '', sender: 'other', timestamp: 'Yesterday 3:30 PM', quoteData: { amount: 185, description: 'Electrical Outlet Installation - 3 new outlets with wiring' } },
      { id: '6', type: 'text', content: 'That sounds reasonable! When can you come?', sender: 'user', timestamp: 'Yesterday 3:45 PM' },
      { id: '7', type: 'appointment', content: '', sender: 'other', timestamp: 'Yesterday 4:00 PM', appointmentData: { date: 'Today', time: '2:00 PM', service: 'Electrical Outlet Installation' } },
      { id: '8', type: 'text', content: 'Perfect! See you at 2 PM today. I\'ll be home.', sender: 'user', timestamp: 'Yesterday 4:05 PM' },
      { id: '9', type: 'text', content: 'I\'m on my way! Should arrive in 10 minutes.', sender: 'other', timestamp: 'Today 1:50 PM' },
    ]
  },
  {
    id: CONVERSATION_IDS.HVAC,
    vendorName: 'Elite HVAC Services',
    vendorFirstName: 'Michael',
    vendorLastName: 'Thompson',
    vendorEmail: 'mike@elitehvac.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.8,
    service: 'HVAC System Repair',
    amount: 320,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(72),
    updatedAt: getTimeAgo(48),
    messages: [
      { id: '1', type: 'text', content: 'Hi! My AC is not cooling properly. It\'s running but barely any cold air coming out.', sender: 'user', timestamp: '2 days ago 9:00 AM' },
      { id: '2', type: 'text', content: 'I can help! I\'m a certified HVAC technician. Sounds like it could be low refrigerant or a compressor issue. When did this start?', sender: 'other', timestamp: '2 days ago 9:15 AM' },
      { id: '3', type: 'text', content: 'Started about 3 days ago. It\'s been really hot and the house won\'t cool down. How much to inspect and repair?', sender: 'user', timestamp: '2 days ago 9:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: '2 days ago 9:30 AM', quoteData: { amount: 320, description: 'HVAC System Repair - Inspection, refrigerant check, and repair' } },
      { id: '5', type: 'text', content: 'That works! When can you come? It\'s getting unbearable.', sender: 'user', timestamp: '2 days ago 9:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: '2 days ago 10:00 AM', appointmentData: { date: 'Tomorrow', time: '10:00 AM', service: 'HVAC System Repair' } },
      { id: '7', type: 'text', content: 'Perfect! The AC unit is outside on the east side of the house.', sender: 'user', timestamp: '2 days ago 10:05 AM' },
      { id: '8', type: 'text', content: 'Got it! I\'ll bring my gauges and refrigerant. Should have you cooling in no time.', sender: 'other', timestamp: '2 days ago 10:10 AM' },
    ]
  },
  {
    id: CONVERSATION_IDS.PLUMBING,
    vendorName: 'ProPaint Solutions',
    vendorFirstName: 'David',
    vendorLastName: 'Anderson',
    vendorEmail: 'david@propaint.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.9,
    service: 'Interior Painting',
    amount: 450,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(96),
    updatedAt: getTimeAgo(72),
    messages: [
      { id: '1', type: 'text', content: 'Hi! I need my living room painted. Looking for someone professional and reliable.', sender: 'user', timestamp: '3 days ago 2:00 PM' },
      { id: '2', type: 'text', content: 'I\'d love to help! I\'m a professional painter with 10+ years experience. What color are you thinking?', sender: 'other', timestamp: '3 days ago 2:10 PM' },
      { id: '3', type: 'text', content: 'I want a soft gray - Sherwin Williams Repose Gray. The room is about 15x20 feet. Can you give me a quote?', sender: 'user', timestamp: '3 days ago 2:15 PM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: '3 days ago 2:20 PM', quoteData: { amount: 450, description: 'Interior Painting - Living room with premium paint, 2 coats' } },
      { id: '5', type: 'text', content: 'That sounds reasonable! When can you start?', sender: 'user', timestamp: '3 days ago 2:30 PM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: '3 days ago 2:35 PM', appointmentData: { date: 'Saturday', time: '9:00 AM', service: 'Interior Painting' } },
      { id: '7', type: 'text', content: 'Perfect! I\'ll have all furniture moved away from the walls. See you Saturday!', sender: 'user', timestamp: '3 days ago 2:40 PM' },
    ]
  },
  {
    id: CONVERSATION_IDS.PAINTING,
    vendorName: 'Master Carpentry',
    vendorFirstName: 'Robert',
    vendorLastName: 'Wilson',
    vendorEmail: 'robert@mastercarpentry.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.7,
    service: 'Cabinet Door Repair',
    amount: 150,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(120),
    updatedAt: getTimeAgo(96),
    messages: [
      { id: '1', type: 'text', content: 'Hi! My kitchen cabinet doors are sagging and the hinges are loose. Can you fix them?', sender: 'user', timestamp: '4 days ago 10:00 AM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a carpenter and this is a common issue. Usually just need to replace the hinges and adjust alignment.', sender: 'other', timestamp: '4 days ago 10:15 AM' },
      { id: '3', type: 'text', content: 'Great! There are about 6 cabinet doors that need work. How much would that cost?', sender: 'user', timestamp: '4 days ago 10:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: '4 days ago 10:30 AM', quoteData: { amount: 150, description: 'Cabinet Door Repair - Replace hinges and adjust 6 doors' } },
      { id: '5', type: 'text', content: 'Perfect! When can you come?', sender: 'user', timestamp: '4 days ago 10:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: '4 days ago 11:00 AM', appointmentData: { date: 'Monday', time: '1:00 PM', service: 'Cabinet Door Repair' } },
      { id: '7', type: 'text', content: 'Excellent! I\'ll have the kitchen cleared. See you Monday!', sender: 'user', timestamp: '4 days ago 11:05 AM' },
    ]
  },

  // COMPLETED APPOINTMENTS - Consumer's finished services
  {
    id: CONVERSATION_IDS.LANDSCAPING,
    vendorName: 'Quick Fix Appliances',
    vendorFirstName: 'James',
    vendorLastName: 'Rodriguez',
    vendorEmail: 'james@quickfixappliances.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    vendorRating: 5.0,
    service: 'Appliance Repair - Washing Machine',
    amount: 225,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(48),
    updatedAt: getTimeAgo(24),
    messages: [
      { id: '1', type: 'text', content: 'My washing machine is making a terrible grinding noise and won\'t spin. Can you help?', sender: 'user', timestamp: '2 days ago 10:00 AM' },
      { id: '2', type: 'text', content: 'Yes! I\'m an appliance repair specialist. Sounds like it could be the drum bearing. What brand is it?', sender: 'other', timestamp: '2 days ago 10:15 AM' },
      { id: '3', type: 'text', content: 'It\'s a Whirlpool front-loader, about 5 years old. How much to fix it?', sender: 'user', timestamp: '2 days ago 10:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: '2 days ago 10:30 AM', quoteData: { amount: 225, description: 'Washing Machine Repair - Replace drum bearing and seal' } },
      { id: '5', type: 'text', content: 'That\'s reasonable! When can you come?', sender: 'user', timestamp: '2 days ago 10:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: '2 days ago 11:00 AM', appointmentData: { date: 'Yesterday', time: '11:00 AM', service: 'Appliance Repair - Washing Machine' } },
      { id: '7', type: 'image', content: 'All fixed! Bearing replaced and tested - running smooth and quiet now.', sender: 'other', timestamp: 'Yesterday 12:30 PM', imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400' },
      { id: '8', type: 'text', content: 'Thank you so much! It\'s working perfectly. You saved me from buying a new one!', sender: 'user', timestamp: 'Yesterday 12:35 PM' },
      { id: '9', type: 'text', content: 'Happy to help! Call me anytime for appliance issues. I also do dryers, dishwashers, and fridges!', sender: 'other', timestamp: 'Yesterday 12:40 PM' },
    ]
  },
  {
    id: 'consumer_conv_006',
    vendorName: 'Reliable Roofing Co.',
    vendorFirstName: 'Tom',
    vendorLastName: 'Harris',
    vendorEmail: 'tom@reliableroofing.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.9,
    service: 'Roof Leak Repair',
    amount: 375,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(120),
    updatedAt: getTimeAgo(96),
    messages: [
      { id: '1', type: 'text', content: 'EMERGENCY! My roof is leaking badly. Water coming through the ceiling!', sender: 'user', timestamp: 'Monday 8:00 AM' },
      { id: '2', type: 'text', content: 'I\'m on my way! Put buckets under the leak. I\'m a licensed roofer and can be there in 20 minutes.', sender: 'other', timestamp: 'Monday 8:05 AM' },
      { id: '3', type: 'text', content: 'Thank you! It\'s in the master bedroom. Please hurry!', sender: 'user', timestamp: 'Monday 8:10 AM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: 'Monday 9:00 AM', quoteData: { amount: 375, description: 'Emergency Roof Leak Repair - Replace damaged shingles and seal' } },
      { id: '5', type: 'text', content: 'Yes, please fix it ASAP! Whatever it takes.', sender: 'user', timestamp: 'Monday 9:05 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: 'Monday 9:10 AM', appointmentData: { date: 'Monday', time: '3:30 PM', service: 'Emergency Roof Repair' } },
      { id: '7', type: 'image', content: 'Roof repaired! Replaced 8 shingles and sealed. All tested - no more leaks!', sender: 'other', timestamp: 'Monday 5:30 PM', imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400' },
      { id: '8', type: 'text', content: 'Thank you for the quick response! You saved us from major water damage.', sender: 'user', timestamp: 'Monday 5:35 PM' },
    ]
  },
  {
    id: 'consumer_conv_007',
    vendorName: 'GreenScape Design',
    vendorFirstName: 'Amanda',
    vendorLastName: 'Chen',
    vendorEmail: 'amanda@greenscapedesign.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.8,
    service: 'Landscape Design Consultation',
    amount: 180,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(144),
    updatedAt: getTimeAgo(120),
    messages: [
      { id: '1', type: 'text', content: 'I want to redesign my backyard. Looking for a landscape designer to help with the plan.', sender: 'user', timestamp: 'Last Thursday 1:00 PM' },
      { id: '2', type: 'text', content: 'I\'d love to help! I\'m a landscape designer with 12 years experience. What\'s your vision for the space?', sender: 'other', timestamp: 'Last Thursday 1:15 PM' },
      { id: '3', type: 'text', content: 'I want a patio area, some flower beds, and maybe a small water feature. The yard is about 30x40 feet.', sender: 'user', timestamp: 'Last Thursday 1:20 PM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: 'Last Thursday 1:30 PM', quoteData: { amount: 180, description: 'Landscape Design Consultation - Full backyard design plan with 3D rendering' } },
      { id: '5', type: 'text', content: 'Perfect! When can you come see the space?', sender: 'user', timestamp: 'Last Thursday 1:45 PM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: 'Last Thursday 2:00 PM', appointmentData: { date: 'Last Friday', time: '2:00 PM', service: 'Landscape Design Consultation' } },
      { id: '7', type: 'image', content: 'Here\'s your custom design! Includes patio, raised flower beds, and fountain feature.', sender: 'other', timestamp: 'Last Friday 3:30 PM', imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400' },
      { id: '8', type: 'text', content: 'This is amazing! Exactly what I envisioned. Can\'t wait to get started!', sender: 'user', timestamp: 'Last Friday 3:35 PM' },
    ]
  },
  {
    id: 'consumer_conv_008',
    vendorName: 'Bright Electric Solutions',
    vendorFirstName: 'Kevin',
    vendorLastName: 'Brown',
    vendorEmail: 'kevin@brightelectric.com',
    vendorAvatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    vendorRating: 4.9,
    service: 'Ceiling Fan Installation',
    amount: 220,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(168),
    updatedAt: getTimeAgo(144),
    messages: [
      { id: '1', type: 'text', content: 'I need 3 ceiling fans installed in my bedrooms. Can you help?', sender: 'user', timestamp: 'Last Wednesday 9:00 AM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a licensed electrician. Do you have the fans already or need me to supply them?', sender: 'other', timestamp: 'Last Wednesday 9:15 AM' },
      { id: '3', type: 'text', content: 'I have all three fans - Hunter brand with lights. How much for installation?', sender: 'user', timestamp: 'Last Wednesday 9:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'other', timestamp: 'Last Wednesday 9:30 AM', quoteData: { amount: 220, description: 'Ceiling Fan Installation - Install 3 fans with light kits' } },
      { id: '5', type: 'text', content: 'Perfect! When can you do it?', sender: 'user', timestamp: 'Last Wednesday 9:35 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'other', timestamp: 'Last Wednesday 9:45 AM', appointmentData: { date: 'Last Thursday', time: '10:30 AM', service: 'Ceiling Fan Installation' } },
      { id: '7', type: 'text', content: 'All 3 fans installed and tested! Wired the lights to wall switches. Everything working perfectly.', sender: 'other', timestamp: 'Last Thursday 1:00 PM' },
      { id: '8', type: 'text', content: 'Excellent work! The rooms feel so much cooler already. Thank you!', sender: 'user', timestamp: 'Last Thursday 1:05 PM' },
    ]
  },
];

// Helper function to get conversation by vendor name (for consumer side)
export const getConsumerConversationByName = (vendorName: string): ConsumerConversation | undefined => {
  const normalizedName = vendorName.toLowerCase().trim();
  return CONSUMER_CONVERSATIONS.find(conv => 
    conv.vendorName.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(conv.vendorFirstName.toLowerCase()) ||
    normalizedName.includes(conv.vendorLastName.toLowerCase())
  );
};

// Helper function to format conversations for Consumer ChatListScreen
export const getFormattedConsumerConversationsForList = () => {
  return CONSUMER_CONVERSATIONS.map(conv => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    
    // Generate proper preview text based on message type
    let previewContent = lastMsg.content;
    if (lastMsg.type === 'quote' && lastMsg.quoteData) {
      previewContent = `💰 Quote received: $${lastMsg.quoteData.amount}`;
    } else if (lastMsg.type === 'appointment' && lastMsg.appointmentData) {
      previewContent = `📅 Appointment: ${lastMsg.appointmentData.date} at ${lastMsg.appointmentData.time}`;
    } else if (lastMsg.type === 'image') {
      previewContent = lastMsg.content || '📷 Photo';
    }
    
    return {
      id: conv.id,
      title: conv.vendorName,
      conversationType: 'direct' as const,
      participants: [
        { 
          userId: conv.id.replace('consumer_conv_', 'vendor_'), 
          firstName: conv.vendorFirstName, 
          lastName: conv.vendorLastName, 
          email: conv.vendorEmail, 
          avatarUrl: conv.vendorAvatar 
        }
      ],
      lastMessage: {
        id: lastMsg.id,
        conversationId: conv.id,
        content: previewContent,
        senderId: lastMsg.sender === 'user' ? 'consumer_1' : conv.id.replace('consumer_conv_', 'vendor_'),
        createdAt: conv.updatedAt,
        updatedAt: conv.updatedAt,
        messageType: 'text' as const,
        metadata: { 
          serviceDetails: { 
            service: conv.service, 
            amount: conv.amount, 
            vendorAvatar: conv.vendorAvatar,
            vendorName: conv.vendorName,
            vendorRating: conv.vendorRating,
            status: conv.status
          } 
        },
        attachments: [],
        deletedAt: null
      },
      unreadCount: conv.unreadCount,
      metadata: { 
        serviceDetails: { 
          service: conv.service, 
          amount: conv.amount, 
          vendorName: conv.vendorName, 
          vendorAvatar: conv.vendorAvatar,
          vendorRating: conv.vendorRating,
          status: conv.status
        } 
      },
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      deletedAt: null
    };
  });
};
