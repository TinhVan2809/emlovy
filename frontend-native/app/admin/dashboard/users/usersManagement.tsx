import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { searchApi, resolveMediaUrl } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import type { Profile } from "@/types/auth";
import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "@/components/user-avatar";
import { AppColors } from "@/constants/theme";
import { router } from "expo-router";

export default function UsersManagement() {
  const { token } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

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
    <ScreenShell title="Users">
      <View style={styles.head}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search for users"
            style={styles.input}
            value={query}
            onChangeText={handleChange}
          />
          <Ionicons name="search-outline" style={styles.icon} />
        </View>
      </View>
      {!isLoading && results.length > 0 ? (
        <View style={styles.resultsContainer}>
          {results.map((result) => (
            <Pressable
              key={result.user_id}
              onPress={() =>
                router.push({
                  pathname: "/admin/dashboard/users/profile/[user_id]/profileManagement",
                  params: { user_id: String(result.user_id) },
                })
              }
            >
              <View style={styles.resultItem}>
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
                <Text style={styles.resultDate}>
                  {result.created_at
                    ? new Date(result.created_at).toLocaleDateString("vi-VN")
                    : ""}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={AppColors.tabInactive}
                />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.descriptions}>
          <View style={styles.desBox}>
            <Image
              source={require("../../../../assets/images/usersmanagement.png")}
              style={styles.img}
            />
            <Text style={styles.content}>
              Trang tìm kiếm và quản lý thông tin người dùng.
            </Text>
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  head: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  input: {
    width: "80%",
  },
  icon: {
    fontSize: 20,
  },
  resultsContainer: {
    flexDirection: "column",
    padding: 25,
    gap: 30,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultDate: {
    fontSize: 12,
    color: AppColors.muted,
    marginRight: 8,
  },
  resultName: {
    color: AppColors.text,
  },
  resultUsername: {
    color: AppColors.text,
    opacity: 0.5,
  },
  desBox: {
    alignItems: "center",
  },
  descriptions: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: 150,
    height: 150,
    opacity: 0.5,
  },
  content: {
    fontSize: 15,
    color: AppColors.text,
  },
});
