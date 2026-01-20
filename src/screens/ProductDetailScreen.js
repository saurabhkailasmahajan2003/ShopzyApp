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
      Alert.alert('Select Size', 'Please select a size');
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
        text1: 'Error',
        text2: error.message || 'Failed to add to cart',
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
        text1: 'Error',
        text2: error.message || 'Failed to update wishlist',
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
        <Text style={styles.brand}>{product.brand || 'Shopzy'}</Text>
        <Text style={styles.name}>{productName}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{finalPrice.toLocaleString()}</Text>
          {hasDiscount && (
            <>
              <Text style={styles.originalPrice}>₹{originalPrice.toLocaleString()}</Text>
              <Text style={styles.discountPercent}>{discountPercent}% OFF</Text>
            </>
          )}
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
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
              <Ionicons name="remove" size={20} color="#3D2817" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#3D2817" />
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
  brand: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D2817',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#EF4444',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPercent: {
    fontSize: 14,
    color: '#FF4444',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  sizeButtonSelected: {
    borderColor: '#3D2817',
    backgroundColor: '#3D2817',
  },
  sizeText: {
    fontSize: 14,
    color: '#333',
  },
  sizeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  actionContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
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
});
