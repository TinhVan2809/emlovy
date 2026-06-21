import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/auth-context";
import { AppColors } from "@/constants/theme";

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
  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}
