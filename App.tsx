import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from './src/design/tokens';
import Toast from 'react-native-toast-message';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('./assets/fonts/Inter-Regular.ttf'),
    Inter_600SemiBold: require('./assets/fonts/Inter-SemiBold.ttf'),
    Inter_700Bold: require('./assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <RootNavigator />
        <OfflineBanner />
        <Toast />
      </Provider>
    </ErrorBoundary>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
});
