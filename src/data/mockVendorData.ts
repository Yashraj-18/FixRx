// Comprehensive mock data for vendor dashboard
export interface Appointment {
  id: string;
  customerName: string;
  customerAvatar: string;
  service: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'in-progress' | 'cancelled';
  address: string;
  phone: string;
  amount: number;
  quoteId?: string;
  notes?: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  customerNotes?: string;
  serviceHistory?: {
    date: string;
    service: string;
    amount: number;
  }[];
}

export interface ServiceRequest {
  id: string;
  customerName: string;
  customerAvatar: string;
  service: string;
  description: string;
  requestDate: string;
  urgency: 'emergency' | 'urgent' | 'normal' | 'flexible';
  address: string;
  phone: string;
  email?: string;
  estimatedBudget?: number;
  preferredDate?: string;
  preferredTime?: string;
  images?: string[];
  status: 'new' | 'quoted' | 'accepted' | 'declined';
  distance: number; // in miles
  customerNotes?: string;
  propertyType?: 'house' | 'apartment' | 'condo' | 'commercial';
  serviceArea?: string;
  availability?: {
    weekdays: boolean[];
    timeWindows: string[];
  };
}

export interface Quote {
  id: string;
  requestId: string;
  customerName: string;
  service: string;
  amount: number;
  description: string;
  breakdown?: {
    labor: number;
    materials: number;
    fees: number;
  };
  validUntil: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdDate: string;
  notes?: string;
  terms?: string;
  warranty?: {
    duration: string;
    coverage: string;
  };
}

// Helper function to generate random dates with time
const getRandomDate = (start: Date, end: Date, includeTime: boolean = false): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  if (!includeTime) return date.toISOString().split('T')[0];
  
  // Add random time between 8 AM and 6 PM
  const hours = Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
  date.setHours(hours, minutes, 0, 0);
  
  return date.toISOString();
};

// Helper to format date as 'Today', 'Tomorrow', or day name
const formatRelativeDate = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Helper to generate random phone number
const randomPhoneNumber = (): string => {
  const areaCode = Math.floor(100 + Math.random() * 900);
  const prefix = Math.floor(100 + Math.random() * 900);
  const lineNumber = Math.floor(1000 + Math.random() * 9000);
  return `(${areaCode}) ${prefix}-${lineNumber}`;
};

