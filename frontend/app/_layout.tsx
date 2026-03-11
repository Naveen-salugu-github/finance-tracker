import React from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';

function useProtectedRoute() {
  const { session, loading, guestMode, signOutWantsLogin, clearSignOutWantsLogin } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (signOutWantsLogin) {
      clearSignOutWantsLogin();
      router.replace('/login');
      return;
    }

    const inTabs = segments[0] === '(tabs)';
    const onLogin = segments[0] === 'login';

    if (!session && !guestMode && inTabs) {
      router.replace('/login');
    } else if ((session || guestMode) && onLogin) {
      router.replace('/(tabs)');
    }
  }, [session, loading, guestMode, signOutWantsLogin, segments]);
}

function RootLayoutNav() {
  const { session, loading } = useAuth();
  useProtectedRoute();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
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
