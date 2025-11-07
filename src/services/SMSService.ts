import * as SMS from 'expo-sms';
import { Alert, Platform } from 'react-native';

export interface SMSMessage {
  phoneNumber: string;
  message: string;
  recipientName?: string;
}

class SMSService {
  /**
   * Check if SMS is available on the device
   * @returns Promise<boolean>
   */
  async isAvailable(): Promise<boolean> {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      return isAvailable;
    } catch (error) {
      console.error('Error checking SMS availability:', error);
      return false;
    }
  }

  /**
   * Send SMS to a single recipient
   * @param phoneNumber - Recipient phone number
   * @param message - SMS message content
   * @returns Promise<boolean> - true if sent successfully
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        Alert.alert(
          'SMS Not Available',
          'SMS messaging is not available on this device.',
          [{ text: 'OK' }]
        );
        return false;
      }

      const { result } = await SMS.sendSMSAsync([phoneNumber], message);
      
      return result === 'sent';
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send SMS to multiple recipients
   * @param messages - Array of SMS messages to send
   * @returns Promise<{sent: number, failed: number}>
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<{ sent: number; failed: number }> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        Alert.alert(
          'SMS Not Available',
          'SMS messaging is not available on this device.',
          [{ text: 'OK' }]
        );
        return { sent: 0, failed: messages.length };
      }

      // Prepare all phone numbers and a combined message
      const phoneNumbers = messages.map(m => m.phoneNumber);
      
      // For bulk SMS, we'll use the first message as template
      // In a real app, you might want to customize each message
      const message = messages[0]?.message || '';

      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      
      if (result === 'sent') {
        return { sent: messages.length, failed: 0 };
      } else {
        return { sent: 0, failed: messages.length };
      }
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      return { sent: 0, failed: messages.length };
    }
  }

  /**
   * Generate invitation message for a contractor (vendor-to-vendor)
   * @param recipientName - Name of the recipient
   * @param senderName - Name of the sender
   * @param referralCode - Referral code
   * @returns Formatted invitation message
   */
  generateInvitationMessage(recipientName: string, senderName: string, referralCode: string): string {
    const firstName = recipientName.split(' ')[0];
    
    return `Hi ${firstName}! 👋

${senderName} invited you to join FixRx - the #1 platform for service professionals!

🎁 Special Offer:
• Get more customers
• Easy scheduling & payments
• Earn $30 signup bonus

Use referral code: ${referralCode}

Download now: https://fixrx.app/join

Questions? Reply to ${senderName}`;
  }

  /**
   * Generate invitation message for a friend (vendor-to-friend or consumer-to-friend)
   * @param recipientName - Name of the recipient
   * @param senderName - Name of the sender
   * @param referralCode - Referral code
   * @returns Formatted invitation message
   */
  generateFriendInvitationMessage(recipientName: string, senderName: string, referralCode: string): string {
    const firstName = recipientName.split(' ')[0];
    
    return `Hey ${firstName}! 👋

${senderName} here! I've been using FixRx to find trusted contractors and wanted to share it with you.

✨ Why you'll love it:
• Find reliable service pros
• Get recommendations from friends
• Easy booking & secure payments

Use my code: ${referralCode}

Download: https://fixrx.app/join

Let me know what you think!`;
  }

  /**
   * Generate invitation message for a client (vendor-to-client)
   * @param recipientName - Name of the recipient
   * @param senderName - Name of the sender
   * @param referralCode - Referral code
   * @returns Formatted invitation message
   */
  generateClientInvitationMessage(recipientName: string, senderName: string, referralCode: string): string {
    const firstName = recipientName.split(' ')[0];
    
    return `Hi ${firstName}! 👋

This is ${senderName}. I'm now on FixRx - a platform that makes booking and managing services easier for both of us!

💼 Benefits for you:
• Easy online booking
• Secure payments
• Track service history
• Direct messaging

Use my code: ${referralCode}

Download: https://fixrx.app/join

Looking forward to working with you!`;
  }

  /**
   * Generate invitation message for adding contractors (consumer-to-contractor)
   * @param recipientName - Name of the recipient
   * @param senderName - Name of the sender
   * @param referralCode - Referral code
   * @returns Formatted invitation message
   */
  generateContractorInvitationMessage(recipientName: string, senderName: string, referralCode: string): string {
    const firstName = recipientName.split(' ')[0];
    
    return `Hi ${firstName}! 👋

${senderName} here! I think you'd be a great fit for FixRx - a platform connecting service professionals with clients.

🚀 Grow your business:
• Get more clients
• Manage bookings easily
• Secure payments
• Build your reputation

Use code: ${referralCode}

Join now: https://fixrx.app/join

Let's connect!`;
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (10 digits for US, or 11 with country code)
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
  }

  /**
   * Clean phone number for SMS sending
   * @param phoneNumber - Raw phone number
   * @returns Cleaned phone number with country code preserved
   */
  cleanPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If it already has a + prefix (country code), keep it as-is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // If it's 11+ digits starting with a country code (no +), add the +
    if (cleaned.length >= 11) {
      return `+${cleaned}`;
    }
    
    // For 10 digits or less without country code, return as-is
    // Let the SMS system handle it based on device locale
    return cleaned;
  }
}

export default new SMSService();
