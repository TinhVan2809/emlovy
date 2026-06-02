import type { Href } from 'expo-router';

export const Routes = {
  home: '/(tabs)' as Href,
  admin: '/admin' as Href,
  chat: '/(chat)/chat' as Href,
  editProfile: '/(tabs)/edit-profile' as Href,
  login: '/login' as Href,
  profile: '/(tabs)/profile' as Href,
  register: '/register' as Href,
  setting: '/(setting)/setting' as Href,
};

// Route setting
export const settingRoutes = {
  more: '/(setting)/more-setting' as Href,
};


// Route posts posts (your posts)
export const postRoutes = {
  posts: '/(posts)/page' as Href,
}

// Route follow (follower, following)
export const followRoutes = {
  followers: '/(follows)/followers' as Href,
  following: '/(follows)/following' as Href,
}

// Route auth (Quên mật khẩu)
export const authRoute = {
  forget: '/(auth)/forgetPassword' as Href,
}