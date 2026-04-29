import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Post } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';
import { VisualTile } from '@/components/visual-tile';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const initial = post.user.slice(0, 1).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={[styles.avatarRing, { backgroundColor: post.accent }]}>
            <View style={[styles.avatarCore, { backgroundColor: post.tone }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>

          <View style={styles.userMeta}>
            <Text style={styles.userName}>{post.user}</Text>
            <Text style={styles.location}>{post.location}</Text>
          </View>
        </View>

        <Ionicons color={AppColors.text} name="ellipsis-horizontal" size={20} />
      </View>

      <VisualTile accent={post.accent} height={338} label={post.label} tone={post.tone} />

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Ionicons color={AppColors.text} name="heart-outline" size={24} />
          <Ionicons color={AppColors.text} name="chatbubble-outline" size={22} />
          <Ionicons color={AppColors.text} name="paper-plane-outline" size={22} />
        </View>

        <Ionicons color={AppColors.text} name="bookmark-outline" size={22} />
      </View>

      <Text style={styles.likes}>{post.likes} likes</Text>
      <Text style={styles.caption}>
        <Text style={styles.captionUser}>{post.handle} </Text>
        {post.caption}
      </Text>
      <Text style={styles.meta}>
        {post.comments} · {post.time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  avatarCore: {
    alignItems: 'center',
    borderColor: AppColors.surface,
    borderRadius: 21,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
  },
  avatarRing: {
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    padding: 2,
    width: 48,
  },
  avatarText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  caption: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 10,
  },
  captionUser: {
    fontFamily: AppFonts.heading,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 28,
    elevation: 4,
    padding: 16,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  likes: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 14,
    paddingTop: 14,
  },
  location: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  meta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
    paddingTop: 10,
  },
  userMeta: {
    gap: 3,
  },
  userName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
