import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenShell } from '@/components/screen-shell';
import { VisualTile } from '@/components/visual-tile';
import { searchTiles } from '@/constants/mock-content';
import { AppColors, AppFonts } from '@/constants/theme';

const leftColumn = searchTiles.filter((_, index) => index % 2 === 0);
const rightColumn = searchTiles.filter((_, index) => index % 2 !== 0);

export default function SearchScreen() {
  return (
    <ScreenShell
      title="Khám phá"
      right={<Ionicons color={AppColors.text} name="options-outline" size={24} />}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Ionicons color={AppColors.muted} name="search-outline" size={18} />
          <TextInput
            placeholder="Search outfits, cafes, travel"
            placeholderTextColor={AppColors.tabInactive}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.categoryRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {['For you', 'Style', 'Cafe', 'Travel', 'Creators'].map((category, index) => (
            <View
              key={category}
              style={[styles.categoryChip, index === 0 ? styles.categoryChipActive : null]}>
              <Text
                style={[styles.categoryText, index === 0 ? styles.categoryTextActive : null]}>
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse the moodboard</Text>
          <Text style={styles.sectionMeta}>Daily picks</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.column}>
            {leftColumn.map((tile) => (
              <VisualTile
                key={tile.id}
                accent={tile.accent}
                height={tile.height}
                label={tile.label}
                tone={tile.tone}
              />
            ))}
          </View>
          <View style={styles.column}>
            {rightColumn.map((tile) => (
              <VisualTile
                key={tile.id}
                accent={tile.accent}
                height={tile.height}
                label={tile.label}
                tone={tile.tone}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  categoryRow: {
    gap: 10,
    paddingHorizontal: 18,
  },
  categoryText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  categoryTextActive: {
    color: AppColors.surface,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  content: {
    gap: 18,
    paddingBottom: 28,
    paddingTop: 18,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
    padding: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  sectionMeta: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 20,
  },
});
