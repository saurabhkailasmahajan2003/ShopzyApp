# Expo Setup Guide for Shopzy Mobile App

## ✅ Expo Configuration Complete

Your React Native app is fully configured to use **Expo**! Here's what's been set up:

### 📦 Expo Dependencies

All Expo-compatible packages are installed:
- `expo` - Core Expo framework
- `expo-status-bar` - Status bar component
- `expo-image` - Optimized image component (replaces React Native Image)
- `@expo/vector-icons` - Icon library
- `expo-constants` - App constants
- `expo-linear-gradient` - Gradient support

### 🎯 Key Expo Features Used

1. **Expo Image** - All images use `expo-image` for better performance
2. **Expo Vector Icons** - Using `@expo/vector-icons` for all icons
3. **Expo Status Bar** - Using `expo-status-bar` for status bar control
4. **Expo Navigation** - React Navigation configured for Expo

### 🚀 Quick Start

1. **Install Expo CLI globally** (if not already installed):
   ```bash
   npm install -g expo-cli
   ```

2. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start Expo development server:**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device:**
   - **iOS Simulator:** Press `i` or run `npm run ios`
   - **Android Emulator:** Press `a` or run `npm run android`
   - **Physical Device:** 
     - Install **Expo Go** app from App Store/Play Store
     - Scan the QR code shown in terminal

### 📱 Expo Go vs Development Build

**Expo Go (Current Setup):**
- ✅ Fast development
- ✅ No native code compilation needed
- ✅ Test on real devices instantly
- ⚠️ Limited to Expo SDK APIs

**Development Build (For Production):**
- Full access to native modules
- Custom native code support
- Use `eas build` or `expo build`

### 🔧 Expo Commands

```bash
# Start development server
expo start

# Start with clear cache
expo start -c

# Start in tunnel mode (for testing on different networks)
expo start --tunnel

# Start for web
expo start --web

# Build for production
eas build --platform ios
eas build --platform android
```

### 📂 Project Structure

```
mobile/
├── App.js              # Main entry (Expo entry point)
├── app.json           # Expo configuration
├── metro.config.js    # Metro bundler config
├── babel.config.js    # Babel config
└── src/               # Source code
```

### 🎨 Expo Configuration (app.json)

- **Name:** Shopzy
- **Slug:** shopzy-mobile
- **Version:** 1.0.0
- **Orientation:** Portrait
- **iOS Bundle ID:** com.shopzy.mobile
- **Android Package:** com.shopzy.mobile

### 🔄 What's Different with Expo

1. **No `ios/` or `android/` folders** - Expo manages these
2. **Use `expo-image` instead of `Image`** - Better performance
3. **Use `@expo/vector-icons`** - Built-in icon library
4. **Simplified build process** - No Xcode/Android Studio needed for development

### 🐛 Troubleshooting

**Issue: Metro bundler errors**
```bash
expo start -c  # Clear cache
```

**Issue: Can't connect to Expo server**
- Make sure phone and computer are on same network
- Try tunnel mode: `expo start --tunnel`

**Issue: Dependencies not found**
```bash
rm -rf node_modules
npm install
```

### 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo SDK Reference](https://docs.expo.dev/versions/latest/)
- [Expo Image Docs](https://docs.expo.dev/versions/latest/sdk/image/)
- [React Navigation with Expo](https://reactnavigation.org/docs/getting-started)

### ✨ Next Steps

1. Test the app on your device using Expo Go
2. Customize `app.json` with your app details
3. Add app icons and splash screens to `assets/` folder
4. When ready for production, use EAS Build

---

**Your app is ready to run with Expo!** 🎉
