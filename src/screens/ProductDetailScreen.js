import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import BackToTop, { useBackToTop } from '../components/BackToTop';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId, product: initialProduct } = route.params || {};
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const scrollViewRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(scrollViewRef, 100);

  useEffect(() => {
    if (!initialProduct && productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Try to determine category from productId or try all categories
      const categories = ['watches', 'lenses', 'accessories', 'women', 'skincare', 'shoes'];
      
      for (const category of categories) {
        try {
          let response;
          switch (category) {
            case 'watches':
              response = await productAPI.getWatchById(productId);
              break;
            case 'lenses':
              response = await productAPI.getLensById(productId);
              break;
            case 'accessories':
              response = await productAPI.getAccessoryById(productId);
              break;
            case 'women':
              response = await productAPI.getWomenItemById(productId);
              break;
            case 'skincare':
              response = await productAPI.getSkincareProductById(productId);
              break;
            case 'shoes':
              response = await productAPI.getShoeById(productId);
              break;
          }
          
          if (response.success && response.data.product) {
            setProduct(response.data.product);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedProducts = async () => {
    if (!product) return;
    
    try {
      setLoadingSuggestions(true);
      const currentProductId = product._id || product.id;
      const category = product.category?.toLowerCase() || 'all';
      
      let response;
      switch (category) {
        case 'watches':
          response = await productAPI.getWatches({ limit: 20 });
          break;
        case 'lenses':
        case 'lens':
          response = await productAPI.getLenses({ limit: 20 });
          break;
        case 'accessories':
          response = await productAPI.getAccessories({ limit: 20 });
          break;
        case 'women':
          response = await productAPI.getWomenItems({ limit: 20 });
          break;
        case 'skincare':
          response = await productAPI.getSkincareProducts({ limit: 20 });
          break;
        case 'shoes':
          response = await productAPI.getShoes({ limit: 20 });
          break;
        default:
          response = await productAPI.getAllProducts({ limit: 20 });
      }

      if (response.success) {
        let products = response.data.products || [];
        // Filter out current product and shuffle
        products = products.filter(p => (p._id || p.id) !== currentProductId);
        const shuffled = products.sort(() => Math.random() - 0.5);
        setSuggestedProducts(shuffled.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading suggested products:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const productIdValue = product._id || product.id;
  const productName = product.name || product.productName || 'Product';
  const finalPrice = product.finalPrice || product.price || product.mrp || 0;
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const images = product.images || (product.image ? [product.image] : []);
  const sizes = product.sizes || [];
  const inWishlist = isInWishlist(productIdValue);
  const isSoldOut = product.stock === 0 || product.quantity === 0 || product.inStock === false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to add items to cart',
      });
      navigation.navigate('Login');
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      Toast.show({
        type: 'info',
        text1: 'Select Size',
        text2: 'Please select a size to continue',
      });
      return;
    }

    try {
      await addToCart(product, quantity, selectedSize, '');
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${productName} added successfully`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to Add Item',
        text2: error.message || 'Something went wrong. Please try again',
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'Please login to add items to wishlist',
      });
      navigation.navigate('Login');
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(productIdValue);
        Toast.show({
          type: 'success',
          text1: 'Removed',
          text2: 'Removed from wishlist',
        });
      } else {
        // Pass full product data to wishlist
        await addToWishlist(productIdValue, product);
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'Added to wishlist',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Action Failed',
        text2: error.message || 'Unable to update wishlist. Please try again',
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          handleBackToTopScroll(offsetY);
        }}
        scrollEventThrottle={16}
      >
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: images[selectedImageIndex] || product.image || 'https://via.placeholder.com/400',
          }}
          style={styles.mainImage}
          contentFit="cover"
          transition={200}
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleWishlistToggle}
        >
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={24}
            color={inWishlist ? '#FF4444' : '#fff'}
          />
        </TouchableOpacity>
        {images.length > 1 && (
          <ScrollView
            horizontal
            style={styles.thumbnailContainer}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.thumbnailSelected,
                ]}
              >
                <Image 
                  source={{ uri: img }} 
                  style={styles.thumbnailImage}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <View style={styles.brandContainer}>
          <Text style={styles.brand}>{product.brand || 'Shopzy'}</Text>
          {product.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{productName}</Text>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{finalPrice.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{originalPrice.toLocaleString()}</Text>
            )}
          </View>
          {hasDiscount && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountPercent}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        {sizes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonSelected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.sizeTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!isSoldOut ? (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.soldOutButton}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
      </View>

      {/* Suggested Products Section */}
      {suggestedProducts.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>You may also like</Text>
          </View>
          <FlatList
            data={suggestedProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id || item.id || `suggested-${Math.random()}`}
            renderItem={({ item }) => (
              <View style={styles.suggestedCardWrapper}>
                <ProductCard 
                  product={item} 
                  style={{ width: (width - 48) / 2.5 }}
                />
              </View>
            )}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>
      )}
      </ScrollView>

      {/* Back to Top Button */}
      <BackToTop scrollViewRef={scrollViewRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: width,
    height: width,
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#3D2817',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brand: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#EF4444',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountContainer: {
    alignSelf: 'flex-start',
  },
  discountPercent: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  section: {
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  sizeButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  sizeText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  sizeTextSelected: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
    color: '#1F2937',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  soldOutButton: {
    backgroundColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  soldOutText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 24,
    marginTop: 8,
  },
  suggestionsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  suggestionsList: {
    paddingHorizontal: 16,
  },
  suggestedCardWrapper: {
    marginRight: 12,
  },
});
