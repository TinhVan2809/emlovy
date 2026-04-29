import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { VisualTile } from '@/components/visual-tile';
import { reels } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';

export default function ReelsScreen() {
  return (
    <ScreenShell
      title="Reels"
      right={<Ionicons color={AppColors.text} name="camera-outline" size={24} />}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reels.map((reel) => (
          <View key={reel.id} style={styles.card}>
            <VisualTile accent={reel.accent} height={430} label={reel.label} tone={reel.tone} />

            <View pointerEvents="none" style={styles.overlay}>
              <View style={styles.topTag}>
                <Ionicons color={AppColors.text} name="sparkles-outline" size={14} />
                <Text style={styles.topTagText}>Trending now</Text>
              </View>

              <View style={styles.sideRail}>
                <View style={styles.sideAction}>
                  <Ionicons color={AppColors.surface} name="heart" size={22} />
                  <Text style={styles.sideText}>{reel.likes}</Text>
                </View>
                <View style={styles.sideAction}>
                  <Ionicons color={AppColors.surface} name="chatbubble" size={20} />
                  <Text style={styles.sideText}>{reel.comments}</Text>
                </View>
                <View style={styles.sideAction}>
                  <Ionicons color={AppColors.surface} name="paper-plane" size={20} />
                  <Text style={styles.sideText}>Share</Text>
                </View>
              </View>

              <View style={styles.bottomInfo}>
                <Text style={styles.reelTitle}>{reel.title}</Text>
                <Text style={styles.reelMeta}>
                  {reel.creator} · {reel.audio} · {reel.views} views
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  bottomInfo: {
    backgroundColor: 'rgba(22,22,22,0.58)',
    borderRadius: 22,
    bottom: 18,
    left: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'absolute',
    right: 88,
  },
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    gap: 18,
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  reelMeta: {
    color: AppColors.surface,
    fontFamily: AppFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  reelTitle: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 18,
    paddingBottom: 4,
  },
  sideAction: {
    alignItems: 'center',
    gap: 6,
  },
  sideRail: {
    alignItems: 'center',
    bottom: 24,
    gap: 18,
    position: 'absolute',
    right: 24,
  },
  sideText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 11,
  },
  topTag: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    left: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    top: 18,
  },
  topTagText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
});
