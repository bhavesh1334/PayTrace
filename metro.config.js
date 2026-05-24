const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'cjs' to support Firebase JS SDK v10 modules
config.resolver.sourceExts.push('cjs');

// Disable package exports to force Metro to resolve Firebase using the
// traditional 'react-native' field in package.json, which properly maps to
// the React Native build of Firebase instead of the browser/web ESM build.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
