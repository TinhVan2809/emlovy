import { ScreenShell } from "@/components/screen-shell";
import { UserAvatar } from "@/components/user-avatar";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { followApi, resolveMediaUrl } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import type { Profile } from "@/types/auth";
import { AppColors, AppFonts } from "@/constants/theme";

export default function Following() {
  const { token, user } = useAuth();
  const [following, setFollowing] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unfollowingUserId, setUnfollowingUserId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const handleGetFollowing = async () => {
      if (!token || !user?.user_id) return;
      setIsLoading(true);
      try {
        const response = await followApi.getFollowing(token, user.user_id);
        setFollowing(response.data.results);
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setIsLoading(false);
      }
    };
    handleGetFollowing();
  }, [token, user?.user_id]);

  const handleUnfollow = async (userIdToUnfollow: number) => {
    if (!token || !user?.user_id || unfollowingUserId === userIdToUnfollow)
      return;

    setUnfollowingUserId(userIdToUnfollow);
    try {
      await followApi.unfollow(token, userIdToUnfollow);
      // Remove the unfollowed user from the list
      setFollowing((prevFollowing) =>
        prevFollowing.filter((profile) => profile.user_id !== userIdToUnfollow),
      );
      console.log(`Unfollowed user ${userIdToUnfollow} successfully.`);
    } catch (error) {
      console.error("Error unfollowing user:", error);
      // Optionally, revert the UI change or show an error message
    } finally {
      setUnfollowingUserId(null);
    }
  };
  return (
    <>
      <ScreenShell title="Following">
        <View style={styles.conatiner}>
          <View style={styles.headerTitle}>
            <Text style={styles.description}>
              8 following. Xem những người mà bạn đã theo dõi trên emlovy mà
              chưa theo dõi trên Thread yet.{" "}
              <Text style={styles.seeAll}>See all</Text>
            </Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" style={{ fontSize: 20 }} />
              <TextInput
                placeholder="Tìm kiếm người đã theo dõi...."
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {isLoading && (
          <ActivityIndicator color="#000" style={{ marginTop: 20 }} />
        )}

        {following.length > 0 && (
          <View style={styles.listContainer}>
            {following.map((item) => (
              <View key={item.user_id} style={styles.userRow}>
                <UserAvatar
                  imageUrl={resolveMediaUrl(
                    item.avatar_url || (item as any).avata,
                  )}
                  name={item.name}
                  size={44}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userHandle}>@{item.username}</Text>
                </View>
                <Pressable
                  onPress={() => handleUnfollow(item.user_id)}
                  style={styles.unfollowButton}
                  disabled={unfollowingUserId === item.user_id}
                >
                  {unfollowingUserId === item.user_id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.unfollowButtonText}>Hủy theo dõi</Text>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  conatiner: {
    padding: 20,
  },
  headerTitle: {},
  description: {
    color: "#0000008c",
  },
  seeAll: {
    color: "#000",
    fontWeight: 600,
  },
  searchContainer: {
    marginTop: 25,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  input: {
    width: "100%",
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: "600",
    fontSize: 15,
  },
  userHandle: {
    color: "#0000008c",
    fontSize: 13,
  },
  unfollowButton: {
    backgroundColor: "#efefef", // A light grey background for the button
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100, // Ensure a consistent width
  },
  unfollowButtonText: {
    color: AppColors.text, // Dark text for contrast
    fontFamily: AppFonts.heading,
    fontSize: 13,
    fontWeight: "500",
  },
  followingText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
