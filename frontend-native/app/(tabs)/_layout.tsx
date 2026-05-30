import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Routes } from '@/constants/routes';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

const TAB_ICONS = {
  activity: { active: 'heart', inactive: 'heart-outline' },
  index: { active: 'home', inactive: 'home-outline' },
  profile: { active: 'person-circle', inactive: 'person-circle-outline' },
  reels: { active: 'play-circle', inactive: 'play-circle-outline' },
  search: { active: 'search', inactive: 'search-outline' },
} as const;

function renderIcon(routeName: keyof typeof TAB_ICONS, focused: boolean, color: string) {
  const iconName = focused ? TAB_ICONS[routeName].active : TAB_ICONS[routeName].inactive;
  return <Ionicons color={color} name={iconName} size={26} />;
}

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: AppColors.text,
        tabBarInactiveTintColor: AppColors.tabInactive,
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => renderIcon('index', focused, color),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => renderIcon('search', focused, color),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          tabBarActiveTintColor: AppColors.surface, // Màu trắng cho icon khi ở tab Reels
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarStyle: {
            ...styles.tabBar,
            backgroundColor: '#000000',
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0, 
            bottom: 0,
          },
          tabBarIcon: ({ color, focused }) => renderIcon('reels', focused, color),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          tabBarIcon: ({ color, focused }) => renderIcon('activity', focused, color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => renderIcon('profile', focused, color),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: AppColors.background,
    flex: 1,
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
