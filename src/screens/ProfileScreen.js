import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import BackToTop, { useBackToTop } from '../components/BackToTop';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#3D2817', // Dark Brown
  secondary: '#F9FAFB', // Off-white BG
  white: '#FFFFFF',
  accent: '#3B82F6', // Blue
  text: '#1F2937',
  textLight: '#6B7280',
  danger: '#EF4444',
  border: '#E5E7EB',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist } = useWishlist();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const { showButton: showBackToTop, handleScroll: handleBackToTopScroll } = useBackToTop(scrollViewRef, 100);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('HomeTab');
        },
      },
    ]);
  };

  // --- Unauthenticated View ---
  if (!isAuthenticated) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <View style={styles.loginCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Welcome!</Text>
          <Text style={styles.emptyText}>
            Sign in to view your profile, track orders, and manage your wishlist.
          </Text>
          
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>Sign In / Join</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Authenticated View ---
  const MenuRow = ({ icon, label, onPress, badge, isDestructive }) => (
    <TouchableOpacity 
      style={styles.menuRow} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconBox, isDestructive && styles.destructiveIconBox]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={isDestructive ? COLORS.danger : COLORS.primary} 
        />
      </View>
      <Text style={[styles.menuLabel, isDestructive && { color: COLORS.danger }]}>
        {label}
      </Text>
      
      <View style={styles.rightContainer}>
        {badge > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }} // Space for floating tab bar
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          handleBackToTopScroll(offsetY);
        }}
        scrollEventThrottle={16}
      >
      {/* Header Profile Section */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>
               {user?.name?.charAt(0).toUpperCase() || 'U'}
             </Text>
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={12} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Wishlist')}>
          <Text style={styles.statNumber}>{wishlist.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </TouchableOpacity>
      </View>

      {/* Account Settings Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>My Account</Text>
        <View style={styles.card}>
          <MenuRow 
            icon="bag-handle-outline" 
            label="My Orders" 
            onPress={() => navigation.navigate('TrackOrder')} 
          />
          <View style={styles.divider} />
          <MenuRow 
            icon="location-outline" 
            label="Shipping Addresses" 
            onPress={() => {}} 
          />
          <View style={styles.divider} />
          <MenuRow 
            icon="card-outline" 
            label="Payment Methods" 
            onPress={() => {}} 
          />
        </View>
      </View>

      {/* App Settings Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          <MenuRow 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => {}} 
            badge={2} 
          />
          <View style={styles.divider} />
          <MenuRow 
            icon="shield-checkmark-outline" 
            label="Privacy & Security" 
            onPress={() => {}} 
          />
          <View style={styles.divider} />
          <MenuRow 
            icon="help-circle-outline" 
            label="Help & Support" 
            onPress={() => {}} 
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.2</Text>
      </ScrollView>

      {/* Back to Top Button */}
      <BackToTop scrollViewRef={scrollViewRef} scrollThreshold={100} showButton={showBackToTop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollView: {
    flex: 1,
  },
  // --- Header Styles ---
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800', // Extra bold for modern look
    color: COLORS.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  
  // --- Stats Row ---
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: -45, // Pull up to overlap header slightly
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  // --- Menu Sections ---
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6', // Light gray icon bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  destructiveIconBox: {
    backgroundColor: '#FEF2F2',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 66, // Align with text, skipping icon
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- Logout & Version ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 10,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#D1D5DB',
    fontSize: 12,
  },

  // --- Login State ---
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    padding: 24,
  },
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FDF2F8', // Very light pink/brown hue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});