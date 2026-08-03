import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
import { UnreadMessagesProvider } from "@/contexts/unread-messages-context";
import { AppColors } from "@/constants/theme";
import { notificationSound } from "@/services/notification-sound";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: AppColors.background,
    border: AppColors.border,
    card: AppColors.surface,
    notification: AppColors.accent,
    primary: AppColors.text,
    text: AppColors.text,
  },
};

export default function RootLayout() {
  // Initialize notification sound service
  useEffect(() => {
    notificationSound.initialize();

    return () => {
      notificationSound.cleanup();
    };
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <UnreadMessagesProvider>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: AppColors.background },
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
        </UnreadMessagesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
