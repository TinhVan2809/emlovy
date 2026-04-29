/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const AppColors = {
  background: '#F6F1EA',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF8EE',
  text: '#161616',
  muted: '#727272',
  border: '#E8DFD4',
  tabInactive: '#9A948D',
  accent: '#F25F4C',
  accentSoft: '#FFE0D4',
  success: '#1F9D6E',
  shadow: '#2A1C16',
};

export const AppFonts = {
  brand:
    Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'Georgia',
    }) ?? 'serif',
  heading:
    Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif-medium',
      default: 'system-ui',
    }) ?? 'System',
  body:
    Platform.select({
      ios: 'Avenir Next',
      android: 'sans-serif',
      default: 'system-ui',
    }) ?? 'System',
};
