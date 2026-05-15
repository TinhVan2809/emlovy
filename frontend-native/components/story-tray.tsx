import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Story as MockStory } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';
import { resolveMediaUrl } from '@/services/api';
import type { StoryGroup } from '@/types/auth';

type StoryTrayProps = {
  groups: StoryGroup[];
  fallbackStories: MockStory[];
  onCreateStory: () => void;
};

const getInitials = (name?: string | null) =>
  (name || 'E')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const getStoryPreview = (group: StoryGroup) => {
  const latest = group.stories[0];
  const imageUrl = resolveMediaUrl(latest?.media.find((item) => item.type === 'image')?.media_url);

  return {
    backgroundColor: latest?.background_color || AppColors.surfaceMuted,
    imageUrl,
    initials: getInitials(group.author?.name),
    label: group.is_own ? 'Ban' : group.author?.name || 'Emlovy',
  };
};

export function StoryTray({ fallbackStories, groups, onCreateStory }: StoryTrayProps) {
  const ownGroup = groups.find((group) => group.is_own);
  const otherGroups = groups.filter((group) => !group.is_own);
  const fallbackOwn = fallbackStories.find((story) => story.isOwn) || fallbackStories[0];

  return (
    <ScrollView contentContainerStyle={styles.storyRow} horizontal showsHorizontalScrollIndicator={false}>
      {ownGroup ? (
        <StoryGroupItem group={ownGroup} onCreateStory={onCreateStory} />
      ) : (
        <Pressable onPress={onCreateStory} style={styles.storyItem}>
          <View style={[styles.storyRing, { backgroundColor: fallbackOwn.accent }]}>
            <View style={[styles.storyCore, { backgroundColor: fallbackOwn.tone }]}>
              <Text style={styles.storyInitial}>{fallbackOwn.initials}</Text>
            </View>
            <View style={styles.storyPlus}>
              <Ionicons color={AppColors.surface} name="add" size={12} />
            </View>
          </View>
          <Text numberOfLines={1} style={styles.storyName}>
            Ban
          </Text>
        </Pressable>
      )}

      {otherGroups.length > 0
        ? otherGroups.map((group) => <StoryGroupItem key={group.user_id} group={group} />)
        : fallbackStories
            .filter((story) => !story.isOwn)
            .map((story) => (
              <View key={story.id} style={styles.storyItem}>
                <View style={[styles.storyRing, { backgroundColor: story.accent }]}>
                  <View style={[styles.storyCore, { backgroundColor: story.tone }]}>
                    <Text style={styles.storyInitial}>{story.initials}</Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={styles.storyName}>
                  {story.name}
                </Text>
              </View>
            ))}
    </ScrollView>
  );
}

function StoryGroupItem({ group, onCreateStory }: { group: StoryGroup; onCreateStory?: () => void }) {
  const preview = getStoryPreview(group);

  return (
    <Pressable onPress={group.is_own ? onCreateStory : undefined} style={styles.storyItem}>
      <View style={styles.storyRing}>
        <View style={[styles.storyCore, { backgroundColor: preview.backgroundColor }]}>
          {preview.imageUrl ? (
            <Image contentFit="cover" source={{ uri: preview.imageUrl }} style={styles.storyImage} />
          ) : (
            <Text style={styles.storyInitial}>{preview.initials}</Text>
          )}
        </View>
        {group.is_own ? (
          <View style={styles.storyPlus}>
            <Ionicons color={AppColors.surface} name="add" size={12} />
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.storyName}>
        {preview.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  storyCore: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.surface,
    borderRadius: 28,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storyImage: {
    height: '100%',
    width: '100%',
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
    backgroundColor: AppColors.accent,
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
});
