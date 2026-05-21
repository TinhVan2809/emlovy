import type { Href } from 'expo-router';

export const Routes = {
  home: '/(tabs)' as Href,
  chat: '/(chat)/chat' as Href,
  editProfile: '/(tabs)/edit-profile' as Href,
  login: '/login' as Href,
  register: '/register' as Href,
  setting: '/(setting)/setting' as Href,
};

export const settingRoutes = {
  more: '/(setting)/more-setting' as Href,
};

export const postRoutes = {
  posts: '/(posts)/page' as Href,
}

export const followRoutes = {
  followers: '/(follows)/followers' as Href,
  following: '/(follows)/following' as Href,
}

