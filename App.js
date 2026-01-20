import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
