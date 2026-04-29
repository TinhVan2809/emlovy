import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/post-card';
import { ScreenShell } from '@/components/screen-shell';
import { posts, stories } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ScreenShell
      titleNode={<Text style={styles.brand}>emlovy</Text>}
      right={
        <View style={styles.headerActions}>
          <Ionicons color={AppColors.text} name="heart-outline" size={24} />
          <View>
            <Ionicons color={AppColors.text} name="paper-plane-outline" size={24} />
            <View style={styles.badge} />
          </View>
        </View>
      }>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.storySection}>
          <ScrollView
            contentContainerStyle={styles.storyRow}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {stories.map((story) => (
              <View key={story.id} style={styles.storyItem}>
                <View style={[styles.storyRing, { backgroundColor: story.accent }]}>
                  <View style={[styles.storyCore, { backgroundColor: story.tone }]}>
                    <Text style={styles.storyInitial}>{story.initials}</Text>
                  </View>
                  {story.isOwn ? (
                    <View style={styles.storyPlus}>
                      <Ionicons color={AppColors.surface} name="add" size={12} />
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={styles.storyName}>
                  {story.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.filterRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {['Dành cho bạn', 'Following', 'Fresh drops', 'Saved'].map((filter, index) => (
            <View
              key={filter}
              style={[styles.filterChip, index === 0 ? styles.filterChipActive : null]}>
              <Text style={[styles.filterText, index === 0 ? styles.filterTextActive : null]}>
                {filter}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>New today</Text>
          <Text style={styles.feedMeta}>3 bài đăng mới</Text>
        </View>

        <View style={styles.feedStack}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: AppColors.accent,
    borderColor: AppColors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: -2,
    top: -1,
    width: 10,
  },
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 30,
    fontStyle: 'italic',
  },
  content: {
    gap: 20,
    paddingBottom: 28,
  },
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  feedMeta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  feedStack: {
    gap: 18,
    paddingHorizontal: 18,
  },
  feedTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  storyCore: {
    alignItems: 'center',
    borderColor: AppColors.surface,
    borderRadius: 28,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
  },
  storyInitial: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
  },
  storyItem: {
    alignItems: 'center',
    gap: 8,
    width: 74,
  },
  storyName: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  storyPlus: {
    alignItems: 'center',
    backgroundColor: AppColors.success,
    borderColor: AppColors.surface,
    borderRadius: 10,
    borderWidth: 2,
    bottom: -2,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: -1,
    width: 20,
  },
  storyRing: {
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    padding: 3,
    width: 68,
  },
  storyRow: {
    gap: 14,
    paddingHorizontal: 18,
  },
  storySection: {
    paddingTop: 6,
  },
});
