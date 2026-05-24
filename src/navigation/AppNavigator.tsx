import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppStackParamList } from '../types/navigation';
import HomeScreen from '../screens/Home';
import PersonDetailScreen from '../screens/PersonDetail';
import AddPersonScreen from '../screens/AddEditPerson';
import SettingsScreen from '../screens/Settings';
import AddTransactionScreen from '../screens/AddEditTransaction';
import { Colors, Spacing, Typography, Radius } from '../design/tokens';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>🏠</Text>
    </View>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>⚙️</Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as any}
        options={{
          tabBarLabel: 'Ledger',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen as any}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen
        name="PersonDetail"
        component={PersonDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditPerson"
        component={AddPersonScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditTransaction"
        component={AddTransactionScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </Stack.Navigator>

  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surfaceCard,
    borderTopColor: Colors.outlineVariant,
    borderTopWidth: 1,
    paddingTop: 4,
    paddingBottom: 8,
    height: 64,
  },
  tabLabel: {
    ...Typography.bodySm,
    fontSize: 11,
    marginTop: 2,
  },
  tabIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.DEFAULT,
  },
  tabIconActive: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  tabIconText: {
    fontSize: 18,
  },
  tabIconTextActive: {
    fontSize: 18,
  },
});
