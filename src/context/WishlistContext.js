import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wishlistAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        setWishlist(response.data?.wishlist?.items || []);
      }
    } catch (error) {
      // Gracefully handle missing wishlist API
      if (error.message?.includes('not found') || error.message?.includes('Route')) {
        console.log('Wishlist API not available, using local storage');
        // Try to load from local storage as fallback
        try {
          const saved = await AsyncStorage.getItem('localWishlist');
          if (saved) {
            setWishlist(JSON.parse(saved));
          }
        } catch (e) {
          console.log('Could not load local wishlist');
        }
      } else {
        console.error('Error loading wishlist:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId, productData = null) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await wishlistAPI.addToWishlist(productId);
      if (response.success) {
        await loadWishlist();
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      // Gracefully handle missing wishlist API - use local storage
      if (error.message?.includes('not found') || error.message?.includes('Route')) {
        console.log('Wishlist API not available, using local storage');
        try {
          const currentWishlist = [...wishlist];
          if (!currentWishlist.find(item => {
            const id = item.product?._id || item.product?.id || item._id || item.id;
            return id === productId;
          })) {
            // Store full product data if provided, otherwise store minimal info
            const productToStore = productData || { _id: productId, id: productId };
            currentWishlist.push({ 
              product: productToStore, 
              _id: `local-${productId}` 
            });
            setWishlist(currentWishlist);
            await AsyncStorage.setItem('localWishlist', JSON.stringify(currentWishlist));
          }
          return { success: true };
        } catch (e) {
          console.error('Error saving to local wishlist:', e);
          return { success: false, message: 'Failed to add to wishlist' };
        }
      }
      return { success: false, message: error.message || 'Failed to add to wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.success) {
        await loadWishlist();
      }
    } catch (error) {
      // Gracefully handle missing wishlist API - use local storage
      if (error.message?.includes('not found') || error.message?.includes('Route')) {
        console.log('Wishlist API not available, using local storage');
        try {
          const updatedWishlist = wishlist.filter(item => {
            const id = item.product?._id || item.product?.id || item._id || item.id;
            return id !== productId;
          });
          setWishlist(updatedWishlist);
          await AsyncStorage.setItem('localWishlist', JSON.stringify(updatedWishlist));
        } catch (e) {
          console.error('Error removing from local wishlist:', e);
        }
      } else {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => {
      const id = item.product?._id || item.product?.id || item._id || item.id;
      return id === productId;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
