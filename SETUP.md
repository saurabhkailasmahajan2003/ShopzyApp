# Shopzy Mobile App - Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (install globally: `npm install -g expo-cli`)
4. For iOS: **Xcode** (Mac only)
5. For Android: **Android Studio**

## Installation Steps

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - **iOS Simulator:** Press `i` in the terminal or run `npm run ios`
   - **Android Emulator:** Press `a` in the terminal or run `npm run android`
   - **Physical Device:** 
     - Install Expo Go app from App Store (iOS) or Play Store (Android)
     - Scan the QR code shown in the terminal

## Project Structure

```
mobile/
├── App.js                    # Main entry point
├── app.json                  # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   └── utils/             # Utility functions and API
└── assets/                 # Images, fonts, etc. (create if needed)
```

## Backend Configuration

The app is configured to use the backend API at:
```
https://api.shopzyfashion.in/api
```

This is set in `src/utils/api.js`. If you need to change it, modify the `API_BASE_URL` constant.

## Features

- ✅ Product browsing and search
- ✅ Shopping cart
- ✅ Wishlist
- ✅ User authentication
- ✅ Order placement
- ✅ Order tracking
- ✅ Profile management

## Troubleshooting

### Common Issues

1. **Metro bundler errors:**
   - Clear cache: `npx expo start -c`
   - Delete `node_modules` and reinstall

2. **iOS build issues:**
   - Make sure Xcode is properly installed
   - Run `pod install` in `ios/` directory (if using bare workflow)

3. **Android build issues:**
   - Make sure Android Studio and SDK are installed
   - Set up Android emulator or connect physical device

4. **API connection issues:**
   - Check if backend is running
   - Verify API URL in `src/utils/api.js`
   - Check network connectivity

## Development Tips

- Use React Native Debugger for debugging
- Enable Fast Refresh for hot reloading
- Use Expo DevTools for better development experience
- Test on both iOS and Android devices

## Building for Production

For production builds, you'll need to:

1. **Configure app.json** with proper bundle identifiers
2. **Build using EAS (Expo Application Services)** or **expo build**
3. **Submit to App Store/Play Store**

For more details, see: https://docs.expo.dev/build/introduction/
