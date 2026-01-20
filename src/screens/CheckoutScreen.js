import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { cart, getCartTotal, clearCart } = useCart();
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      };

      const response = await orderAPI.createOrder(shippingAddress, paymentMethod);

      if (response.success) {
        await clearCart();
        navigation.replace('OrderSuccess', { orderId: response.data.order._id });
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color="#3D2817" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={address.name}
                onChangeText={(text) => setAddress({ ...address, name: text })}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={address.phone}
                onChangeText={(text) => setAddress({ ...address, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Address *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your complete address"
                placeholderTextColor="#999"
                value={address.address}
                onChangeText={(text) => setAddress({ ...address, address: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputWrapper, styles.halfWidth]}>
              <Text style={styles.label}>City *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#999"
                  value={address.city}
                  onChangeText={(text) => setAddress({ ...address, city: text })}
                />
              </View>
            </View>

            <View style={[styles.inputWrapper, styles.halfWidth]}>
              <Text style={styles.label}>State *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor="#999"
                  value={address.state}
                  onChangeText={(text) => setAddress({ ...address, state: text })}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Pincode *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter pincode"
                placeholderTextColor="#999"
                value={address.pincode}
                onChangeText={(text) => setAddress({ ...address, pincode: text })}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#3D2817" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'COD' && styles.paymentOptionSelected
            ]}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[
                styles.radioButton,
                paymentMethod === 'COD' && styles.radioButtonSelected
              ]}>
                {paymentMethod === 'COD' && <View style={styles.radioButtonInner} />}
              </View>
              <Ionicons name="cash-outline" size={24} color="#3D2817" />
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentOptionSubtitle}>Pay when you receive</Text>
              </View>
            </View>
            {paymentMethod === 'COD' && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={24} color="#3D2817" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
              <Text style={styles.summaryValue}>₹{total.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.shippingFree}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={['#3D2817', '#5A3D2A']}
            style={styles.buttonGradient}
          >
            <Text style={styles.placeOrderButtonText}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D2817',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  paymentOptionSelected: {
    borderColor: '#3D2817',
    backgroundColor: '#FFF9F0',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3D2817',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3D2817',
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  shippingFree: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3D2817',
  },
  placeOrderButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3D2817',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 20,
  },
});
