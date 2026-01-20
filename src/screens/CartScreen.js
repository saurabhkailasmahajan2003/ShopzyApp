import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackToTop, { useBackToTop } from '../components/BackToTop';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

// --- Modern Theme Colors ---
const COLORS = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  primary: '#3B82F6', // Blue for Call to Actions
  dark: '#111827',    // Near Black
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  danger: '#EF4444',
  border: '#E5E7EB',
};

export default function CartScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCart();
  const { isAuthenticated } = useAuth();
  const flatListRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(flatListRef, 100);

  // --- Actions ---
  const handleRemove = (itemId) => {
    removeFromCart(itemId);
    Toast.show({
      type: 'success',
      text1: 'Removed',
      text2: 'Item removed from cart',
    });
  };

  const handleQuantityChange = (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty > 0) updateQuantity(itemId, newQty);
    else handleRemove(itemId);
  };

  // --- Sub-Components ---

  const EmptyState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="cart-outline" size={64} color={COLORS.gray} />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyText}>Looks like you haven't made your choice yet.</Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.primaryBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const LoginState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed-outline" size={64} color={COLORS.gray} />
      </View>
      <Text style={styles.emptyTitle}>Login Required</Text>
      <Text style={styles.emptyText}>Please sign in to view your cart items.</Text>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.primaryBtnText}>Login Now</Text>
      </TouchableOpacity>
    </View>
  );

  const CartItem = ({ item }) => {
    const product = item.product || item;
    const price = product.finalPrice || product.price || 0;
    const imageUrl = product.image || product.thumbnail || product.images?.[0] || '';

    return (
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
            <Image
            source={{ uri: imageUrl }}
            style={styles.itemImage}
            contentFit="cover"
            transition={300}
            />
        </View>

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={styles.itemTopRow}>
            <Text style={styles.itemName} numberOfLines={2}>
              {product.name || product.productName}
            </Text>
            <TouchableOpacity 
                onPress={() => handleRemove(item._id || item.id)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemVariant}>
            {item.size ? `Size: ${item.size}` : 'Standard Variant'}
          </Text>

          <View style={styles.itemBottomRow}>
            <Text style={styles.itemPrice}>₹{price.toLocaleString()}</Text>
            
            {/* Stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity 
                style={styles.stepBtn} 
                onPress={() => handleQuantityChange(item._id || item.id, item.quantity, -1)}
              >
                <Ionicons name="remove" size={16} color={COLORS.dark} />
              </TouchableOpacity>
              
              <Text style={styles.stepValue}>{item.quantity}</Text>
              
              <TouchableOpacity 
                style={styles.stepBtn}
                onPress={() => handleQuantityChange(item._id || item.id, item.quantity, 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // --- Main Render ---

  if (!isAuthenticated) return <LoginState />;
  if (cart.length === 0) return <EmptyState />;

  const total = getCartTotal();
  const itemsCount = getCartItemsCount();
  const shipping = total > 999 ? 0 : 50;
  const finalTotal = total + shipping;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemsCount} items</Text>
        </View>
      </View>

      {/* Free Shipping Progress (Gamification) */}
      <View style={styles.shippingPromo}>
         <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: total > 999 ? '100%' : `${(total/999)*100}%` }]} />
         </View>
         <Text style={styles.shippingText}>
            {total > 999 
                ? "You've unlocked FREE Shipping!" 
                : `Add ₹${999 - total} more for Free Shipping`}
         </Text>
      </View>

      <FlatList
        data={cart}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Checkout Footer */}
      <View style={[styles.footer, { 
        bottom: (Platform.OS === 'ios' ? 90 : 85) + (Platform.OS === 'ios' ? insets.bottom : 0),
        paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : 20 
      }]}>
        <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal</Text>
            <Text style={styles.costValue}>₹{total.toLocaleString()}</Text>
        </View>
        <View style={styles.costRow}>
            <Text style={styles.costLabel}>Shipping</Text>
            <Text style={[styles.costValue, shipping === 0 && { color: COLORS.primary }]}>
                {shipping === 0 ? 'Free' : `₹${shipping}`}
            </Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.costRow, { marginBottom: 20 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{finalTotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.9}
        >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            <View style={styles.btnIcon}>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </View>
        </TouchableOpacity>
      </View>

      {/* Back to Top Button */}
      <BackToTop flatListRef={flatListRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginRight: 10,
  },
  badge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },

  // Promo
  shippingPromo: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  shippingText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 320, // Space for footer + bottom tab bar (250 + 70)
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    // Modern Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
  },
  
  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  stepValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },

  // Empty State
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.bg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryBtn: {
    backgroundColor: COLORS.dark,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  costValue: {
    fontSize: 15,
    color: COLORS.dark,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  btnIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 4,
  },
});