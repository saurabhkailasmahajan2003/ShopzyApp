import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Screens (Imports remain the same)
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';
import SearchScreen from '../screens/SearchScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Brand Colors
const COLORS = {
  primary: '#3D2817', // Dark Brown
  accent: '#3B82F6',  // Blue
  background: '#F9FAFB',
  white: '#FFFFFF',
  danger: '#EF4444',
  text: '#1F2937',
  inactive: '#9CA3AF'
};

function HomeTabs() {
  const insets = useSafeAreaInsets();
  const { cart } = useCart();
  
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false, // Modern apps often hide labels or keep them very subtle
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: COLORS.white,
          borderRadius: 25,
          height: 65,
          borderTopWidth: 0,
          paddingBottom: 0, // Reset padding
          ...styles.shadow, // Custom shadow
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'OrderAgainTab') iconName = focused ? 'bag-handle' : 'bag-handle-outline';
          else if (route.name === 'CategoriesTab') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

          // Cart Icon with Badge
          if (route.name === 'OrderAgainTab') {
            return (
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, focused && styles.activeIconBackground]}>
                    <Ionicons name={iconName} size={24} color={color} />
                </View>
                {cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          }

          // Standard Icons
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
                <View style={[styles.iconBackground, focused && styles.activeIconBackground]}>
                    <Ionicons name={iconName} size={24} color={color} />
                </View>
                {/* Optional: Little dot below active icon */}
                {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="CategoriesTab" component={CategoryScreen} />
      <Tab.Screen name="OrderAgainTab" component={CartScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerShadowVisible: false, // Removes the ugly line under header
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: COLORS.primary,
        },
        headerTitleAlign: 'center', // Center title like iOS
        headerBackTitleVisible: false, // Remove "Back" text next to arrow
        contentStyle: { backgroundColor: COLORS.background }, // Global BG color
        animation: 'slide_from_right', // iOS style animation on Android too
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={HomeTabs}
        options={{ headerShown: false }}
      />

      {/* Categories & Products */}
      <Stack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen}
        options={{ headerShown: false }} // Hide navigation header, using custom header instead
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ 
            title: '', // Minimalist: remove title for details
            headerTransparent: true, // Optional: Makes header see-through if you have an image at top
            headerTintColor: COLORS.primary,
            headerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' } // Frosted look
        }}
      />

      {/* Cart & Checkout Flow */}
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      
      {/* Auth Flow - Use Modal Presentation */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ 
            title: 'Welcome Back',
            presentation: 'modal', // Slides up from bottom
            animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ 
            title: 'Create Account',
            presentation: 'modal',
            animation: 'slide_from_bottom'
        }}
      />

      {/* Utility Screens */}
      <Stack.Screen 
        name="OrderSuccess" 
        component={OrderSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen 
        name="TrackOrder" 
        component={TrackOrderScreen}
        options={{ title: 'Track Order' }}
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen}
        options={{ title: 'My Wishlist' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#3D2817',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10, // Softer blur
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.OS === 'ios' ? 10 : 0
  },
  iconBackground: {
    padding: 8,
    borderRadius: 12,
  },
  activeIconBackground: {
            backgroundColor: '#EFF6FF', // Very light blue bg for active tab
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
});