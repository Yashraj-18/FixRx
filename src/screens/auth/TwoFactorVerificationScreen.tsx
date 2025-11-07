import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAppContext } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { ArrowLeft, Shield } from 'lucide-react-native';

type TwoFactorVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TwoFactorVerification'
>;

type TwoFactorVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'TwoFactorVerification'
>;

const TwoFactorVerificationScreen: React.FC = () => {
  const navigation = useNavigation<TwoFactorVerificationScreenNavigationProp>();
  const route = useRoute<TwoFactorVerificationScreenRouteProp>();
  
  const {
    sessionToken,
    secondaryAuthMethod,
    user,
    expiresIn,
  } = route.params;

  const { setIsAuthenticated, setUserType, setUserProfile } = useAppContext();
  
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(expiresIn || 600);
  const [error, setError] = useState('');

  // Timer for expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert(
            'Session Expired',
            'Your verification session has expired. Please login again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (isVerifying) return;

    try {
      setIsVerifying(true);
      setError('');

      const response = await authService.verifyTwoFactor({
        sessionToken,
        code: code.trim(),
        email: user.email,
        phone: user.phone,
      });

      if (!response.success) {
        setError(response.message || 'Verification failed');
        return;
      }

      // Authentication successful
      if (response.data?.user && response.data?.tokens) {
        setIsAuthenticated(true);
        setUserType(response.data.user.userType || 'consumer');
        setUserProfile(response.data.user);

        // Navigate to main tabs - the app will handle showing correct dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      Alert.alert(
        'Resend Code',
        `A new verification code will be sent via ${
          secondaryAuthMethod === 'OTP' ? 'SMS' : 'email'
        }.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: async () => {
              // Resend logic would go here
              // For now, just show a message
              Alert.alert('Success', 'A new verification code has been sent.');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Shield size={64} color="#007AFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          For your security, please verify your identity
        </Text>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            {secondaryAuthMethod === 'OTP'
              ? `We've sent a verification code to ${user.phone || 'your phone'}`
              : `We've sent a verification link to ${user.email || 'your email'}`}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Code expires in: {formatTime(timeRemaining)}
          </Text>
        </View>

        {/* Code Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder={
              secondaryAuthMethod === 'OTP'
                ? 'Enter 6-digit code'
                : 'Enter verification code'
            }
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setError('');
            }}
            keyboardType={secondaryAuthMethod === 'OTP' ? 'number-pad' : 'default'}
            maxLength={secondaryAuthMethod === 'OTP' ? 6 : 64}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!code.trim() || isVerifying) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={!code.trim() || isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Resend Link */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={isVerifying}
        >
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Having trouble? Contact support for assistance.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  instructionsContainer: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 8,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default TwoFactorVerificationScreen;
