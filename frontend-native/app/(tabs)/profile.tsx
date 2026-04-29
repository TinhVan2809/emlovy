import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { VisualTile } from '@/components/visual-tile';
import { useAuth } from '@/contexts/auth-context';
import { profileGrid, profileHighlights } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';

const stats = [
  { label: 'Posts', value: '128' },
  { label: 'Followers', value: '24.8k' },
  { label: 'Following', value: '320' },
];

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const displayName = user?.name || 'Emlovy User';
  const displayHandle = user?.username ? `@${user.username}` : '@emlovy';

  return (
    <ScreenShell
      titleNode={
        <View style={styles.titleRow}>
          <Text style={styles.profileHandle}>{displayHandle}</Text>
          <Ionicons color={AppColors.text} name="chevron-down" size={18} />
        </View>
      }
      right={
        <View style={styles.headerActions}>
          <Ionicons color={AppColors.text} name="add-circle-outline" size={24} />
          <Pressable hitSlop={10} onPress={signOut}>
            <Ionicons color={AppColors.text} name="log-out-outline" size={24} />
          </Pressable>
        </View>
      }>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.topRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>E</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileBio}>
            {user?.email || user?.phone || 'Curated moments, soft palettes, and a daily moodboard.'}
          </Text>
          {/* <Text style={styles.profileLink}>{user?.role === 'admin' ? 'Admin' : 'Customer'}</Text> */}

          <View style={styles.buttonRow}>
            <View style={[styles.actionButton, styles.actionButtonPrimary]}>
              <Text style={styles.actionButtonPrimaryText}>Edit profile</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Share profile</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.highlightRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {profileHighlights.map((item) => (
            <View key={item.id} style={styles.highlightItem}>
              <View style={[styles.highlightRing, { backgroundColor: item.accent }]}>
                <View style={[styles.highlightCore, { backgroundColor: item.tone }]}>
                  <Text style={styles.highlightText}>{item.initials}</Text>
                </View>
              </View>
              <Text style={styles.highlightName}>{item.name}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.segmentedBar}>
          <View style={[styles.segmentedIcon, styles.segmentedIconActive]}>
            <Ionicons color={AppColors.text} name="grid-outline" size={20} />
          </View>
          <View style={styles.segmentedIcon}>
            <Ionicons color={AppColors.tabInactive} name="play-circle-outline" size={20} />
          </View>
          <View style={styles.segmentedIcon}>
            <Ionicons color={AppColors.tabInactive} name="person-outline" size={20} />
          </View>
        </View>

        <View style={styles.grid}>
          {profileGrid.map((tile) => (
            <View key={tile.id} style={styles.gridItem}>
              <VisualTile
                accent={tile.accent}
                compact
                height={tile.height}
                label={tile.label}
                tone={tile.tone}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonPrimary: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  actionButtonPrimaryText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  actionButtonText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  avatarCore: {
    alignItems: 'center',
    backgroundColor: AppColors.accentSoft,
    borderColor: AppColors.surface,
    borderRadius: 46,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
  },
  avatarRing: {
    backgroundColor: AppColors.accent,
    borderRadius: 52,
    height: 104,
    justifyContent: 'center',
    padding: 3,
    width: 104,
  },
  avatarText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 34,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 18,
  },
  content: {
    gap: 18,
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '31.7%',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 14,
  },
  highlightCore: {
    alignItems: 'center',
    borderColor: AppColors.surface,
    borderRadius: 32,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
  },
  highlightItem: {
    alignItems: 'center',
    gap: 8,
    width: 78,
  },
  highlightName: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  highlightRing: {
    borderRadius: 38,
    height: 76,
    justifyContent: 'center',
    padding: 3,
    width: 76,
  },
  highlightRow: {
    gap: 14,
  },
  highlightText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
  profileBio: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 28,
    padding: 18,
  },
  profileHandle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 22,
  },
  profileLink: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 13,
    paddingTop: 8,
  },
  profileName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
    paddingTop: 16,
  },
  segmentedBar: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    flexDirection: 'row',
    padding: 6,
  },
  segmentedIcon: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentedIconActive: {
    backgroundColor: AppColors.surfaceMuted,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    justifyContent: 'center',
    minHeight: 70,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statLabel: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 12,
  },
  statValue: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 18,
    paddingBottom: 4,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
});
