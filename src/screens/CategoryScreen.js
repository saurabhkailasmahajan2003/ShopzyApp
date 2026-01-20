import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import BackToTop, { useBackToTop } from '../components/BackToTop';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define all categories with their subcategories and images
const CATEGORIES = [
  {
    id: 'women',
    name: 'Fashion',
    icon: 'shirt-outline',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'Shirts', value: 'shirt' },
      { name: 'T-Shirts', value: 'tshirt' },
      { name: 'Jeans', value: 'jeans' },
      { name: 'Trousers', value: 'trousers' },
      { name: 'Saree', value: 'saree' },
    ],
  },
  {
    id: 'watches',
    name: 'Watches',
    icon: 'time-outline',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'All Watches', value: 'all' },
      { name: 'Analog', value: 'analog' },
      { name: 'Digital', value: 'digital' },
      { name: 'Smartwatch', value: 'smartwatch' },
      { name: 'Casual', value: 'casual' },
      { name: 'Dress', value: 'dress' },
    ],
  },
  {
    id: 'lenses',
    name: 'Eyewear',
    icon: 'eye-outline',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'All Eyewear', value: 'all' },
      { name: 'Sunglasses', value: 'sunglasses' },
      { name: 'Eyeglasses', value: 'eyeglasses' },
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    icon: 'footsteps-outline',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'All Shoes', value: 'all' },
      { name: 'Heels', value: 'Heels' },
      { name: 'Flats', value: 'Flats' },
      { name: 'Boots', value: 'Boots' },
      { name: 'Sandals', value: 'Sandals' },
    ],
  },
  {
    id: 'skincare',
    name: 'Skincare',
    icon: 'sparkles-outline',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'All Skincare', value: 'all' },
      { name: 'Serum', value: 'serum' },
      { name: 'Facewash', value: 'facewash' },
      { name: 'Sunscreen', value: 'sunscreen' },
      { name: 'Moisturizer', value: 'moisturizer' },
      { name: 'Cleanser', value: 'cleanser' },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: 'diamond-outline',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    subCategories: [
      { name: 'All Accessories', value: 'all' },
      { name: 'Earrings', value: 'earrings' },
      { name: 'Wallets', value: 'wallets' },
      { name: 'Scarves', value: 'scarves' },
    ],
  },
];

export default function CategoryScreen() {
  const navigation = useNavigation();
  const [expandedCategories, setExpandedCategories] = useState({});
  const scrollViewRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(scrollViewRef, 100);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSubCategoryPress = (categoryId, subCategory) => {
    const params = { category: categoryId };
    
    // Add subcategory filter if not "all"
    if (subCategory.value !== 'all') {
      if (categoryId === 'skincare') {
        params.categoryFilter = subCategory.value; // Skincare uses category field
      } else {
        params.subCategory = subCategory.value;
      }
    }

    // Navigate to products view
    navigation.navigate('CategoryProducts', params);
  };

  const handleViewAll = (categoryId) => {
    navigation.navigate('CategoryProducts', { category: categoryId });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          handleBackToTopScroll(offsetY);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="grid" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Shop by Category</Text>
              <Text style={styles.subtitle}>Explore our wide range of products</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories List */}
        <View style={styles.categoriesList}>
          {CATEGORIES.map((category, index) => {
            const isExpanded = expandedCategories[category.id];

            return (
              <View key={category.id} style={[styles.categoryItem, index === 0 && styles.firstCategory]}>
                <TouchableOpacity
                  style={[styles.categoryHeader, isExpanded && styles.categoryHeaderExpanded]}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <View style={[styles.categoryImageContainer, isExpanded && styles.categoryImageContainerActive]}>
                      <Image
                        source={{ uri: category.image }}
                        style={styles.categoryImage}
                        contentFit="cover"
                        placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
                        transition={200}
                      />
                      <View style={styles.categoryImageOverlay} />
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categorySubtext}>
                        {category.subCategories.length} {category.subCategories.length === 1 ? 'subcategory' : 'subcategories'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryHeaderRight}>
                    <View style={[styles.chevronContainer, isExpanded && styles.chevronContainerActive]}>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={isExpanded ? "#3B82F6" : "#666"}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.subCategoriesContainer}>
                    {/* View All Button */}
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => handleViewAll(category.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="grid-outline" size={18} color="#3B82F6" />
                      <Text style={styles.viewAllText}>View All {category.name}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#3B82F6" />
                    </TouchableOpacity>

                    {/* Subcategories */}
                    {category.subCategories.map((subCat, subIndex) => (
                      <TouchableOpacity
                        key={subIndex}
                        style={[
                          styles.subCategoryItem,
                          subIndex === category.subCategories.length - 1 && styles.lastSubCategory
                        ]}
                        onPress={() => handleSubCategoryPress(category.id, subCat)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.subCategoryLeft}>
                          <View style={styles.subCategoryIconContainer}>
                            <Ionicons name={category.icon} size={16} color="#3B82F6" />
                          </View>
                          <Text style={styles.subCategoryText}>{subCat.name}</Text>
                        </View>
                        <View style={styles.subCategoryRight}>
                          <Text style={styles.subCategoryArrow}>→</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Back to Top Button */}
      <BackToTop scrollViewRef={scrollViewRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  categoriesList: {
    padding: 20,
    paddingTop: 24,
  },
  firstCategory: {
    marginTop: 0,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  categoryHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  categoryImageContainerActive: {
    borderColor: '#3B82F6',
    borderWidth: 2.5,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  categorySubtext: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryHeaderRight: {
    marginLeft: 12,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainerActive: {
    backgroundColor: '#EFF6FF',
  },
  subCategoriesContainer: {
    backgroundColor: '#FAFBFC',
    paddingTop: 8,
    paddingBottom: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginHorizontal: 12,
    marginBottom: 8,
    marginTop: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B82F6',
    marginHorizontal: 10,
    letterSpacing: -0.2,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  lastSubCategory: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  subCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subCategoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  subCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: -0.2,
  },
  subCategoryRight: {
    marginLeft: 12,
  },
  subCategoryArrow: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
