import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/theme';
import { useNotificationSound } from '@/hooks/useNotificationSound';

export function NotificationSoundSettings() {
  const { isEnabled, toggleSound, playTestSound } = useNotificationSound();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons color={AppColors.accent} name="notifications" size={24} />
        <Text style={styles.headerTitle}>Âm thanh thông báo</Text>
      </View>

      <Text style={styles.description}>
        Bật âm thanh khi nhận tin nhắn mới, giúp bạn không bỏ lỡ cuộc trò chuyện quan trọng.
      </Text>

      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons color={AppColors.text} name="volume-high" size={22} />
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Âm thanh tin nhắn</Text>
            <Text style={styles.settingSubtext}>
              {isEnabled ? 'Đang bật' : 'Đang tắt'}
            </Text>
          </View>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: AppColors.border, true: AppColors.accent }}
          thumbColor={AppColors.surface}
        />
      </View>

      {isEnabled ? (
        <Pressable
          onPress={playTestSound}
          style={({ pressed }) => [
            styles.testButton,
            pressed && styles.testButtonPressed,
          ]}
        >
          <Ionicons color={AppColors.accent} name="play-circle-outline" size={20} />
          <Text style={styles.testButtonText}>Nghe thử âm thanh</Text>
        </Pressable>
      ) : null}

      <View style={styles.infoBox}>
        <Ionicons color={AppColors.muted} name="information-circle-outline" size={18} />
        <Text style={styles.infoText}>
          Âm thanh sẽ phát ngay cả khi điện thoại ở chế độ im lặng (iOS).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  description: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  headerTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
  infoBox: {
    alignItems: 'flex-start',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    padding: 14,
  },
  infoText: {
    color: AppColors.muted,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  settingLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 16,
  },
  settingSubtext: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  testButton: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.accent,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 14,
  },
  testButtonPressed: {
    opacity: 0.7,
  },
  testButtonText: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
});
