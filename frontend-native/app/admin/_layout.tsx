import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Routes } from "@/constants/routes";
import { AppColors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

const TAB_ICONS = {
  index: { active: "apps", inactive: "apps-outline" },
  home: { active: "home", inactive: "home-outline" },
  management: { active: "settings", inactive: "settings-outline" },
  teature: { active: "star", inactive: "star-outline" },
  search: { active: "search", inactive: "search-outline" },
  profile: { active: "person-circle", inactive: "person-circle-outline" },
} as const;

function renderIcon(
  routeName: keyof typeof TAB_ICONS,
  focused: boolean,
  color: string,
) {
  const iconName = focused
    ? TAB_ICONS[routeName].active
    : TAB_ICONS[routeName].inactive;
  return <Ionicons color={color} name={iconName} size={26} />;
}

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={Routes.login} />;
  }

  if (user?.role !== "admin") {
    return <Redirect href={Routes.home} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.tabInactive,
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* Hide the dashboard folder as a separate tab; its screens are in a nested Stack */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("index", focused, color),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("home", focused, color),
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("management", focused, color),
        }}
      />
      <Tabs.Screen
        name="teature"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("teature", focused, color),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("search", focused, color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) =>
            renderIcon("profile", focused, color),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: AppColors.background,
    flex: 1,
    justifyContent: "center",
  },
  scene: {
    backgroundColor: AppColors.background,
  },
  tabBar: {
    backgroundColor: AppColors.surface,
    borderTopColor: AppColors.border,
    height: 72,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
