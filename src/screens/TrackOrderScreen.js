import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { trackingAPI } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function TrackOrderScreen() {
  const route = useRoute();
  const orderId = route.params?.orderId;
  const [trackingId, setTrackingId] = useState(orderId || '');
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      trackOrder(orderId);
    }
  }, [orderId]);

  const trackOrder = async (id) => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await trackingAPI.trackOrder(id);
      if (response.success) {
        setOrderStatus(response.data);
      }
    } catch (error) {
      console.error('Tracking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Order ID"
          value={trackingId}
          onChangeText={setTrackingId}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => trackOrder(trackingId)}
        >
          <Text style={styles.searchButtonText}>Track</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : orderStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Order Status</Text>
          <Text style={styles.statusText}>{orderStatus.status || 'Unknown'}</Text>

          <View style={styles.timeline}>
            {statusSteps.map((step, index) => {
              const currentIndex = getStatusIndex(orderStatus.status);
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineContent}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotCompleted,
                        isCurrent && styles.timelineDotCurrent,
                      ]}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Enter order ID to track</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3D2817',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  statusContainer: {
    padding: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3D2817',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    marginBottom: 24,
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineDotCurrent: {
    backgroundColor: '#3D2817',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#999',
  },
  timelineLabelCompleted: {
    color: '#333',
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#ddd',
    marginLeft: 15,
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
});
