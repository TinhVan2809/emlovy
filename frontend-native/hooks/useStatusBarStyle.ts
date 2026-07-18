import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

export function useStatusBarStyle(style: 'auto' | 'inverted' | 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
    }, [style])
  );
}