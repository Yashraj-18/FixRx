import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import CountryCodeDropdown from '../../components/CountryCodeDropdown';
import { authService } from '../../services/authService';
import { useAppContext } from '../../context/AppContext';

type PhoneAuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhoneAuth'>;

const PhoneAuthScreen = () => {
  const [countryCode, setCountryCode] = useState('+1');
  const [countryFlag, setCountryFlag] = useState('US');
  const [countryName, setCountryName] = useState('United States');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirm, setConfirm] = useState<boolean>(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [userType, setUserType] = useState<'CONSUMER' | 'VENDOR'>('CONSUMER');
  const [devCode, setDevCode] = useState<string | null>(null);
  const { authenticateUser, setUserType: setContextUserType } = useAppContext();
  const navigation = useNavigation<PhoneAuthScreenNavigationProp>();

  const handleCountrySelect = (code: string, flag: string, country: string) => {
    setCountryCode(code);
    setCountryFlag(flag);
    setCountryName(country);
  };

  const handlePhoneNumberChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    
    if (countryCode === '+1') {
      if (digitsOnly.length <= 10) {
        let formatted = digitsOnly;
        if (digitsOnly.length > 3 && digitsOnly.length <= 6) {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
        } else if (digitsOnly.length > 6) {
          formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
        } else if (digitsOnly.length > 0) {
          formatted = digitsOnly.length <= 3 ? digitsOnly : `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
        }
        setPhoneNumber(formatted);
      }
    } else {
      setPhoneNumber(digitsOnly);
    }
  };

  const formattedPhoneNumber = useMemo(() => {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    return `${countryCode}${digitsOnly}`;
  }, [countryCode, phoneNumber]);

  const isPhoneValid = useMemo(() => {
    const digitsOnly = phoneNumber.replace(/[^0-9]/g, '');
    if (countryCode === '+1') {
      return digitsOnly.length === 10;
    }
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(formattedPhoneNumber);
  }, [countryCode, phoneNumber, formattedPhoneNumber]);

  const handleSendCode = async () => {
    if (!phoneNumber || !isPhoneValid) {
      Alert.alert('Error', 'Please enter a valid phone number in the format +1234567890');
      return;
    }

    if (isSendingCode) {
      return;
    }

    try {
      setIsSendingCode(true);

      console.log('[PhoneAuth] Sending OTP to:', formattedPhoneNumber);
      const response = await authService.sendOtp({ 
        phone: formattedPhoneNumber, 
        userType: userType 
      });

      console.log('[PhoneAuth] OTP Response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        const retryAfter = response.data?.retryAfterSeconds;
        const details = retryAfter ? ` Please wait ${retryAfter} seconds before trying again.` : '';
        const errorMsg = `${response.message || 'Failed to send verification code'}${details}`.trim();
        console.log('[PhoneAuth] OTP Error:', errorMsg);
        Alert.alert('Error', errorMsg);
        return;
      }

      setConfirm(true);
      setVerificationCode('');
      
      // Store dev code if available
      if (response.data?.devCode) {
        setDevCode(response.data.devCode);
      }

      const devNote = response.data?.devCode ? `\n\nDevelopment code: ${response.data.devCode}` : '';
      const message = response.message || `Verification code sent to ${formattedPhoneNumber}`;
      const successMsg = `${message}${devNote}`.trim();
      console.log('[PhoneAuth] OTP Success:', successMsg);
      
      // Use setTimeout to ensure Alert shows after state updates
      setTimeout(() => {
        Alert.alert('Success', successMsg);
      }, 100);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (isVerifyingCode) {
      return;
    }

    try {
      setIsVerifyingCode(true);

      console.log('[PhoneAuth] Verifying OTP for:', formattedPhoneNumber, 'Code:', verificationCode, 'UserType:', userType);
      const response = await authService.verifyOtp({
        phone: formattedPhoneNumber,
        code: verificationCode.trim(),
        userType: userType
      });

      console.log('[PhoneAuth] Verify Response:', JSON.stringify(response, null, 2));

      if (!response.success || !response.data?.user) {
        const errorMsg = response.message || 'Invalid verification code';
        console.log('[PhoneAuth] Verify Error:', errorMsg);
        Alert.alert('Error', errorMsg);
        return;
      }

      console.log('[PhoneAuth] OTP Verified successfully');
      
      // Check if this is completing 2FA (user came from email auth)
      const pending2FA = await AsyncStorage.getItem('pending_2fa_user');
      
      if (pending2FA) {
        console.log('[PhoneAuth] Completing 2FA after phone verification');
        const pendingData = JSON.parse(pending2FA);
        await AsyncStorage.removeItem('pending_2fa_user');
        
        // Both factors verified - use the userType selected on THIS screen (not from pending data)
        const userWithType = {
          ...pendingData.user,
          userType: userType.toLowerCase() as 'consumer' | 'vendor' // Use current screen selection
        };
        
        console.log('[PhoneAuth] Completing 2FA with userType:', {
          selectedUserType: userType,
          pendingUserType: pendingData.user.userType,
          finalUserType: userWithType.userType,
          isNewUser: pendingData.isNewUser
        });
        
        await authenticateUser(userWithType, { 
          isNewUser: pendingData.isNewUser
        });
        return;
      }
      
      // 2FA: ALL users (new and existing) must verify email as second factor
      console.log('[PhoneAuth] Requiring email verification for 2FA');
      
      // Store user data temporarily for after email verification
      await AsyncStorage.setItem('pending_2fa_user', JSON.stringify({
        user: response.data.user,
        token: response.data.token,
        userType: userType,
        isNewUser: response.data.isNewUser,
        firstFactor: 'phone'
      }));
      
      Alert.alert(
        'Two-Factor Authentication',
        'Please verify your email address to continue.',
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('EmailAuth');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Verify exception:', error);
      Alert.alert('Error', 'Invalid verification code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResendCode = () => {
    if (isSendingCode || isVerifyingCode) {
      return;
    }
    handleSendCode();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Phone Verification</Text>
      
      {!confirm ? (
        <>
          <Text style={styles.subtitle}>Enter your phone number to receive a verification code</Text>
          
          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.userTypeLabel}>I am a:</Text>
            <View style={styles.userTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'CONSUMER' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('CONSUMER')}
              >
                <Text style={[
                  styles.userTypeButtonText,
                  userType === 'CONSUMER' && styles.userTypeButtonTextActive
                ]}>
                  Consumer
                </Text>
                <Text style={styles.userTypeDescription}>Looking for services</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'VENDOR' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('VENDOR')}
              >
                <Text style={[
                  styles.userTypeButtonText,
                  userType === 'VENDOR' && styles.userTypeButtonTextActive
                ]}>
                  Vendor
                </Text>
                <Text style={styles.userTypeDescription}>Providing services</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.phoneInputContainer}>
            {/* Country Code Dropdown */}
            <CountryCodeDropdown
              value={countryCode}
              flag={countryFlag}
              onSelect={handleCountrySelect}
            />

            {/* Phone Number Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!isPhoneValid || isSendingCode) && styles.buttonDisabled
            ]}
            onPress={handleSendCode}
            disabled={!isPhoneValid || isSendingCode}
            activeOpacity={(!isPhoneValid || isSendingCode) ? 1 : 0.7}
          >
            <Text style={styles.buttonText}>Send Verification Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Enter the verification code sent to {countryCode} {phoneNumber}
          </Text>
          
          {/* Show dev code prominently in development mode */}
          {devCode && (
            <View style={styles.devCodeContainer}>
              <Text style={styles.devCodeLabel}>Development Code:</Text>
              <Text style={styles.devCodeText}>{devCode}</Text>
            </View>
          )}
          
          <TextInput
            style={styles.verificationInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter 6-digit code"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyCode}
            disabled={isVerifyingCode}
            activeOpacity={isVerifyingCode ? 1 : 0.7}
          >
            <Text style={styles.buttonText}>Verify Code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isSendingCode || isVerifyingCode}
          >
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  verificationInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  resendText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  userTypeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  userTypeButtonTextActive: {
    color: '#2563EB',
  },
  userTypeDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  devCodeContainer: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  devCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  devCodeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 4,
  },
});

export default PhoneAuthScreen;
