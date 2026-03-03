import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './context/DataContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </DataProvider>
    </SafeAreaProvider>
  );
}
