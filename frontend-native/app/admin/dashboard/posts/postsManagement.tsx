import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/contexts/auth-context";
import { searchApi } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";

import type { Post } from "@/types/auth";
// import { router } from "@/.expo/types/router";
export default function PostsManagement() {
  const { token } = useAuth();

  // keyword state
  const [keyword, setKeyword] = useState("");
  // result state
  const [results, setResults] = useState<Post[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim() === "") {
        setResults([]);
        setIsLoading(false);
        return;
      }
      const handleSearch = async (searchTerm: string) => {
        setIsLoading(true);
        try {
          const response = await searchApi.searchPosts(searchTerm, token);
          const data = response.data.results;
          setResults(Array.isArray(data) ? data : data ? [data] : []);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
      };

      if (keyword) {
        handleSearch(keyword);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [keyword, token]);

  return (
    <ScreenShell title="Posts">
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} />
          <TextInput
            placeholder="Search posts"
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>
      </View>
      <View>
        {isLoading ? (
          <View>
            <Text>Loading....</Text>
          </View>
        ) : (
          <View>
            {results.map((post) => (
              <Pressable key={post.post_id}>
                <Text>{post.content}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: "80%",
    borderRadius: 20,
    paddingHorizontal: 5,
  },
});
