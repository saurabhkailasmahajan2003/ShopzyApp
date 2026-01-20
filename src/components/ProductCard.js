import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Square grid - 2 columns with padding

export default function ProductCard({ product, style }) {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  // Get card width from style prop or use default
  const cardWidthValue = style?.width || cardWidth;

  const productId = product._id || product.id;
  const productName = product.name || product.productName || product.title || 'Product';
  const finalPrice = product.finalPrice || product.price || product.mrp || 0;
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  // Get image URL - handle various formats
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
  
  const isValidUrl = imageUrl && typeof imageUrl === 'string' && 
                     (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'));
  
  const isShoe = product.category?.toLowerCase().includes('shoe') || 
                  product.category?.toLowerCase() === 'shoes' ||
                  product.category?.toLowerCase() === "women's shoes";
  
  if (isShoe && !isValidUrl) {
    return null;
  }
  
  const finalImageUrl = isValidUrl ? imageUrl : 'https://via.placeholder.com/200x200?text=No+Image';

  // Stock info
  const stock = product.stock;
  const stockInfo = stock !== undefined && stock !== null && stock > 0 && stock <= 5 
    ? `Only ${stock} left` 
    : null;

  // Rating - use product data or default values
  const rating = product.rating || product.ratingsCount ? (product.rating || 4.5) : 4.5;
  // Use a consistent review count based on product ID to avoid changing on scroll
  const getReviewCount = () => {
    if (product.ratingsCount) return product.ratingsCount;
    if (product.reviewsCount) return product.reviewsCount;
    // Use product ID to generate a consistent number (not random)
    const productId = product._id || product.id || '0';
    const hash = productId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 10000) + 100; // Returns a number between 100-10099
  };
  const reviewCount = getReviewCount();

  // Size/Weight info
  const size = product.sizes?.[0] || product.product_info?.availableSizes?.[0] || 
               product.netQuantity ? `${product.netQuantity} ${product.netQuantity === 1 ? 'piece' : 'pieces'}` : 
               null;

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

    try {
      await addToCart(product, 1);
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

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId, product });
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: finalImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          onError={() => setImageError(true)}
        />
        {hasDiscount && discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
        {/* Quantity Selector Button at bottom of image */}
        {size && (
          <View style={styles.quantitySelectorContainer}>
            <TouchableOpacity style={styles.quantitySelectorButton}>
              <Text style={styles.quantitySelectorText}>{size}</Text>
              <Ionicons name="chevron-down" size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {productName}
        </Text>

        {/* Description if available */}
        {(product.description || product.product_info?.description) && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description || product.product_info?.description}
          </Text>
        )}
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{rating}</Text>
          <Text style={styles.reviewText}>({reviewCount.toLocaleString()})</Text>
        </View>

        {stockInfo && (
          <Text style={styles.stockText}>{stockInfo}</Text>
        )}

        <View style={styles.priceContainer}>
          {hasDiscount && discountPercent > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discountPercent}% OFF</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{finalPrice.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{originalPrice.toLocaleString()}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Square image
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 14,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  deliveryInfo: {
    marginBottom: 6,
  },
  deliveryText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  stockText: {
    fontSize: 11,
    color: '#FF4444',
    fontWeight: '500',
    marginBottom: 6,
  },
  priceContainer: {
    marginBottom: 8,
  },
  discountTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  discountTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  originalPrice: {
    fontSize: 12,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
