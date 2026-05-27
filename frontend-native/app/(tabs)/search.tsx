import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenShell } from "@/components/screen-shell";
import { UserAvatar } from "@/components/user-avatar";
import { VisualTile } from "@/components/visual-tile";
import { searchTiles } from "@/constants/mock-content";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

import { useEffect, useState } from "react";
import { searchApi, resolveMediaUrl } from "@/services/api";
import type { Profile } from "@/types/auth";

const leftColumn = searchTiles.filter((_, index) => index % 2 === 0);
const rightColumn = searchTiles.filter((_, index) => index % 2 !== 0);

export default function SearchScreen() {
  const { token } = useAuth();
  const [results, setResults] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (text: string) => {
    setQuery(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim() === "") {
        setResults([]);
        setIsLoading(false);
        return;
      }
      const handleSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
          setResults([]);
          return;
        }

        setIsLoading(true);
        try {
          const response = await searchApi.searchUsers(searchTerm, token);
          // The 'results' property exists within the 'data' field of the ApiResponse
          const data = response.data.results;
          setResults(Array.isArray(data) ? data : data ? [data] : []);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      };
      handleSearch(query);
    }, 500);

    // Quan trọng: Xóa timeout cũ khi query thay đổi để tránh race condition
    return () => clearTimeout(timeoutId);
  }, [query, token]);
    
  return (
    <ScreenShell
      title="Khám phá"
      right={
        <Ionicons color={AppColors.text} name="options-outline" size={24} />
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchBar}>
          <Ionicons color={AppColors.muted} name="search-outline" size={18} />
          <TextInput
            placeholder="Search outfits, cafes, travel"
            placeholderTextColor={AppColors.tabInactive}
            style={styles.searchInput}
            value={query}
            onChangeText={handleChange}
          />
        </View>

        {isLoading && (
          <ActivityIndicator color={AppColors.accent} style={styles.loader} />
        )}

        {!isLoading && results.length > 0 && (
          <View style={styles.resultsContainer}>
            {results.map((result) => (
              <View key={result.user_id} style={styles.resultItem}>
                <UserAvatar
                  imageUrl={resolveMediaUrl(
                    result.avatar_url || (result as any).avata,
                  )}
                  name={result.name}
                  size={44}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultUsername}>@{result.username}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={AppColors.tabInactive}
                />
              </View>
            ))}
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.categoryRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {["For you", "Style", "Cafe", "Travel", "Creators"].map(
            (category, index) => (
              <View
                key={category}
                style={[
                  styles.categoryChip,
                  index === 0 ? styles.categoryChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    index === 0 ? styles.categoryTextActive : null,
                  ]}
                >
                  {category}
                </Text>
              </View>
            ),
          )}
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
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
  loader: {
    marginVertical: 10,
  },
  resultsContainer: {
    backgroundColor: AppColors.surface,
    marginHorizontal: 18,
    borderRadius: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  resultUsername: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
});
