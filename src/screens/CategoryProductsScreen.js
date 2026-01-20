import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import BackToTop, { useBackToTop } from '../components/BackToTop';

// --- Dimensions & Layout Configuration ---
const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.20; // 20% Sidebar
const MAIN_CONTENT_WIDTH = width * 0.80; // 80% Content
const PRODUCT_CARD_WIDTH = (MAIN_CONTENT_WIDTH - 24) / 2; // 2 cols: 12px padding each side + 12px gap between cards

// --- Modern Theme ---
const COLORS = {
  primary: '#10B981', // Emerald Green
  bg: '#FFFFFF',
  sidebarBg: '#F9FAFB', // Light Gray
  text: '#1F2937',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

// --- Icon Mapping ---
const CATEGORY_ICONS = {
  'all': 'grid-outline',
  'shirt': 'shirt-outline',
  'tshirt': 'shirt-outline',
  'jeans': 'body-outline',
  'trousers': 'body-outline',
  'saree': 'color-palette-outline',
  'watches': 'watch-outline',
  'analog': 'time-outline',
  'digital': 'stopwatch-outline',
  'smartwatch': 'hardware-chip-outline',
  'casual': 'cafe-outline',
  'dress': 'shirt-outline',
  'sunglasses': 'glasses-outline',
  'eyeglasses': 'eye-outline',
  'heels': 'footsteps-outline',
  'flats': 'footsteps-outline',
  'boots': 'footsteps-outline',
  'sandals': 'footsteps-outline',
  'serum': 'flask-outline',
  'facewash': 'water-outline',
  'sunscreen': 'sunny-outline',
  'moisturizer': 'sparkles-outline',
  'cleanser': 'water-outline',
  'earrings': 'diamond-outline',
  'wallets': 'wallet-outline',
  'scarves': 'ribbon-outline',
};

export default function CategoryProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Params
  const category = route.params?.category || 'all';
  const subCategory = route.params?.subCategory;

  // State
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(flatListRef, 100);

  // --- Initial Load ---
  useEffect(() => {
    setAllProducts([]);
    setPage(1);
    setHasMore(true);
    setSelectedSubCategory(subCategory || 'all');
    // Load products immediately on page open
    loadProducts(1, true);
  }, [category, subCategory]);

  // Reload products when subcategory changes (for better filtering)
  useEffect(() => {
    // When subcategory changes for women or skincare category, reload products with the subcategory filter
    // Only reload if category matches and we're not on initial load
    if ((category === 'women' || category === 'skincare') && selectedSubCategory !== 'all' && allProducts.length > 0) {
      loadProducts(1, true);
    }
  }, [selectedSubCategory]);

  // --- Subcategory Extraction ---
  const subCategories = useMemo(() => {
    // Predefined subcategories for fashion (women) category
    if (category === 'women') {
      const predefinedSubcats = [
        { name: 'All', value: 'all' },
        { name: 'Shirts', value: 'shirt' },
        { name: 'T-Shirts', value: 'tshirt' },
        { name: 'Jeans', value: 'jeans' },
        { name: 'Trousers', value: 'trousers' },
        { name: 'Saree', value: 'saree' },
      ];
      return predefinedSubcats;
    }
    
    // Predefined subcategories for skincare category
    if (category === 'skincare') {
      const predefinedSubcats = [
        { name: 'All', value: 'all' },
        { name: 'Serum', value: 'serum' },
        { name: 'Facewash', value: 'facewash' },
        { name: 'Sunscreen', value: 'sunscreen' },
        { name: 'Moisturizer', value: 'moisturizer' },
        { name: 'Cleanser', value: 'cleanser' },
      ];
      return predefinedSubcats;
    }
    
    // For other categories, extract from products
    if (allProducts.length === 0) return [{ name: 'All', value: 'all' }];
    
    const uniqueSubCategories = new Set();
    allProducts.forEach(product => {
      // Logic: If 'skincare', use 'category' field, else use 'subCategory'
      const key = (category === 'skincare') ? product.category : product.subCategory;
      if (key && typeof key === 'string') uniqueSubCategories.add(key.toLowerCase());
    });
    
    const subCats = [{ name: 'All', value: 'all' }, ...Array.from(uniqueSubCategories).sort().map(sc => ({
      name: sc.charAt(0).toUpperCase() + sc.slice(1),
      value: sc
    }))];
    
    return subCats;
  }, [allProducts, category]);

  // --- Filter & Sort Logic ---
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // 1. Filter by Sidebar selection (only if not already filtered by API)
    // For women category, API already filters by subCategory, so we don't need to filter again
    // But we keep this for other categories and as a fallback
    if (selectedSubCategory !== 'all' && category !== 'women') {
      filtered = filtered.filter(product => {
        const key = (category === 'skincare') ? product.category : product.subCategory;
        return key?.toLowerCase() === selectedSubCategory.toLowerCase();
      });
    } else if (selectedSubCategory !== 'all' && category === 'women') {
      // Double-check filtering for women category (case-insensitive, handle variations)
      filtered = filtered.filter(product => {
        const productSubCat = (product.subCategory || '').toLowerCase().trim();
        const selectedSubCat = selectedSubCategory.toLowerCase().trim();
        return productSubCat === selectedSubCat;
      });
    }

    // 2. Sort Logic
    const sortFns = {
      'price-low-high': (a, b) => (a.finalPrice || a.price || 0) - (b.finalPrice || b.price || 0),
      'price-high-low': (a, b) => (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0),
      'discount': (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0),
    };

    if (sortFns[sortBy]) {
      filtered = [...filtered].sort(sortFns[sortBy]);
    }

    return filtered;
  }, [allProducts, selectedSubCategory, sortBy, category]);

  // --- API Call ---
  const loadProducts = async (pageNum = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params = { limit: 20, page: pageNum }; // Smaller batches for faster initial load
      
      // Add subcategory filter for women and skincare categories
      if ((category === 'women' || category === 'skincare') && selectedSubCategory && selectedSubCategory !== 'all') {
        if (category === 'skincare') {
          params.category = selectedSubCategory; // Skincare uses 'category' field
        } else {
          params.subCategory = selectedSubCategory; // Women uses 'subCategory' field
        }
      }

      let response;
      switch (category) {
        case 'watches': response = await productAPI.getWatches(params); break;
        case 'lenses': response = await productAPI.getLenses(params); break;
        case 'accessories': response = await productAPI.getAccessories(params); break;
        case 'women': response = await productAPI.getWomenItems(params); break;
        case 'skincare': response = await productAPI.getSkincareProducts(params); break;
        case 'shoes': response = await productAPI.getShoes(params); break;
        default: response = await productAPI.getAllProducts(params);
      }

      if (response.success) {
        let newProducts = response.data.products || response.data || [];
        
        console.log(`Loaded ${newProducts.length} products for category: ${category}`);
        
        // Don't filter products - let ProductCard handle image display
        // This ensures all products are shown even if image format varies

        if (reset) {
          setAllProducts(newProducts);
        } else {
          setAllProducts(prev => [...prev, ...newProducts]);
        }

        // Pagination check
        setHasMore(newProducts.length >= 20);
        setPage(pageNum);
      } else {
        console.log('API Response not successful:', response);
        setAllProducts([]);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    // Load more products on scroll
    if (!loadingMore && hasMore && !loading) {
      loadProducts(page + 1, false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadProducts(1, true);
  };

  // --- Helpers ---
  const getCategoryTitle = () => {
    const titles = {
      watches: 'Watches', lenses: 'Eyewear', accessories: 'Accessories',
      women: 'Fashion', skincare: 'Skincare', shoes: 'Footwear', all: 'Discover',
    };
    return titles[category] || 'Collection';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      {/* --- Header (Clean) --- */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{getCategoryTitle()}</Text>
            
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setShowSortMenu(true)} style={styles.iconBtn}>
                    <Ionicons name="filter-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SearchTab')} style={styles.iconBtn}>
                    <Ionicons name="search-outline" size={22} color={COLORS.text} />
                </TouchableOpacity>
            </View>
        </View>
      </View>

      {/* --- Main Layout: 20% Sidebar | 80% Grid --- */}
      <View style={styles.mainContent}>
        
        {/* Left Sidebar (20%) */}
        <View style={styles.sidebar}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarContent}
          >
            {subCategories.map((subCat) => {
              const iconName = CATEGORY_ICONS[subCat.value.toLowerCase()] || 'grid-outline';
              const isActive = selectedSubCategory.toLowerCase() === subCat.value.toLowerCase();
              
              return (
                <TouchableOpacity
                  key={subCat.value}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => setSelectedSubCategory(subCat.value)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sidebarIconBox, isActive && styles.sidebarIconBoxActive]}>
                    <Ionicons
                      name={isActive ? iconName.replace('-outline', '') : iconName}
                      size={20} // Smaller icon for narrow sidebar
                      color={isActive ? COLORS.primary : COLORS.textLight}
                    />
                  </View>
                  <Text 
                    style={[styles.sidebarText, isActive && styles.sidebarTextActive]}
                    numberOfLines={1}
                  >
                    {subCat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Content (80%) */}
        <View style={styles.productsArea}>
          {loading && allProducts.length === 0 ? (
             <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Collection...</Text>
             </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No items found</Text>
              {selectedSubCategory !== 'all' && (
                <TouchableOpacity onPress={() => setSelectedSubCategory('all')} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={filteredProducts}
              keyExtractor={(item, index) => item._id || item.id || `product-${index}`}
              renderItem={({ item }) => (
                <ProductCard 
                  product={item} 
                  style={{ width: PRODUCT_CARD_WIDTH }} // Pass explicit width
                />
              )}
              numColumns={2}
              columnWrapperStyle={styles.rowWrapper}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
              }
              onScroll={(e) => handleBackToTopScroll(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                  loadingMore && <View style={{padding: 20, alignItems: 'center'}}><Text style={styles.loadingText}>Loading...</Text></View>
              }
            />
          )}
        </View>
      </View>

      {/* --- Sort Modal (Bottom Sheet Style) --- */}
      {showSortMenu && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowSortMenu(false)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity onPress={() => setShowSortMenu(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>
            {[
              { id: 'default', label: 'Recommended' },
              { id: 'price-low-high', label: 'Price: Low to High' },
              { id: 'price-high-low', label: 'Price: High to Low' },
              { id: 'discount', label: 'Best Discount' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(opt.id);
                  setShowSortMenu(false);
                }}
              >
                <Text style={[styles.sortText, sortBy === opt.id && styles.sortTextActive]}>
                    {opt.label}
                </Text>
                {sortBy === opt.id && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <BackToTop flatListRef={flatListRef} scrollThreshold={200} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  
  // --- Header ---
  header: {
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  iconBtn: {
    padding: 8,
  },

  // --- Main Layout ---
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  
  // Sidebar (20%)
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  sidebarContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  sidebarItem: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  sidebarItemActive: {
    backgroundColor: '#fff',
    borderLeftColor: COLORS.primary,
  },
  sidebarIconBox: {
    marginBottom: 6,
    opacity: 0.8,
  },
  sidebarIconBoxActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  sidebarText: {
    fontSize: 10, // Small text for rail
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 2,
  },
  sidebarTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Products (80%)
  productsArea: {
    width: MAIN_CONTENT_WIDTH,
    backgroundColor: COLORS.bg,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  listContent: {
    padding: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: 14,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.textLight,
  },
  resetBtn: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  // --- Sort Modal ---
  modalOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 1000,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBg,
  },
  sortText: {
    fontSize: 16,
    color: COLORS.text,
  },
  sortTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});