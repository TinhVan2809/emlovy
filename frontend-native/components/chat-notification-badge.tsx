import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors, AppFonts } from '@/constants/theme';

type ChatNotificationBadgeProps = {
  count: number;
  size?: 'small' | 'medium' | 'large';
};

/**
 * Component hiển thị badge thông báo tin nhắn chưa đọc
 * 
 * @param count - Số lượng tin nhắn chưa đọc
 * @param size - Kích thước badge (mặc định: 'medium')
 * 
 */
export function ChatNotificationBadge({ 
  count, 
  size = 'medium' 
}: ChatNotificationBadgeProps) {
  console.log('[ChatNotificationBadge] Rendering with count:', count, 'size:', size);
  
  if (count <= 0) {
    console.log('[ChatNotificationBadge] Count is 0 or negative, returning null');
    return null;
  }

  const sizeStyles = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium,
    large: styles.badgeLarge,
  };

  const textSizeStyles = {
    small: styles.badgeTextSmall,
    medium: styles.badgeTextMedium,
    large: styles.badgeTextLarge,
  };

  // Hiển thị số nếu <= 99, nếu > 99 => Hiển thị "99+"
  const displayText = count <= 99 ? String(count) : "99+";
  
  console.log('[ChatNotificationBadge] Will display:', displayText);

  return (
    <View style={[styles.badge, sizeStyles[size]]}>
      <Text style={[styles.badgeText, textSizeStyles[size]]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: AppColors.accent,
    borderColor: AppColors.surface,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -2,
  },
  badgeSmall: {
    height: 12,
    minWidth: 12,
    paddingHorizontal: 2,
  },
  badgeMedium: {
    height: 16,
    minWidth: 16,
    paddingHorizontal: 3,
  },
  badgeLarge: {
    height: 20,
    minWidth: 20,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeTextSmall: {
    fontSize: 7,
    lineHeight: 8,
  },
  badgeTextMedium: {
    fontSize: 9,
    lineHeight: 10,
  },
  badgeTextLarge: {
    fontSize: 11,
    lineHeight: 12,
  },
});
