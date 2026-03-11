import React, { useEffect } from 'react';
import { Stack, useSegments, Redirect } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { session, loading, guestMode, signOutWantsLogin, clearSignOutWantsLogin } = useAuth();
  const segments = useSegments();

  // Clear the sign-out flag only after we've landed on login (avoid clearing before Redirect runs)
  useEffect(() => {
    if (segments[0] === 'login' && signOutWantsLogin) {
      clearSignOutWantsLogin();
    }
  }, [segments[0], signOutWantsLogin]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const inTabs = segments[0] === '(tabs)';
  const onLogin = segments[0] === 'login';

  if (signOutWantsLogin || (!session && !guestMode && inTabs)) {
    return <Redirect href="/login" />;
  }

  if ((session || guestMode) && onLogin) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <RootLayoutNav />
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
