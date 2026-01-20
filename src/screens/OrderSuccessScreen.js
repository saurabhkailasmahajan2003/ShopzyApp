import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderSuccessScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const orderId = route.params?.orderId;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.message}>
          Thank you for your order. Your order has been placed and will be processed shortly.
        </Text>
        {orderId && (
          <Text style={styles.orderId}>Order ID: {orderId}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('TrackOrder', { orderId })}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Track Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D2817',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  orderId: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  actions: {
    width: '100%',
  },
  button: {
    backgroundColor: '#3D2817',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3D2817',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3D2817',
  },
});
