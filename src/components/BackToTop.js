import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BackToTop({ scrollViewRef, flatListRef, scrollThreshold = 100, showButton = false }) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(false);

  // Update visibility based on showButton prop
  useEffect(() => {
    // Hide when showButton is false (user scrolled back to top)
    // Show when showButton is true (user scrolled down past threshold)
    setIsVisible(showButton);
  }, [showButton]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const scrollToTop = () => {
    // Immediately hide the button
    setIsVisible(false);
    
    // Then scroll to top
    try {
      if (scrollViewRef && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      } else if (flatListRef && flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('Error scrolling to top:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={scrollToTop}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-up" size={20} color="#fff" />
        <Text style={styles.buttonText}>Back to Top</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Export the scroll handler function
export const useBackToTop = (scrollViewRef, scrollThreshold = 100) => {
  const [showButton, setShowButton] = useState(false);

  const handleScroll = (offsetY) => {
    // Hide button when at top (offsetY <= 0 or very small)
    // Show button only when scrolled past threshold
    const shouldShow = offsetY > scrollThreshold;
    if (shouldShow !== showButton) {
      setShowButton(shouldShow);
    }
  };

  return { showButton, handleScroll };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    zIndex: 1000,
    elevation: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
