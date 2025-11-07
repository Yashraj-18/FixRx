import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useAppContext } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { shouldCallBackend } from '../../config/demo';

const { width } = Dimensions.get('window');

type UserTypeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserType'>;

const UserTypeSelectionScreen: React.FC = () => {
  const navigation = useNavigation<UserTypeScreenNavigationProp>();
  const { setUserType, setUserProfile } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleUserTypeSelect = async (type: 'consumer' | 'vendor') => {
    console.log('User selected role:', type);
    setIsLoading(true);
    
    try {
      // Update userType in context
      setUserType(type);
      
      // Check if we should call backend (controlled by demo config)
      if (shouldCallBackend()) {
        console.log('🔄 Updating userType in backend...');
        const response = await authService.updateUserType(type);
        
        if (response.success && response.data) {
          console.log('✅ UserType updated in backend:', type);
          setUserProfile(response.data);
        } else {
          console.warn('⚠️ Backend update failed, continuing with local state');
        }
      } else {
        console.log('📱 Demo mode: UserType set locally only (no backend call)');
      }
      
      // Navigate to appropriate profile setup
      if (type === 'consumer') {
        navigation.navigate('ConsumerProfile');
      } else {
        navigation.navigate('VendorProfileSetup');
      }
    } catch (error) {
      console.error('❌ Error updating userType:', error);
      // Still navigate even if backend fails
      if (type === 'consumer') {
        navigation.navigate('ConsumerProfile');
      } else {
        navigation.navigate('VendorProfileSetup');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Pagination dots */}
        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.paginationDotActive]} />
          <View style={[styles.paginationDot, styles.paginationDotActive]} />
          <View style={[styles.paginationDot, styles.paginationDotActive]} />
          <View style={styles.paginationDot} />
        </View>
        
        {/* Title */}
        <Text style={styles.title}>How will you use FixRx?</Text>
        <Text style={styles.subtitle}>Choose the option that best describes you</Text>
        
        {/* Option Cards */}
        <View style={styles.optionsContainer}>
          {/* I need services card */}
          <TouchableOpacity 
            style={[styles.optionCard, isLoading && styles.optionCardDisabled]}
            onPress={() => handleUserTypeSelect('consumer')}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="home-outline" size={32} color="#3B82F6" />
            </View>
            <Text style={styles.optionTitle}>I need services</Text>
            <Text style={styles.optionDescription}>
              Find trusted contractors through friends
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#3B82F6" style={styles.loader} />}
          </TouchableOpacity>
          
          {/* I provide services card */}
          <TouchableOpacity 
            style={[styles.optionCard, isLoading && styles.optionCardDisabled]}
            onPress={() => handleUserTypeSelect('vendor')}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="hammer-outline" size={32} color="#F97316" />
            </View>
            <Text style={styles.optionTitle}>I provide services</Text>
            <Text style={styles.optionDescription}>
              Connect with homeowners who need help
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#F97316" style={styles.loader} />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 50,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  loader: {
    marginTop: 12,
  },
});

export default UserTypeSelectionScreen;
