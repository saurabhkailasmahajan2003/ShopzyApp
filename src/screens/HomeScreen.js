import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import BackToTop, { useBackToTop } from '../components/BackToTop';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [previouslyBought, setPreviouslyBought] = useState([]);
  const [watches, setWatches] = useState([]);
  const [women, setWomen] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [skincare, setSkincare] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [freshDrops, setFreshDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoriesSticky, setIsCategoriesSticky] = useState(false);
  const headerHeight = 180; // Approximate header height
  const scrollViewRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(scrollViewRef, 100);

  useEffect(() => {
    loadProducts();
  }, []);

  // Reset category to 'all' when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setSelectedCategory('all');
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Load products from all categories
      const [watchesRes, womenRes, shoesRes, skincareRes, lensesRes, accessoriesRes] = await Promise.all([
        productAPI.getWatches({ limit: 20 }),
        productAPI.getWomenItems({ limit: 20 }),
        productAPI.getShoes({ limit: 20 }),
        productAPI.getSkincareProducts({ limit: 20 }),
        productAPI.getLenses({ limit: 20 }),
        productAPI.getAccessories({ limit: 20 }),
      ]);

      // Set individual category products
      if (watchesRes.success) {
        const watchesData = watchesRes.data.products || [];
        setWatches(watchesData.slice(0, 10));
      }
      if (womenRes.success) {
        setWomen((womenRes.data.products || []).slice(0, 10));
      }
      if (shoesRes.success) {
        const shoesWithImages = (shoesRes.data.products || []).filter(hasValidImage);
        setShoes(shoesWithImages.slice(0, 10));
      }
      if (skincareRes.success) {
        setSkincare((skincareRes.data.products || []).slice(0, 10));
      }
      if (lensesRes.success) {
        setLenses((lensesRes.data.products || []).slice(0, 10));
      }
      if (accessoriesRes.success) {
        setAccessories((accessoriesRes.data.products || []).slice(0, 10));
      }

      // Combine all products for "Previously bought" and other sections
      const allProducts = [];
      
      // Add products from each category (limit per category for better mix)
      if (watchesRes.success) allProducts.push(...(watchesRes.data.products || []).slice(0, 3));
      if (womenRes.success) allProducts.push(...(womenRes.data.products || []).slice(0, 3));
      if (shoesRes.success) {
        const shoesWithImages = (shoesRes.data.products || []).filter(hasValidImage);
        allProducts.push(...shoesWithImages.slice(0, 3));
      }
      if (skincareRes.success) allProducts.push(...(skincareRes.data.products || []).slice(0, 3));
      if (lensesRes.success) allProducts.push(...(lensesRes.data.products || []).slice(0, 3));
      if (accessoriesRes.success) allProducts.push(...(accessoriesRes.data.products || []).slice(0, 3));

      // Shuffle products to mix categories
      const shuffled = allProducts.sort(() => Math.random() - 0.5);
      
      // Set previously bought (mixed products from all categories)
      setPreviouslyBought(shuffled.slice(0, 10));

      // Filter sale products (products with discount)
      const saleItems = allProducts.filter(product => {
        const discount = product.discountPercent || 
                        (product.originalPrice && product.price && 
                         ((product.originalPrice - product.price) / product.originalPrice * 100));
        return discount && discount > 0;
      });
      setSaleProducts(saleItems.slice(0, 10));

      // Fresh Drops (newest products - sorted by creation date or take recent ones)
      const freshItems = [...allProducts]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 10);
      setFreshDrops(freshItems);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasValidImage = (product) => {
    let imageUrl = '';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const validImages = product.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (validImages.length > 0) {
        imageUrl = validImages[0];
      }
    } else if (product.images && typeof product.images === 'object' && !Array.isArray(product.images)) {
      const imageFields = ['image1', 'image2', 'image3', 'image4', 'image', 'thumbnail'];
      for (const field of imageFields) {
        if (product.images[field] && typeof product.images[field] === 'string' && product.images[field].trim() !== '') {
          imageUrl = product.images[field];
          break;
        }
      }
      if (!imageUrl) {
        const values = Object.values(product.images).filter(val => 
          val && typeof val === 'string' && val.trim() !== ''
        );
        if (values.length > 0) {
          imageUrl = values[0];
        }
      }
    } else if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      imageUrl = product.image;
    } else if (product.thumbnail && typeof product.thumbnail === 'string' && product.thumbnail.trim() !== '') {
      imageUrl = product.thumbnail;
    } else if (product.Images && typeof product.Images === 'object') {
      const imageFields = ['image1', 'image2', 'image3', 'image4'];
      for (const field of imageFields) {
        if (product.Images[field] && typeof product.Images[field] === 'string' && product.Images[field].trim() !== '') {
          imageUrl = product.Images[field];
          break;
        }
      }
    } else if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
      imageUrl = product.imageUrl;
    }
    return imageUrl && typeof imageUrl === 'string' && 
           (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'bag-outline' },
    { id: 'women', name: 'Fashion', icon: 'shirt-outline' },
    { id: 'watches', name: 'Watches', icon: 'time-outline' },
    { id: 'lenses', name: 'Eyewear', icon: 'eye-outline' },
    { id: 'shoes', name: 'Shoes', icon: 'footsteps-outline' },
    { id: 'skincare', name: 'Beauty', icon: 'sparkles-outline' },
    { id: 'accessories', name: 'Accessories', icon: 'diamond-outline' },
  ];


  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setIsCategoriesSticky(offsetY >= headerHeight - 10);
          handleBackToTopScroll(offsetY);
        }}
        scrollEventThrottle={16}
      >
        {/* Top Header - Not Sticky, Scrolls with content */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>Shopzy</Text>
              <TouchableOpacity 
                style={styles.addressContainer}
                onPress={() => navigation.navigate('ProfileTab')}
              >
                <Text style={styles.addressText} numberOfLines={1}>
                  WORK - Floor 3, Indradhanush ph
                </Text>
                <Ionicons name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('ProfileTab')}
            >
              <Ionicons name="person-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 'disposables'"
              placeholderTextColor="#999"
              onFocus={() => navigation.navigate('SearchTab')}
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Navigation - Starts below header, becomes sticky on scroll */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemActive
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (category.id === 'all') {
                    navigation.navigate('CategoryProducts', { category: 'all' });
                  } else {
                    navigation.navigate('CategoryProducts', { category: category.id });
                  }
                }}
              >
                <Ionicons
                  name={category.icon}
                  size={22}
                  color={selectedCategory === category.id ? '#3B82F6' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <View style={styles.categoryUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>FASHION SALE</Text>
              <Text style={styles.bannerSubtitle}>Get flat 20% OFF on all fashion items</Text>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => navigation.navigate('CategoryProducts', { category: 'women' })}
              >
                <Text style={styles.playButtonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bannerImageContainer}>
              {/* Placeholder for banner images */}
              <View style={styles.bannerImagePlaceholder} />
            </View>
          </View>
        </View>

        {/* Previously Bought Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Previously bought</Text>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={previouslyBought}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item._id || item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          )}
        </View>

        {/* Sale Section */}
        {saleProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sale</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'all', sale: true })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={saleProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `sale-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Fresh Drops Section */}
        {freshDrops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fresh Drops</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'all', fresh: true })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={freshDrops}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `fresh-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Watches Section */}
        {watches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Watches</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'watches' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={watches}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `watches-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Fashion Section */}
        {women.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fashion</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'women' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={women}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `women-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Shoes Section */}
        {shoes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shoes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'shoes' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={shoes}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `shoes-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Skincare Section */}
        {skincare.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skincare</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'skincare' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={skincare}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `skincare-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Eyewear Section */}
        {lenses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Eyewear</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'lenses' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={lenses}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `lenses-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}

        {/* Accessories Section */}
        {accessories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Accessories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CategoryProducts', { category: 'accessories' })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={accessories}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => `accessories-${item._id || item.id}`}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}
      </ScrollView>

      {/* Sticky Category Navigation - Appears when scrolled */}
      {isCategoriesSticky && (
        <View style={[styles.stickyCategoriesContainer, { paddingTop: insets.top }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemActive
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  if (category.id === 'all') {
                    navigation.navigate('CategoryProducts', { category: 'all' });
                  } else {
                    navigation.navigate('CategoryProducts', { category: category.id });
                  }
                }}
              >
                <Ionicons
                  name={category.icon}
                  size={22}
                  color={selectedCategory === category.id ? '#3B82F6' : '#666'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategory === category.id && (
                  <View style={styles.categoryUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Back to Top Button - Floating */}
      <BackToTop scrollViewRef={scrollViewRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandContainer: {
    flex: 1,
    marginRight: 16,
  },
  brandName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
    marginRight: 6,
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  micButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  categoriesWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoriesContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  stickyCategoriesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingBottom: 8,
  },
  categoryItemActive: {
    // Active state styling
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 1,
  },
  bannerContainer: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bannerImageContainer: {
    width: 120,
    height: 120,
  },
  bannerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  productsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  backToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backToTopText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
