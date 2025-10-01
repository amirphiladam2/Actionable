const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper platform detection
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add platform-specific resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
