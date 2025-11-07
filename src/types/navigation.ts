import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Flow
  Welcome: undefined;
  EmailAuth: undefined;
  PhoneAuth: undefined;
  EmailConfirmation: { email: string };
  UserType: undefined;
  TwoFactorVerification: {
    sessionToken: string;
    secondaryAuthMethod: 'OTP' | 'MAGIC_LINK';
    user: {
      id: string;
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
    };
    expiresIn: number;
  };
  
  // Consumer Onboarding
  ConsumerProfile: undefined;
  
  // Vendor Onboarding
  VendorProfileSetup: undefined;
  ServiceSelection: undefined;
  VendorServiceSelection: undefined;
  LocationSetup: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  EditProfile: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PaymentMethods: undefined;
  Security: undefined;
  HelpCenter: undefined;
  HelpSupport: undefined;
  About: undefined;
  Messaging: { 
    conversationId: string;
    customerName?: string;
    userName?: string;
    userImage?: string;
    isOnline?: boolean;
    serviceDetails?: any;
  };
  ChatList: undefined;
  Rating: undefined;
  AllRecommendations: undefined;
  ContactSelection: { inviteType: 'contractor' | 'friend' | 'client' };
  MessagePreview: { 
    selectedContacts?: any[];
    inviteType?: 'contractor' | 'friend' | 'client';
  };
  InvitationSuccess: {
    invitationCount: number;
    inviteType: 'contractor' | 'friend' | 'client';
  };
  ContractorProfile: {
    contractor?: any;
  };
  Payment: {
    amount: number;
    serviceRequestId: string;
    vendorId: string;
  };
  InvoiceUpload: undefined;
  Contractors: undefined;
  Profile: undefined;
  Notifications: undefined;
  RatingConfirmation: { rating: number; comment: string };
  FriendsUsingVendor: { vendorId: string };
  ServiceRequestDetail: { request?: any; requestId?: string };
  VendorPortfolioUpload: undefined;
  Loading: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contractors: undefined;
  Messages: undefined;
  Profile: undefined;
  // Vendor specific screens
  VendorHome: undefined;
  VendorNotifications: undefined;
  VendorAppointments: undefined;
  VendorSchedule: undefined;
  VendorEarnings: undefined;
  VendorClients: undefined;
  VendorInvitation: { inviteType?: 'contractor' | 'friend' | 'client' } | undefined;
  NotificationSettings: undefined;
};

export type UserType = 'consumer' | 'vendor' | null;

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: UserType;
  avatar?: string;
  profileImage?: string; // Alias for avatar
  businessName?: string;
  metroArea?: string;
  services?: string[];
  portfolio?: any[];
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
