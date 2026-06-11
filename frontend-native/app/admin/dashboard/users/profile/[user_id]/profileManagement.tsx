import { View, Text, Pressable, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenShell } from "@/components/screen-shell";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { profileApi, postApi, resolveMediaUrl } from "@/services/api";
import type { Post, PostsPagination, Profile } from "@/types/auth";
import { UserAvatar } from "@/components/user-avatar";
import { Ionicons } from "@expo/vector-icons";
import { Phone } from "lucide-react-native";
import { AppColors } from "@/constants/theme";
import { UsersRound, Users, Image, Heart } from "lucide-react-native";

const USER_POST_LIMIT = 15;

const formatDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const mergePosts = (current: Post[], incoming: Post[]) => {
  const seen = new Set<number>();

  return [...current, ...incoming].filter((post) => {
    if (seen.has(post.post_id)) {
      return false;
    }

    seen.add(post.post_id);
    return true;
  });
};

const getGenderLabel = (gender?: Profile["gender"]) => {
  if (gender === "0") {
    return "Nam";
  }

  if (gender === "1") {
    return "Nữ";
  }

  if (gender === "2") {
    return "Khác";
  }

  return null;
};

function ProfileManagement() {
  const { token } = useAuth();
  const params = useLocalSearchParams();
  const rawUserId = Array.isArray(params.user_id)
    ? params.user_id[0]
    : params.user_id;
  const viewedUserId = Number(rawUserId);
  const hasValidUserId = Number.isInteger(viewedUserId) && viewedUserId > 0;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PostsPagination | null>(null);
  const [error, setError] = useState("");
  const [postError, setPostError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  //   const [isRefreshing, setIsRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!hasValidUserId) {
      setError("Profile khong hop le.");
      return;
    }

    setIsLoadingProfile(true);

    try {
      const response = await profileApi.getUser(viewedUserId, token);
      setProfile(response.data.profile);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Khong the tai profile.",
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, [hasValidUserId, token, viewedUserId]);

  const loadPosts = useCallback(
    async (page = 1, replace = true) => {
      if (!hasValidUserId) {
        setPosts([]);
        setPagination(null);
        return;
      }

      if (replace) {
        setIsLoadingPosts(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await postApi.getUserPosts(viewedUserId, {
          limit: USER_POST_LIMIT,
          page,
          token,
        });
        setPagination(response.data.pagination);
        setPosts((current) =>
          replace
            ? response.data.items
            : mergePosts(current, response.data.items),
        );
        setPostError("");
      } catch (loadError) {
        setPostError(
          loadError instanceof Error
            ? loadError.message
            : "Khong the tai bai viet.",
        );
      } finally {
        setIsLoadingPosts(false);
        setIsLoadingMore(false);
      }
    },
    [hasValidUserId, token, viewedUserId],
  );

  useEffect(() => {
    loadProfile();
    loadPosts(1, true);
  }, [loadPosts, loadProfile]);

  const displayName = profile?.name || "Emlovy User";
  const displayHandle = profile?.username ? `@${profile.username}` : "@emlovy";
  const avatarUrl = resolveMediaUrl(profile?.avatar_url || profile?.avata);

  return (
    <>
      <ScreenShell left={<Text>@{profile?.username}</Text>}>
        <View style={styles.profileContainer}>
          <View style={styles.profileBox}>
            <View style={styles.profileInfo}>
              <UserAvatar imageUrl={avatarUrl} name={displayName} size={90} />
              <View style={styles.infoBox}>
                <Text style={styles.profileTextName}>{profile?.name}</Text>
                <Text style={styles.profileText}>@{profile?.username}</Text>
                {profile?.email?.length && (
                  <Text style={styles.profileText}>
                    <Ionicons name="mail-outline" size={12} color={AppColors.muted}/> {profile?.email}
                  </Text>
                )}
                {profile?.phone && (
                  <Text style={styles.profileText}>
                    <Phone size={12} color={AppColors.muted} /> {profile?.phone}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.statusContainer}>
              {profile?.status === 1 ? (
                <View style={[styles.active, styles.btn]}>
                  <Text style={styles.activeText}>Đang hoạt động</Text>
                </View>
              ) : (
                <View style={[styles.block, styles.btn]}>
                  <Text style={styles.blockText}>Block</Text>
                </View>
              )}

              <View style={[styles.common, styles.btn]}>
                <Text style={styles.commonText}>Người dùng phổ biến</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.profileItems}>
          <View style={[styles.items, styles.userRound]}>
            <UsersRound size={25} color="#rgba(93, 27, 189, 0.96)" />
            <Text>Người theo dõi</Text>
            <Text style={styles.text}>{profile?.stats.followers}</Text>
          </View>
          <View style={[styles.items, styles.users]}>
            <Users size={25} color="rgba(28, 21, 232, 0.93)" />
            <Text>Đang theo dõi</Text>
            <Text style={styles.text}>{profile?.stats.following}</Text>
          </View>
          <View style={[styles.items, styles.image]}>
            <Image size={25} color="rgba(232, 21, 198, 0.93)" />
            <Text>Bài viết</Text>
            <Text style={styles.text}>{profile?.stats.posts}</Text>
          </View>
          <View style={[styles.items, styles.heart]}>
            <Heart size={25} color="rgba(227, 33, 33, 0.94)" />
            <Text>Bài viết</Text>
            <Text style={styles.text}>{profile?.stats.likes}</Text>
          </View>
        </View>
      </ScreenShell>
    </>
  );
}

export default ProfileManagement;

const styles = StyleSheet.create({
  profileContainer: {
    padding: 20,
  },
  profileBox: {
    gap: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  infoBox: {
    gap: 6,
  },
  profileTextName: {
    fontWeight: "500",
  },
  profileText: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  btn: {
    paddingVertical: 7.5,
    minWidth: 150,
    borderRadius: 12,
  },
  active: {
    paddingVertical: 1,
    minWidth: 20,
    backgroundColor: "rgba(0, 255, 14, 0.19)",
  },
  activeText: {
    color: "rgba(15, 151, 19, 1)",
    fontWeight: "bold",
    textAlign: "center",
  },
  block: {
    backgroundColor: "rgba(255, 0, 0, 0.31)",
  },
  blockText: {
    color: "rgba(255, 0, 0, 1)",
    fontWeight: "bold",
    textAlign: "center",
  },
  common: {
    paddingVertical: 1,
    minWidth: 20,
    backgroundColor: "rgba(13, 107, 233, 0.27)",
  },
  commonText: {
    color: "rgba(0, 108, 255, 1)",
    fontWeight: "bold",
    textAlign: "center",
  },
  profileItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  items: {
    maxWidth: 80,
    minWidth: 80,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20
  },
  userRound: {
    backgroundColor: 'rgba(156, 119, 208, 0.72)',
    padding: 10, 
    borderRadius: 10
  },
  users: {
    backgroundColor: 'rgba(55, 16, 233, 0.62)',
    padding: 10, 
    borderRadius: 10
  },
  image: {
    backgroundColor: 'rgba(233, 16, 221, 0.52)',
    padding: 10, 
    borderRadius: 10
  },
  heart: {
    backgroundColor: 'rgba(233, 16, 16, 0.52)',
    padding: 10, 
    borderRadius: 10
  }
});
