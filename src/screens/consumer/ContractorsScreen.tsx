import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import SearchBar from '../../components/SearchBar';

type ContractorsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Contractors'>;

const ContractorsScreen: React.FC = () => {
  const navigation = useNavigation<ContractorsScreenNavigationProp>();
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'recommendations'>('rating');

  const categories = ['All', 'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Landscaping'];

  // Mock data for contractors
  const allContractors = [
    {
      id: '1',
      name: 'Mike Rodriguez',
      service: 'Plumbing',
      rating: 4.9,
      reviewCount: 127,
      distance: '2.3 miles',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVerified: true,
      experience: 8,
      location: 'Downtown & Midtown',
      recommendedBy: 3,
      available: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      service: 'Electrical',
      rating: 4.8,
      reviewCount: 89,
      distance: '3.5 miles',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      isVerified: true,
      experience: 6,
      location: 'North Side',
      recommendedBy: 2,
      available: true,
    },
    {
      id: '3',
      name: 'David Chen',
      service: 'HVAC',
      rating: 4.7,
      reviewCount: 156,
      distance: '5.1 miles',
      image: 'https://randomuser.me/api/portraits/men/52.jpg',
      isVerified: false,
      experience: 10,
      location: 'East District',
      recommendedBy: 5,
      available: false,
    },
    {
      id: '4',
      name: 'Emily Brown',
      service: 'Carpentry',
      rating: 4.9,
      reviewCount: 203,
      distance: '1.8 miles',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      isVerified: true,
      experience: 12,
      location: 'Central Area',
      recommendedBy: 7,
      available: true,
    },
    {
      id: '5',
      name: 'James Wilson',
      service: 'Painting',
      rating: 4.6,
      reviewCount: 74,
      distance: '4.2 miles',
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
      isVerified: false,
      experience: 5,
      location: 'West End',
      recommendedBy: 1,
      available: true,
    },
  ];

  const getRecommendationText = (count: number) => {
    return `Recommended by ${count} mutual friend${count !== 1 ? 's' : ''}`;
  };

  // Sort options
  const sortOptions = [
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'distance', label: 'Closest to Me', icon: 'location' },
    { id: 'recommendations', label: 'Most Recommended', icon: 'people' },
  ];

  const handleSort = (option: 'rating' | 'distance' | 'recommendations') => {
    setSortBy(option);
    setShowSortModal(false);
  };

  // Filter contractors based on search, category, and verified status
  const filteredAndSortedContractors = allContractors
    .filter(contractor => {
      const matchesSearch = contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contractor.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || contractor.service === selectedCategory;
      const matchesVerified = !showVerifiedOnly || contractor.isVerified;
      return matchesSearch && matchesCategory && matchesVerified;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'distance') {
        const distanceA = parseFloat(a.distance);
        const distanceB = parseFloat(b.distance);
        return distanceA - distanceB;
      } else if (sortBy === 'recommendations') {
        return b.recommendedBy - a.recommendedBy;
      }
      return 0;
    });

  const renderContractor = ({ item }: { item: typeof allContractors[0] }) => (
    <TouchableOpacity 
      style={[styles.contractorCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
      onPress={() => navigation.navigate('ContractorProfile' as any, { contractor: item })}
    >
      <View style={styles.contractorLeft}>
        <View style={styles.contractorImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.contractorImage}
          />
          {item.isVerified && (
            <View style={styles.verifiedIconBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            </View>
          )}
        </View>
        
        <View style={styles.contractorInfo}>
          <View style={styles.contractorHeader}>
            <Text style={[styles.contractorName, { color: colors.primaryText }]}>
              {item.name}
            </Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" style={{ marginLeft: 4 }} />
            )}
          </View>
          
          <Text style={[styles.contractorService, { color: colors.secondaryText }]}>
            {item.service} • {item.experience} years exp
          </Text>
          
          <View style={styles.contractorMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={[styles.ratingText, { color: colors.primaryText }]}>
                {item.rating}
              </Text>
              <Text style={[styles.reviewCount, { color: colors.secondaryText }]}>
                ({item.reviewCount})
              </Text>
            </View>
            
            <Text style={[styles.distance, { color: colors.secondaryText }]}>
              {item.distance}
            </Text>
          </View>
          
          <View style={styles.recommendationBadge}>
            <Ionicons name="people" size={14} color="#3B82F6" />
            <Text style={[styles.recommendationText, { color: colors.secondaryText }]}>
              {getRecommendationText(item.recommendedBy)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contractorRight}>
        {item.available ? (
          <View style={[styles.availableBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        ) : (
          <View style={[styles.availableBadge, { backgroundColor: '#6B7280' }]}>
            <Text style={styles.availableText}>Busy</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Find Contractors</Text>
        <TouchableOpacity onPress={() => setShowSortModal(true)}>
          <Ionicons name="filter-outline" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 12 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contractors or services"
        />
      </View>

      {/* Verified Filter Toggle */}
      <View style={styles.verifiedFilterContainer}>
        <TouchableOpacity 
          style={[
            styles.verifiedToggle,
            { 
              backgroundColor: showVerifiedOnly ? colors.primary : colors.surface,
              borderColor: showVerifiedOnly ? colors.primary : colors.border
            }
          ]}
          onPress={() => setShowVerifiedOnly(!showVerifiedOnly)}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={18} 
            color={showVerifiedOnly ? '#FFFFFF' : colors.primary} 
          />
          <Text style={[
            styles.verifiedToggleText,
            { color: showVerifiedOnly ? '#FFFFFF' : colors.primaryText }
          ]}>
            Verified Only
          </Text>
        </TouchableOpacity>
        <Text style={[styles.resultCount, { color: colors.secondaryText }]}>
          {filteredAndSortedContractors.length} contractors found
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill,
              { 
                backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                borderColor: selectedCategory === category ? colors.primary : 'transparent'
              }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              { color: colors.secondaryText },
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.secondaryText }]}>
          {filteredAndSortedContractors.length} contractors found
        </Text>
      </View>

      {/* Contractors List */}
      <FlatList
        data={filteredAndSortedContractors}
        renderItem={renderContractor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.primaryText }]}>No contractors found</Text>
            <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primaryText }]}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  { borderBottomColor: colors.border },
                  sortBy === option.id && { backgroundColor: colors.surface }
                ]}
                onPress={() => handleSort(option.id as 'rating' | 'distance' | 'recommendations')}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={22} 
                    color={sortBy === option.id ? colors.primary : colors.secondaryText} 
                  />
                  <Text style={[
                    styles.sortOptionText,
                    { color: sortBy === option.id ? colors.primary : colors.primaryText }
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {sortBy === option.id && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
    minWidth: 60,
  },
  categoryPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contractorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  contractorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contractorImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  contractorImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  verifiedFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  verifiedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  verifiedToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 14,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  contractorInfo: {
    flex: 1,
  },
  contractorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  contractorService: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contractorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  recommendationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  contractorRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  contractorServiceOld: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  contractorRating: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 4,
  },
  separator: {
    color: '#D1D5DB',
    marginHorizontal: 6,
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  availabilityText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  // Sort Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sortModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ContractorsScreen;
