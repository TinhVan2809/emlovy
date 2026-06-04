import React from 'react';
import { Stack } from 'expo-router';

// Nested Stack layout for the admin dashbroad section.
// This prevents Expo Router from promoting the inner screens to the parent Tabs.
export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
