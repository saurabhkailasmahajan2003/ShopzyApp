import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      if (response.success) {
        const items = response.data?.cart?.items || [];
        setCart(items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, size = '', color = '') => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    if (!product) {
      throw new Error('Product is required');
    }

    const productId = product._id || product.id || product.productId;
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const normalizedProduct = {
      _id: product._id || product.id || product.productId,
      id: product.id || product._id || product.productId,
      productId: product.productId || product._id || product.id,
      name: product.name || product.productName || 'Product',
      productName: product.productName || product.name || 'Product',
      price: product.price || product.finalPrice || product.mrp || 0,
      finalPrice: product.finalPrice || product.price || product.mrp || 0,
      mrp: product.mrp || product.originalPrice || product.price || 0,
      originalPrice: product.originalPrice || product.mrp || product.price || 0,
      image: product.image || product.thumbnail || product.images?.[0] || '',
      images: product.images || (product.image ? [product.image] : []),
      thumbnail: product.thumbnail || product.image || product.images?.[0] || '',
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      stock: product.stock || product.quantity || 0,
      quantity: product.quantity || product.stock || 0,
      inStock: product.inStock !== undefined ? product.inStock : (product.stock > 0 || product.quantity > 0),
      ...product
    };

    try {
      const response = await cartAPI.addToCart(normalizedProduct, quantity, size, color);
      
      if (response && response.success) {
        const items = response.data?.cart?.items || [];
        setCart(items);
        return response;
      } else {
        const errorMsg = response?.message || 'Failed to add to cart';
        await loadCart();
        throw new Error(errorMsg);
      }
    } catch (error) {
      await loadCart();
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      return;
    }

    const itemIdString = String(itemId).replace('temp-', '');

    try {
      const response = await cartAPI.removeFromCart(itemIdString);
      if (response && response.success) {
        setCart(response.data?.cart?.items || []);
      } else {
        await loadCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      await loadCart();
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) {
      return;
    }

    const itemIdString = String(itemId).replace('temp-', '');

    if (quantity <= 0) {
      await removeFromCart(itemIdString);
      return;
    }

    try {
      const response = await cartAPI.updateCartItem(itemIdString, quantity);
      
      if (response && response.success) {
        const items = response.data?.cart?.items || [];
        setCart(items);
      } else {
        await loadCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      await loadCart();
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await cartAPI.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = item.product || item;
      const price = product.finalPrice || product.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isLoading,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