// Helper to generate random address
const randomAddress = (): string => {
  const streets = ['Main St', 'Oak Ave', 'Pine St', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Birch Rd'];
  const cities = ['Boston', 'Cambridge', 'Somerville', 'Brookline', 'Quincy', 'Newton'];
  const states = ['MA', 'NH', 'RI', 'CT'];
  
  return `${Math.floor(100 + Math.random() * 9000)} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]} ${Math.floor(10000 + Math.random() * 90000)}`;
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  // Upcoming Appointments - DIVERSE SERVICES
  {
    id: 'apt_001',
    customerName: 'Sarah Johnson',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    service: 'Electrical Outlet Installation',
    date: 'Today',
    time: '2:00 PM',
    status: 'upcoming',
    address: '123 Oak Street, Boston, MA',
    phone: '+1 (555) 123-4567',
    amount: 185,
    quoteId: 'quote_001',
    notes: 'Customer needs 3 new outlets in home office',
    duration: '1.5 hours',
    priority: 'high'
  },
  {
    id: 'apt_002',
    customerName: 'Mike Rodriguez',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    service: 'HVAC System Repair',
    date: 'Tomorrow',
    time: '10:00 AM',
    status: 'upcoming',
    address: '456 Pine Avenue, Cambridge, MA',
    phone: '+1 (555) 234-5678',
    amount: 320,
    quoteId: 'quote_002',
    notes: 'AC not cooling properly, needs inspection',
    duration: '2 hours',
    priority: 'medium'
  },
  {
    id: 'apt_003',
    customerName: 'Emily Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    service: 'Interior Painting',
    date: 'Saturday',
    time: '9:00 AM',
    status: 'upcoming',
    address: '789 Maple Drive, Somerville, MA',
    phone: '+1 (555) 345-6789',
    amount: 450,
    duration: '4 hours',
    priority: 'low'
  },
  {
    id: 'apt_004',
    customerName: 'David Wilson',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    service: 'Cabinet Door Repair',
    date: 'Monday',
    time: '1:00 PM',
    status: 'upcoming',
    address: '321 Elm Street, Arlington, MA',
    phone: '+1 (555) 456-7890',
    amount: 150,
    notes: 'Kitchen cabinet hinges need replacement',
    duration: '1 hour',
    priority: 'medium'
  },
  
  // Completed Appointments - DIVERSE SERVICES
  {
    id: 'apt_005',
    customerName: 'Lisa Martinez',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    service: 'Appliance Repair - Washing Machine',
    date: 'Yesterday',
    time: '11:00 AM',
    status: 'completed',
    address: '654 Cedar Lane, Medford, MA',
    phone: '+1 (555) 567-8901',
    amount: 225,
    quoteId: 'quote_005',
    notes: 'Fixed drum bearing, customer very satisfied',
    duration: '1.5 hours',
    priority: 'medium'
  },
  {
    id: 'apt_006',
    customerName: 'John Smith',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    service: 'Roof Leak Repair',
    date: 'Monday',
    time: '3:30 PM',
    status: 'completed',
    address: '987 Birch Road, Brookline, MA',
    phone: '+1 (555) 678-9012',
    amount: 375,
    notes: 'Emergency roof repair, shingles replaced',
    duration: '2 hours',
    priority: 'high'
  },
  {
    id: 'apt_007',
    customerName: 'Amanda Taylor',
    customerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    service: 'Landscape Design Consultation',
    date: 'Last Friday',
    time: '2:00 PM',
    status: 'completed',
    address: '147 Spruce Street, Newton, MA',
    phone: '+1 (555) 789-0123',
    amount: 180,
    quoteId: 'quote_007',
    notes: 'Provided full backyard redesign plan',
    duration: '1.5 hours',
    priority: 'medium'
  },
  {
    id: 'apt_008',
    customerName: 'Robert Brown',
    customerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    service: 'Ceiling Fan Installation',
    date: 'Last Thursday',
    time: '10:30 AM',
    status: 'completed',
    address: '258 Willow Avenue, Quincy, MA',
    phone: '+1 (555) 890-1234',
    amount: 220,
    notes: 'Installed 3 ceiling fans in bedrooms',
    duration: '2.5 hours',
    priority: 'medium'
  }
];

export const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'req_001',
    customerName: 'Jennifer Davis',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    service: 'Garage Door Repair',
    description: 'Garage door won\'t open. Motor makes noise but door doesn\'t move. Need urgent repair.',
    requestDate: new Date().toISOString(),
    urgency: 'emergency',
    address: '123 Main St, Anytown, USA',
    phone: '+1 (555) 123-4567',
    estimatedBudget: 275,
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    preferredTime: 'Morning',
    images: [
      'https://images.unsplash.com/photo-1556911220-bf0637716988?w=800&q=80',
      'https://images.unsplash.com/photo-1556910637-9eaa32184771?w=800&q=80'
    ],
    status: 'new',
    distance: 2.5
  },
  {
    id: 'req_002',
    customerName: 'Michael Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    service: 'Deck Staining & Sealing',
    description: 'Need entire back deck stained and sealed. About 400 sq ft. Wood is weathered.',
    requestDate: new Date().toISOString(),
    urgency: 'normal',
    address: '456 Oak Ave, Anytown, USA',
    phone: '+1 (555) 987-6543',
    estimatedBudget: 850,
    preferredDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], // 5 days from now
    preferredTime: 'Afternoon',
    status: 'new',
    distance: 1.8
  },
  {
    id: 'req_003',
    customerName: 'Sarah Johnson',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    service: 'Smart Thermostat Installation',
    description: 'Want to install Nest thermostat. Need electrician to wire it properly with HVAC system.',
    requestDate: new Date().toISOString(),
    urgency: 'urgent',
    address: '789 Pine St, Anytown, USA',
    phone: '+1 (555) 456-7890',
    estimatedBudget: 195,
    preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // 2 days from now
    preferredTime: 'Morning',
    status: 'new',
    distance: 3.2
  },
  {
    id: 'req_004',
    customerName: 'Robert Wilson',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    service: 'Toilet Installation',
    description: 'Need to install a new toilet in the guest bathroom. Already purchased the toilet.',
    requestDate: new Date().toISOString(),
    urgency: 'normal',
    address: '321 Elm St, Anytown, USA',
    phone: '+1 (555) 654-3210',
    estimatedBudget: 200,
    preferredDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days from now
    preferredTime: 'Afternoon',
    status: 'new',
    distance: 0.8
  },
  {
    id: 'req_005',
    customerName: 'Emily Parker',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    service: 'Garbage Disposal Repair',
    description: 'Garbage disposal is making loud noises and not working properly.',
    requestDate: new Date().toISOString(),
    urgency: 'urgent',
    address: '159 Maple Dr, Anytown, USA',
    phone: '+1 (555) 789-0123',
    estimatedBudget: 150,
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    preferredTime: 'Evening',
    status: 'new',
    distance: 1.2
  },
  {
    id: 'req_007',
    customerName: 'Mark Thompson',
    customerAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    service: 'Bathroom Renovation',
    description: 'Complete bathroom renovation including new fixtures, tiles, and plumbing.',
    requestDate: '1 day ago',
    urgency: 'normal',
    address: '753 Commonwealth Ave, Boston, MA',
    phone: '+1 (555) 012-3456',
    estimatedBudget: 8000,
    preferredDate: 'Next month',
    preferredTime: 'Weekdays',
    status: 'new',
    distance: 4.7
  },
  {
    id: 'req_008',
    customerName: 'Rachel Green',
    customerAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
    service: 'Water Heater Replacement',
    description: 'Old water heater not working properly, need replacement.',
    requestDate: '3 hours ago',
    urgency: 'urgent',
    address: '426 Washington Street, Brighton, MA',
    phone: '+1 (555) 123-4567',
    estimatedBudget: 1200,
    preferredDate: 'This week',
    preferredTime: 'Morning',
    status: 'new',
    distance: 1.8
  },
  {
    id: 'req_009',
    customerName: 'Kevin Lee',
    customerAvatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    service: 'Kitchen Sink Installation',
    description: 'Need new kitchen sink installed, have all materials ready.',
    requestDate: '5 hours ago',
    urgency: 'normal',
    address: '892 Beacon Street, Brookline, MA',
    phone: '+1 (555) 234-5678',
    estimatedBudget: 300,
    preferredDate: 'Weekend',
    preferredTime: 'Afternoon',
    status: 'new',
    distance: 3.2
  },
  {
    id: 'req_010',
    customerName: 'Michelle White',
    customerAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    service: 'Faucet Repair',
    description: 'Kitchen faucet is dripping constantly, wasting water.',
    requestDate: '1 day ago',
    urgency: 'normal',
    address: '367 Harvard Street, Cambridge, MA',
    phone: '+1 (555) 345-6789',
    estimatedBudget: 150,
    preferredDate: 'This week',
    preferredTime: 'Evening',
    status: 'new',
    distance: 2.9
  },
  {
    id: 'req_006',
    customerName: 'Steven Garcia',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    service: 'Toilet Repair',
    description: 'Toilet keeps running and won\'t stop filling.',
    requestDate: '6 hours ago',
    urgency: 'urgent',
    address: '741 Mass Ave, Arlington, MA',
    phone: '+1 (555) 456-7890',
    estimatedBudget: 200,
    preferredDate: 'Tomorrow',
    preferredTime: 'Morning',
    status: 'new',
    distance: 5.1
  }
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'quote_001',
    requestId: 'req_001',
    customerName: 'Sarah Johnson',
    service: 'Kitchen Sink Repair',
    amount: 185,
    description: 'Repair kitchen sink including parts and labor',
    validUntil: '2024-01-20',
    status: 'accepted',
    createdDate: '2024-01-15'
  },
  {
    id: 'quote_002',
    requestId: 'req_002',
    customerName: 'Mike Rodriguez',
    service: 'Toilet Installation',
    amount: 320,
    description: 'Complete toilet installation with new wax ring and bolts',
    validUntil: '2024-01-22',
    status: 'accepted',
    createdDate: '2024-01-16'
  },
  {
    id: 'quote_005',
    requestId: 'req_005',
    customerName: 'Lisa Martinez',
    service: 'Bathroom Faucet Installation',
    amount: 225,
    description: 'Install new bathroom faucet with supply lines',
    validUntil: '2024-01-18',
    status: 'accepted',
    createdDate: '2024-01-14'
  },
  {
    id: 'quote_007',
    requestId: 'req_007',
    customerName: 'Amanda Taylor',
    service: 'Garbage Disposal Installation',
    amount: 280,
    description: 'Install new garbage disposal unit with electrical connection',
    validUntil: '2024-01-19',
    status: 'accepted',
    createdDate: '2024-01-16'
  },
  {
    id: 'quote_005',
    requestId: 'req_005',
    customerName: 'David Lee',
    service: 'Emergency Pipe Burst',
    amount: 500,
    description: 'Fix pipe burst in basement',
    validUntil: '2024-01-20',
    status: 'accepted',
    createdDate: '2024-01-17'
  },
  {
    id: 'quote_006',
    requestId: 'req_006',
    customerName: 'Mark Thompson',
    service: 'Bathroom Renovation',
    amount: 8000,
    description: 'Complete bathroom renovation including new fixtures, tiles, and plumbing',
    validUntil: '2024-01-22',
    status: 'accepted',
    createdDate: '2024-01-18'
  },
  {
    id: 'quote_007',
    requestId: 'req_007',
    customerName: 'Rachel Green',
    service: 'Water Heater Replacement',
    amount: 1200,
    description: 'Replace old water heater with new one',
    validUntil: '2024-01-21',
    status: 'accepted',
    createdDate: '2024-01-19'
  },
  {
    id: 'quote_008',
    requestId: 'req_008',
    customerName: 'Kevin Lee',
    service: 'Kitchen Sink Installation',
    amount: 300,
    description: 'Install new kitchen sink',
    validUntil: '2024-01-23',
    status: 'accepted',
    createdDate: '2024-01-20'
  },
  {
    id: 'quote_009',
    requestId: 'req_009',
    customerName: 'Michelle White',
    service: 'Faucet Repair',
    amount: 150,
    description: 'Fix kitchen faucet',
    validUntil: '2024-01-24',
    status: 'accepted',
    createdDate: '2024-01-21'
  },
  {
    id: 'quote_010',
    requestId: 'req_010',
    customerName: 'Steven Garcia',
    service: 'Toilet Repair',
    amount: 200,
    description: 'Fix toilet',
    validUntil: '2024-01-25',
    status: 'accepted',
    createdDate: '2024-01-22'
  }
];

export const getUpcomingAppointments = (): Appointment[] => {
  return MOCK_APPOINTMENTS.filter(appt => appt.status === 'upcoming' || appt.status === 'in-progress');
};

export const getCompletedAppointments = (): Appointment[] => {
  return MOCK_APPOINTMENTS.filter(appt => appt.status === 'completed' || appt.status === 'cancelled');
};

export const getNewRequests = (): ServiceRequest[] => {
  // Sort by urgency: emergency > urgent > normal > flexible
  return [...MOCK_SERVICE_REQUESTS]
    .filter(req => req.status === 'new' || req.status === 'quoted')
    .sort((a, b) => {
      const urgencyOrder = { emergency: 0, urgent: 1, normal: 2, flexible: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
};

export const getQuoteForAppointment = (appointmentId: string): Quote | undefined => {
  const appointment = MOCK_APPOINTMENTS.find(apt => apt.id === appointmentId);
  if (appointment?.quoteId) {
    return MOCK_QUOTES.find(quote => quote.id === appointment.quoteId);
  }
  return undefined;
};
