# Shopzy Mobile App

React Native mobile application for Shopzy Fashion e-commerce platform.

## Features

- 🛍️ Product browsing by categories (Watches, Lenses, Accessories, Women's Fashion, Shoes, Skincare)
- 🔍 Product search functionality
- 🛒 Shopping cart management
- ❤️ Wishlist functionality
- 👤 User authentication (Login/Signup)
- 📦 Order placement and tracking
- 💳 Payment integration (Cash on Delivery)
- 📱 Mobile-optimized UI/UX

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```


## Project Structure

```
mobile/
├── App.js                 # Main app component
├── src/
│   ├── components/        # Reusable components
│   │   └── ProductCard.js
│   ├── context/          # React Context providers
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── WishlistContext.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.js
│   │   ├── CategoryScreen.js
│   │   ├── ProductDetailScreen.js
│   │   ├── CartScreen.js
│   │   ├── CheckoutScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── SearchScreen.js
│   │   ├── OrderSuccessScreen.js
│   │   └── TrackOrderScreen.js
│   └── utils/           # Utility functions
│       └── api.js        # API integration
└── package.json
```

## Technologies Used

- React Native
- Expo
- React Navigation
- AsyncStorage
- React Context API

## Notes

- Make sure you have Expo CLI installed globally: `npm install -g expo-cli`
- For iOS development, you need a Mac with Xcode installed
- For Android development, you need Android Studio installed
