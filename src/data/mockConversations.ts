// Centralized conversation data source for all messaging screens
// This ensures preview messages match actual conversations

export interface ConversationMessage {
  id: string;
  type: 'text' | 'quote' | 'appointment' | 'image';
  content: string;
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

export interface MockConversation {
  id: string;
  customerName: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerAvatar: string;
  service: string;
  amount: number;
  status: 'upcoming' | 'completed' | 'new_request';
  messages: ConversationMessage[];
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

// Common conversation IDs to ensure consistency between vendor and consumer views
export const CONVERSATION_IDS = {
  ELECTRICAL: 'conv_electrical_001',
  HVAC: 'conv_hvac_001',
  PLUMBING: 'conv_plumbing_001',
  PAINTING: 'conv_painting_001',
  LANDSCAPING: 'conv_landscaping_001',
} as const;

export const MOCK_CONVERSATIONS: MockConversation[] = [
  // UPCOMING APPOINTMENTS
  {
    id: CONVERSATION_IDS.ELECTRICAL,
    customerName: 'Sarah Johnson',
    customerFirstName: 'Sarah',
    customerLastName: 'Johnson',
    customerEmail: 'sarah.johnson@example.com',
    customerAvatar: 'https://i.pravatar.cc/150?img=1',
    service: 'Electrical Outlet Installation',
    amount: 185,
    status: 'upcoming',
    unreadCount: 1,
    createdAt: getTimeAgo(48),
    updatedAt: getTimeAgo(0.17), // 10 minutes ago
    messages: [
      { id: '1', type: 'text', content: 'Hi! I need 3 new electrical outlets installed in my home office. Can you help?', sender: 'other', timestamp: 'Yesterday 3:00 PM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a licensed electrician with 15+ years experience. Where do you need the outlets installed?', sender: 'user', timestamp: 'Yesterday 3:15 PM' },
      { id: '3', type: 'text', content: 'Two on the wall behind my desk and one near the door. The room currently only has one outlet.', sender: 'other', timestamp: 'Yesterday 3:20 PM' },
      { id: '4', type: 'text', content: 'Perfect! I\'ll need to run new wiring from the breaker panel. Let me send you a quote.', sender: 'user', timestamp: 'Yesterday 3:25 PM' },
      { id: '5', type: 'quote', content: '', sender: 'user', timestamp: 'Yesterday 3:30 PM', quoteData: { amount: 185, description: 'Electrical Outlet Installation - 3 new outlets with wiring' } },
      { id: '6', type: 'text', content: 'That sounds reasonable! When can you come?', sender: 'other', timestamp: 'Yesterday 3:45 PM' },
      { id: '7', type: 'appointment', content: '', sender: 'user', timestamp: 'Yesterday 4:00 PM', appointmentData: { date: 'Today', time: '2:00 PM', service: 'Electrical Outlet Installation' } },
      { id: '8', type: 'text', content: 'Perfect! See you at 2 PM today. I\'ll be home.', sender: 'other', timestamp: 'Yesterday 4:05 PM' },
      { id: '9', type: 'text', content: 'I\'m on my way! Should arrive in 10 minutes.', sender: 'user', timestamp: 'Today 1:50 PM' },
    ]
  },
  {
    id: CONVERSATION_IDS.HVAC,
    customerName: 'Mike Rodriguez',
    customerFirstName: 'Mike',
    customerLastName: 'Rodriguez',
    customerEmail: 'mike.rodriguez@example.com',
    customerAvatar: 'https://i.pravatar.cc/150?img=2',
    service: 'HVAC System Repair',
    amount: 320,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(72),
    updatedAt: getTimeAgo(48),
    messages: [
      { id: '1', type: 'text', content: 'Hi! My AC is not cooling properly. It\'s running but barely any cold air coming out.', sender: 'other', timestamp: '2 days ago 9:00 AM' },
      { id: '2', type: 'text', content: 'I can help! I\'m a certified HVAC technician. Sounds like it could be low refrigerant or a compressor issue. When did this start?', sender: 'user', timestamp: '2 days ago 9:15 AM' },
      { id: '3', type: 'text', content: 'Started about 3 days ago. It\'s been really hot and the house won\'t cool down. How much to inspect and repair?', sender: 'other', timestamp: '2 days ago 9:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '2 days ago 9:30 AM', quoteData: { amount: 320, description: 'HVAC System Repair - Inspection, refrigerant check, and repair' } },
      { id: '5', type: 'text', content: 'That works! When can you come? It\'s getting unbearable.', sender: 'other', timestamp: '2 days ago 9:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: '2 days ago 10:00 AM', appointmentData: { date: 'Tomorrow', time: '10:00 AM', service: 'HVAC System Repair' } },
      { id: '7', type: 'text', content: 'Perfect! The AC unit is outside on the east side of the house.', sender: 'other', timestamp: '2 days ago 10:05 AM' },
      { id: '8', type: 'text', content: 'Got it! I\'ll bring my gauges and refrigerant. Should have you cooling in no time.', sender: 'user', timestamp: '2 days ago 10:10 AM' },
    ]
  },
  {
    id: CONVERSATION_IDS.PLUMBING,
    customerName: 'Emily Chen',
    customerFirstName: 'Emily',
    customerLastName: 'Chen',
    customerEmail: 'emily.chen@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    service: 'Interior Painting',
    amount: 450,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(96),
    updatedAt: getTimeAgo(72),
    messages: [
      { id: '1', type: 'text', content: 'Hi! I need my living room painted. Looking for someone professional and reliable.', sender: 'other', timestamp: '3 days ago 2:00 PM' },
      { id: '2', type: 'text', content: 'I\'d love to help! I\'m a professional painter with 10+ years experience. What color are you thinking?', sender: 'user', timestamp: '3 days ago 2:10 PM' },
      { id: '3', type: 'text', content: 'I want a soft gray - Sherwin Williams Repose Gray. The room is about 15x20 feet. Can you give me a quote?', sender: 'other', timestamp: '3 days ago 2:15 PM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '3 days ago 2:20 PM', quoteData: { amount: 450, description: 'Interior Painting - Living room with premium paint, 2 coats' } },
      { id: '5', type: 'text', content: 'That sounds reasonable! When can you start?', sender: 'other', timestamp: '3 days ago 2:30 PM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: '3 days ago 2:35 PM', appointmentData: { date: 'Saturday', time: '9:00 AM', service: 'Interior Painting' } },
      { id: '7', type: 'text', content: 'Perfect! I\'ll have all furniture moved away from the walls. See you Saturday!', sender: 'other', timestamp: '3 days ago 2:40 PM' },
    ]
  },
  {
    id: CONVERSATION_IDS.PAINTING,
    customerName: 'David Wilson',
    customerFirstName: 'David',
    customerLastName: 'Wilson',
    customerEmail: 'david.wilson@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    service: 'Cabinet Door Repair',
    amount: 150,
    status: 'upcoming',
    unreadCount: 0,
    createdAt: getTimeAgo(120),
    updatedAt: getTimeAgo(96),
    messages: [
      { id: '1', type: 'text', content: 'Hi! My kitchen cabinet doors are sagging and the hinges are loose. Can you fix them?', sender: 'other', timestamp: '4 days ago 10:00 AM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a carpenter and this is a common issue. Usually just need to replace the hinges and adjust alignment.', sender: 'user', timestamp: '4 days ago 10:15 AM' },
      { id: '3', type: 'text', content: 'Great! There are about 6 cabinet doors that need work. How much would that cost?', sender: 'other', timestamp: '4 days ago 10:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '4 days ago 10:30 AM', quoteData: { amount: 150, description: 'Cabinet Door Repair - Replace hinges and adjust 6 doors' } },
      { id: '5', type: 'text', content: 'Perfect! When can you come?', sender: 'other', timestamp: '4 days ago 10:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: '4 days ago 11:00 AM', appointmentData: { date: 'Monday', time: '1:00 PM', service: 'Cabinet Door Repair' } },
      { id: '7', type: 'text', content: 'Excellent! I\'ll have the kitchen cleared. See you Monday!', sender: 'other', timestamp: '4 days ago 11:05 AM' },
    ]
  },
  // COMPLETED APPOINTMENTS
  {
    id: CONVERSATION_IDS.LANDSCAPING,
    customerName: 'Lisa Martinez',
    customerFirstName: 'Lisa',
    customerLastName: 'Martinez',
    customerEmail: 'lisa.martinez@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    service: 'Appliance Repair - Washing Machine',
    amount: 225,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(48),
    updatedAt: getTimeAgo(24),
    messages: [
      { id: '1', type: 'text', content: 'My washing machine is making a terrible grinding noise and won\'t spin. Can you help?', sender: 'other', timestamp: '2 days ago 10:00 AM' },
      { id: '2', type: 'text', content: 'Yes! I\'m an appliance repair specialist. Sounds like it could be the drum bearing. What brand is it?', sender: 'user', timestamp: '2 days ago 10:15 AM' },
      { id: '3', type: 'text', content: 'It\'s a Whirlpool front-loader, about 5 years old. How much to fix it?', sender: 'other', timestamp: '2 days ago 10:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '2 days ago 10:30 AM', quoteData: { amount: 225, description: 'Washing Machine Repair - Replace drum bearing and seal' } },
      { id: '5', type: 'text', content: 'That\'s reasonable! When can you come?', sender: 'other', timestamp: '2 days ago 10:45 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: '2 days ago 11:00 AM', appointmentData: { date: 'Yesterday', time: '11:00 AM', service: 'Appliance Repair - Washing Machine' } },
      { id: '7', type: 'image', content: 'All fixed! Bearing replaced and tested - running smooth and quiet now.', sender: 'user', timestamp: 'Yesterday 12:30 PM', imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400' },
      { id: '8', type: 'text', content: 'Thank you so much! It\'s working perfectly. You saved me from buying a new one!', sender: 'other', timestamp: 'Yesterday 12:35 PM' },
      { id: '9', type: 'text', content: 'Happy to help! Call me anytime for appliance issues. I also do dryers, dishwashers, and fridges!', sender: 'user', timestamp: 'Yesterday 12:40 PM' },
    ]
  },
  {
    id: 'conv_006',
    customerName: 'John Smith',
    customerFirstName: 'John',
    customerLastName: 'Smith',
    customerEmail: 'john.smith@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    service: 'Roof Leak Repair',
    amount: 375,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(120),
    updatedAt: getTimeAgo(96),
    messages: [
      { id: '1', type: 'text', content: 'EMERGENCY! My roof is leaking badly. Water coming through the ceiling!', sender: 'other', timestamp: 'Monday 8:00 AM' },
      { id: '2', type: 'text', content: 'I\'m on my way! Put buckets under the leak. I\'m a licensed roofer and can be there in 20 minutes.', sender: 'user', timestamp: 'Monday 8:05 AM' },
      { id: '3', type: 'text', content: 'Thank you! It\'s in the master bedroom. Please hurry!', sender: 'other', timestamp: 'Monday 8:10 AM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: 'Monday 9:00 AM', quoteData: { amount: 375, description: 'Emergency Roof Leak Repair - Replace damaged shingles and seal' } },
      { id: '5', type: 'text', content: 'Yes, please fix it ASAP! Whatever it takes.', sender: 'other', timestamp: 'Monday 9:05 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: 'Monday 9:10 AM', appointmentData: { date: 'Monday', time: '3:30 PM', service: 'Emergency Roof Repair' } },
      { id: '7', type: 'image', content: 'Roof repaired! Replaced 8 shingles and sealed. All tested - no more leaks!', sender: 'user', timestamp: 'Monday 5:30 PM', imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400' },
      { id: '8', type: 'text', content: 'Thank you for the quick response! You saved us from major water damage.', sender: 'other', timestamp: 'Monday 5:35 PM' },
    ]
  },
  {
    id: 'conv_007',
    customerName: 'Amanda Taylor',
    customerFirstName: 'Amanda',
    customerLastName: 'Taylor',
    customerEmail: 'amanda.taylor@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    service: 'Landscape Design Consultation',
    amount: 180,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(144),
    updatedAt: getTimeAgo(120),
    messages: [
      { id: '1', type: 'text', content: 'I want to redesign my backyard. Looking for a landscape designer to help with the plan.', sender: 'other', timestamp: 'Last Thursday 1:00 PM' },
      { id: '2', type: 'text', content: 'I\'d love to help! I\'m a landscape designer with 12 years experience. What\'s your vision for the space?', sender: 'user', timestamp: 'Last Thursday 1:15 PM' },
      { id: '3', type: 'text', content: 'I want a patio area, some flower beds, and maybe a small water feature. The yard is about 30x40 feet.', sender: 'other', timestamp: 'Last Thursday 1:20 PM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: 'Last Thursday 1:30 PM', quoteData: { amount: 180, description: 'Landscape Design Consultation - Full backyard design plan with 3D rendering' } },
      { id: '5', type: 'text', content: 'Perfect! When can you come see the space?', sender: 'other', timestamp: 'Last Thursday 1:45 PM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: 'Last Thursday 2:00 PM', appointmentData: { date: 'Last Friday', time: '2:00 PM', service: 'Landscape Design Consultation' } },
      { id: '7', type: 'image', content: 'Here\'s your custom design! Includes patio, raised flower beds, and fountain feature.', sender: 'user', timestamp: 'Last Friday 3:30 PM', imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400' },
      { id: '8', type: 'text', content: 'This is amazing! Exactly what I envisioned. Can\'t wait to get started!', sender: 'other', timestamp: 'Last Friday 3:35 PM' },
    ]
  },
  {
    id: 'conv_008',
    customerName: 'Robert Brown',
    customerFirstName: 'Robert',
    customerLastName: 'Brown',
    customerEmail: 'robert.brown@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    service: 'Ceiling Fan Installation',
    amount: 220,
    status: 'completed',
    unreadCount: 0,
    createdAt: getTimeAgo(168),
    updatedAt: getTimeAgo(144),
    messages: [
      { id: '1', type: 'text', content: 'I need 3 ceiling fans installed in my bedrooms. Can you help?', sender: 'other', timestamp: 'Last Wednesday 9:00 AM' },
      { id: '2', type: 'text', content: 'Absolutely! I\'m a licensed electrician. Do you have the fans already or need me to supply them?', sender: 'user', timestamp: 'Last Wednesday 9:15 AM' },
      { id: '3', type: 'text', content: 'I have all three fans - Hunter brand with lights. How much for installation?', sender: 'other', timestamp: 'Last Wednesday 9:20 AM' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: 'Last Wednesday 9:30 AM', quoteData: { amount: 220, description: 'Ceiling Fan Installation - Install 3 fans with light kits' } },
      { id: '5', type: 'text', content: 'Perfect! When can you do it?', sender: 'other', timestamp: 'Last Wednesday 9:35 AM' },
      { id: '6', type: 'appointment', content: '', sender: 'user', timestamp: 'Last Wednesday 9:45 AM', appointmentData: { date: 'Last Thursday', time: '10:30 AM', service: 'Ceiling Fan Installation' } },
      { id: '7', type: 'text', content: 'All 3 fans installed and tested! Wired the lights to wall switches. Everything working perfectly.', sender: 'user', timestamp: 'Last Thursday 1:00 PM' },
      { id: '8', type: 'text', content: 'Excellent work! The rooms feel so much cooler already. Thank you!', sender: 'other', timestamp: 'Last Thursday 1:05 PM' },
    ]
  },
  
  // NEW SERVICE REQUESTS (Quote sent, no appointment yet)
  {
    id: 'conv_009',
    customerName: 'Jennifer Davis',
    customerFirstName: 'Jennifer',
    customerLastName: 'Davis',
    customerEmail: 'jennifer.davis@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    service: 'Garage Door Repair',
    amount: 275,
    status: 'new_request',
    unreadCount: 2,
    createdAt: getTimeAgo(2),
    updatedAt: getTimeAgo(1.5),
    messages: [
      { id: '1', type: 'text', content: 'EMERGENCY! My garage door won\'t open. Motor makes noise but door doesn\'t move. I\'m stuck!', sender: 'other', timestamp: '2 hours ago' },
      { id: '2', type: 'text', content: 'I can help right away! Sounds like the spring or cable broke. I\'m a garage door specialist. Can you send a photo?', sender: 'user', timestamp: '1 hour 50 min ago' },
      { id: '3', type: 'text', content: 'Here\'s a photo. I really need to get my car out!', sender: 'other', timestamp: '1 hour 45 min ago' },
      { id: '4', type: 'text', content: 'I see the problem - torsion spring snapped. I have parts in my truck. Let me send you a quote.', sender: 'user', timestamp: '1 hour 40 min ago' },
      { id: '5', type: 'quote', content: '', sender: 'user', timestamp: '1 hour 35 min ago', quoteData: { amount: 275, description: 'Emergency Garage Door Repair - Replace torsion spring and cable' } },
      { id: '6', type: 'text', content: 'Yes please! When can you be here?', sender: 'other', timestamp: '1 hour 30 min ago' },
    ]
  },
  {
    id: 'conv_010',
    customerName: 'Michael Chen',
    customerFirstName: 'Michael',
    customerLastName: 'Chen',
    customerEmail: 'michael.chen@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    service: 'Deck Staining & Sealing',
    amount: 850,
    status: 'new_request',
    unreadCount: 1,
    createdAt: getTimeAgo(5),
    updatedAt: getTimeAgo(3.75),
    messages: [
      { id: '1', type: 'text', content: 'Hi! I need my back deck stained and sealed. It\'s about 400 sq ft and the wood is pretty weathered.', sender: 'other', timestamp: '5 hours ago' },
      { id: '2', type: 'text', content: 'I\'d love to help! I specialize in deck restoration. I\'ll need to power wash, sand, then stain and seal. What color are you thinking?', sender: 'user', timestamp: '4 hours 45 min ago' },
      { id: '3', type: 'text', content: 'I want a natural cedar tone. How much would the full job cost?', sender: 'other', timestamp: '4 hours 30 min ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '4 hours 15 min ago', quoteData: { amount: 850, description: 'Deck Staining & Sealing - Power wash, sand, stain, and seal 400 sq ft' } },
      { id: '5', type: 'text', content: 'That sounds reasonable! When can you start? Weather looks good this weekend.', sender: 'other', timestamp: '4 hours ago' },
    ]
  },
  {
    id: 'conv_011',
    customerName: 'Robert Wilson',
    customerFirstName: 'Robert',
    customerLastName: 'Wilson',
    customerEmail: 'robert.wilson@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    service: 'Toilet Installation',
    amount: 200,
    status: 'new_request',
    unreadCount: 0,
    createdAt: getTimeAgo(6),
    updatedAt: getTimeAgo(5.5),
    messages: [
      { id: '1', type: 'text', content: 'Need to install a new toilet in the guest bathroom. Already purchased the toilet from Home Depot.', sender: 'other', timestamp: '6 hours ago' },
      { id: '2', type: 'text', content: 'Perfect! I\'m a licensed plumber. Installing a toilet is straightforward. What model did you get?', sender: 'user', timestamp: '5 hours 50 min ago' },
      { id: '3', type: 'text', content: 'It\'s a Kohler Highline. Standard height. How much for installation?', sender: 'other', timestamp: '5 hours 45 min ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '5 hours 40 min ago', quoteData: { amount: 200, description: 'Toilet Installation - Remove old toilet, install new Kohler unit with wax ring' } },
      { id: '5', type: 'text', content: 'Great! I\'m flexible on timing. What works for you?', sender: 'other', timestamp: '5 hours 30 min ago' },
    ]
  },
  {
    id: 'conv_012',
    customerName: 'Emily Parker',
    customerFirstName: 'Emily',
    customerLastName: 'Parker',
    customerEmail: 'emily.parker@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    service: 'Garbage Disposal Repair',
    amount: 150,
    status: 'new_request',
    unreadCount: 1,
    createdAt: getTimeAgo(4),
    updatedAt: getTimeAgo(3.5),
    messages: [
      { id: '1', type: 'text', content: 'My garbage disposal is making loud grinding noises and not working properly. Can you help?', sender: 'other', timestamp: '4 hours ago' },
      { id: '2', type: 'text', content: 'Yes! I\'m a plumber specializing in disposals. Sounds like something is jammed or the motor is failing. When did it start?', sender: 'user', timestamp: '3 hours 50 min ago' },
      { id: '3', type: 'text', content: 'Yesterday. I tried the reset button but nothing. It just hums loudly.', sender: 'other', timestamp: '3 hours 45 min ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '3 hours 40 min ago', quoteData: { amount: 150, description: 'Garbage Disposal Repair - Diagnose and repair or replace if needed' } },
      { id: '5', type: 'text', content: 'Sounds good. Can you come tomorrow?', sender: 'other', timestamp: '3 hours 30 min ago' },
    ]
  },
  {
    id: 'conv_013',
    customerName: 'Mark Thompson',
    customerFirstName: 'Mark',
    customerLastName: 'Thompson',
    customerEmail: 'mark.thompson@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    service: 'Bathroom Renovation',
    amount: 8000,
    status: 'new_request',
    unreadCount: 0,
    createdAt: getTimeAgo(24),
    updatedAt: getTimeAgo(23),
    messages: [
      { id: '1', type: 'text', content: 'I need a complete bathroom renovation - new fixtures, tiles, plumbing, everything. It\'s a full gut job.', sender: 'other', timestamp: '1 day ago' },
      { id: '2', type: 'text', content: 'That\'s a major project! I specialize in full bathroom renovations. What\'s your timeline and budget?', sender: 'user', timestamp: '1 day ago' },
      { id: '3', type: 'text', content: 'Budget is around $8000, and I\'d like to start next month. Can you handle the whole project?', sender: 'other', timestamp: '1 day ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '1 day ago', quoteData: { amount: 8000, description: 'Complete Bathroom Renovation - Fixtures, tiles, plumbing, electrical, and installation' } },
      { id: '5', type: 'text', content: 'Perfect! Let\'s schedule a consultation to see the space and discuss details.', sender: 'other', timestamp: '1 day ago' },
    ]
  },
  {
    id: 'conv_014',
    customerName: 'Rachel Green',
    customerFirstName: 'Rachel',
    customerLastName: 'Green',
    customerEmail: 'rachel.green@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
    service: 'Water Heater Replacement',
    amount: 1200,
    status: 'new_request',
    unreadCount: 1,
    createdAt: getTimeAgo(3),
    updatedAt: getTimeAgo(2.5),
    messages: [
      { id: '1', type: 'text', content: 'My water heater is 12 years old and barely heating water anymore. I think it needs replacement.', sender: 'other', timestamp: '3 hours ago' },
      { id: '2', type: 'text', content: 'At 12 years, replacement is definitely the right call. What size is your current unit?', sender: 'user', timestamp: '2 hours 50 min ago' },
      { id: '3', type: 'text', content: 'It\'s a 50-gallon gas water heater. How much for a new one installed?', sender: 'other', timestamp: '2 hours 45 min ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '2 hours 40 min ago', quoteData: { amount: 1200, description: 'Water Heater Replacement - New 50-gal gas unit with installation and disposal' } },
      { id: '5', type: 'text', content: 'That\'s reasonable. How soon can you do it? We really need hot water!', sender: 'other', timestamp: '2 hours 35 min ago' },
    ]
  },
  {
    id: 'conv_015',
    customerName: 'Kevin Lee',
    customerFirstName: 'Kevin',
    customerLastName: 'Lee',
    customerEmail: 'kevin.lee@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    service: 'Kitchen Sink Installation',
    amount: 300,
    status: 'new_request',
    unreadCount: 0,
    createdAt: getTimeAgo(5),
    updatedAt: getTimeAgo(4.5),
    messages: [
      { id: '1', type: 'text', content: 'I need a new kitchen sink installed. I have all the materials ready - sink, faucet, everything.', sender: 'other', timestamp: '5 hours ago' },
      { id: '2', type: 'text', content: 'Great! Having the materials ready makes it easier. What type of sink - undermount or drop-in?', sender: 'user', timestamp: '4 hours 50 min ago' },
      { id: '3', type: 'text', content: 'It\'s an undermount stainless steel sink. How much for installation?', sender: 'other', timestamp: '4 hours 45 min ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '4 hours 40 min ago', quoteData: { amount: 300, description: 'Kitchen Sink Installation - Undermount sink with faucet and drain connections' } },
      { id: '5', type: 'text', content: 'Sounds good! When can you do it? Weekends work best for me.', sender: 'other', timestamp: '4 hours 35 min ago' },
    ]
  },
  {
    id: 'conv_016',
    customerName: 'Michelle White',
    customerFirstName: 'Michelle',
    customerLastName: 'White',
    customerEmail: 'michelle.white@example.com',
    customerAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    service: 'Faucet Repair',
    amount: 150,
    status: 'new_request',
    unreadCount: 0,
    createdAt: getTimeAgo(24),
    updatedAt: getTimeAgo(23.5),
    messages: [
      { id: '1', type: 'text', content: 'Kitchen faucet is dripping constantly, wasting water. Can you fix it?', sender: 'other', timestamp: '1 day ago' },
      { id: '2', type: 'text', content: 'Yes! I\'m a plumber. Dripping faucets are usually a worn cartridge or O-ring. Easy fix!', sender: 'user', timestamp: '1 day ago' },
      { id: '3', type: 'text', content: 'Great! How much would it cost to repair?', sender: 'other', timestamp: '1 day ago' },
      { id: '4', type: 'quote', content: '', sender: 'user', timestamp: '1 day ago', quoteData: { amount: 150, description: 'Faucet Repair - Replace cartridge and seals, stop dripping' } },
      { id: '5', type: 'text', content: 'Perfect! I\'m available this week evenings.', sender: 'other', timestamp: '1 day ago' },
    ]
  },
];

// Helper function to get conversation by customer name
export const getConversationByName = (customerName: string): MockConversation | undefined => {
  const normalizedName = customerName.toLowerCase().trim();
  return MOCK_CONVERSATIONS.find(conv => 
    conv.customerName.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(conv.customerFirstName.toLowerCase()) ||
    normalizedName.includes(conv.customerLastName.toLowerCase())
  );
};

// Helper function to get last message from conversation
export const getLastMessage = (conversationId: string): string => {
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation || conversation.messages.length === 0) return 'No messages yet';
  
  const lastMsg = conversation.messages[conversation.messages.length - 1];
  return lastMsg.content || 'No messages yet';
};

// Helper function to format conversations for ChatListScreen
export const getFormattedConversationsForList = () => {
  return MOCK_CONVERSATIONS.map(conv => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    
    // Generate proper preview text based on message type
    let previewContent = lastMsg.content;
    if (lastMsg.type === 'quote' && lastMsg.quoteData) {
      previewContent = `💰 Quote sent: $${lastMsg.quoteData.amount}`;
    } else if (lastMsg.type === 'appointment' && lastMsg.appointmentData) {
      previewContent = `📅 Appointment: ${lastMsg.appointmentData.date} at ${lastMsg.appointmentData.time}`;
    } else if (lastMsg.type === 'image') {
      previewContent = lastMsg.content || '📷 Photo';
    }
    
    return {
      id: conv.id,
      title: conv.customerName,
      conversationType: 'direct' as const,
      participants: [
        { 
          userId: conv.id.replace('conv_', 'user_'), 
          firstName: conv.customerFirstName, 
          lastName: conv.customerLastName, 
          email: conv.customerEmail, 
          avatarUrl: conv.customerAvatar 
        }
      ],
      lastMessage: {
        id: lastMsg.id,
        conversationId: conv.id,
        content: previewContent,
        senderId: lastMsg.sender === 'user' ? 'vendor_1' : conv.id.replace('conv_', 'user_'),
        createdAt: conv.updatedAt,
        updatedAt: conv.updatedAt,
        messageType: 'text' as const,
        metadata: { 
          serviceDetails: { 
            service: conv.service, 
            amount: conv.amount, 
            customerAvatar: conv.customerAvatar,
            customerName: conv.customerName,
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
          customerName: conv.customerName, 
          customerAvatar: conv.customerAvatar,
          status: conv.status
        } 
      },
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      deletedAt: null
    };
  });
};
