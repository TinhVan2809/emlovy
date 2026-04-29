import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { activitySections } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';

export default function ActivityScreen() {
  return (
    <ScreenShell
      title="Hoạt động"
      right={<Ionicons color={AppColors.text} name="filter-outline" size={24} />}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView
          contentContainerStyle={styles.filterRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {['Tất cả', 'Likes', 'Comments', 'Follow'].map((item, index) => (
            <View key={item} style={[styles.filterChip, index === 0 ? styles.filterChipActive : null]}>
              <Text style={[styles.filterText, index === 0 ? styles.filterTextActive : null]}>
                {item}
              </Text>
            </View>
          ))}
        </ScrollView>

        {activitySections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionList}>
              {section.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={[styles.avatarRing, { backgroundColor: item.accent }]}>
                    <View style={[styles.avatarCore, { backgroundColor: item.tone }]}>
                      <Text style={styles.avatarText}>{item.user.slice(0, 1)}</Text>
                    </View>
                  </View>

                  <View style={styles.itemCopy}>
                    <Text style={styles.itemMessage}>
                      <Text style={styles.itemUser}>{item.user} </Text>
                      {item.message}
                    </Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>

                  {item.buttonLabel ? (
                    <View style={styles.followButton}>
                      <Text style={styles.followText}>{item.buttonLabel}</Text>
                    </View>
                  ) : (
                    <View style={[styles.preview, { backgroundColor: item.previewTone ?? item.tone }]}>
                      <View style={[styles.previewAccent, { backgroundColor: item.accent }]} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  avatarCore: {
    alignItems: 'center',
    borderColor: AppColors.surface,
    borderRadius: 22,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
  },
  avatarRing: {
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    padding: 2,
    width: 50,
  },
  avatarText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
    textTransform: 'uppercase',
  },
  content: {
    gap: 22,
    paddingBottom: 28,
    paddingTop: 18,
  },
  filterChip: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  filterRow: {
    gap: 10,
    paddingHorizontal: 18,
  },
  filterText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  filterTextActive: {
    color: AppColors.surface,
  },
  followButton: {
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderRadius: 14,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  followText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
  },
  itemMessage: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  itemTime: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  itemUser: {
    fontFamily: AppFonts.heading,
  },
  preview: {
    borderRadius: 16,
    height: 56,
    overflow: 'hidden',
    width: 56,
  },
  previewAccent: {
    borderRadius: 20,
    height: 38,
    opacity: 0.22,
    position: 'absolute',
    right: -6,
    top: -8,
    width: 38,
  },
  section: {
    gap: 14,
    paddingHorizontal: 18,
  },
  sectionList: {
    backgroundColor: AppColors.surface,
    borderRadius: 24,
    gap: 18,
    padding: 18,
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 19,
  },
});
