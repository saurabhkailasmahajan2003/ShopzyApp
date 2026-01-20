import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { wishlist, removeFromWishlist, loadWishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [wishlist, isAuthenticated]);

  const loadProducts = async () => {
    if (!isAuthenticated || wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const productPromises = wishlist.map(async (item) => {
        const productId = item.product?._id || item.product?.id || item._id || item.id;
        
        // If item already has full product data, use it
        if (item.product && item.product.name) {
          return item.product;
        }

        // Otherwise, try to fetch from API
        try {
          // Try different category endpoints
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
                return response.data.product;
              }
            } catch (error) {
              continue;
            }
          }
          
          // If not found in any category, return null
          return null;
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });

      const fetchedProducts = await Promise.all(productPromises);
      const validProducts = fetchedProducts.filter(p => p !== null);
      setProducts(validProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    await loadProducts();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Please login to view your wishlist</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading wishlist...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.count}>{products.length} items</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={products}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          handleBackToTopScroll(offsetY);
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text>No products in wishlist</Text>
          </View>
        }
      />

      {/* Back to Top Button */}
      <BackToTop flatListRef={flatListRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#3D2817',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#3D2817',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D2817',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 8,
  },
});
