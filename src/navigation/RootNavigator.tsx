import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth, useAuthInit } from "../hooks/useAuth";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "../design/tokens";

function AppWithSessionGuard() {
  // Activates biometric re-auth on background inactivity
  useSessionTimeout();
  return <AppNavigator />;
}

export default function RootNavigator() {
  useAuthInit();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppWithSessionGuard /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
});
