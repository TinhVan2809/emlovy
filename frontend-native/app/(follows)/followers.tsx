import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { UserAvatar } from "@/components/user-avatar";
import { followApi, resolveMediaUrl } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { Profile } from "@/types/auth";
export default function Followers() {
  const { token, user } = useAuth();
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const handleGetFollowers = async () => {
      if (!token || !user?.user_id) {
        return;
      }
      try {
        const response = await followApi.getFollowers(token, user?.user_id);
        const data = response.data.results;
        setFollowers(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        console.error("Error fething followers", err);
      } finally {
        setIsLoading(false);
      }
    };
    handleGetFollowers();
  }, [token, user?.user_id]);

  return (
    <ScreenShell
      left={
        <View style={styles.title}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back-outline" size={22} />
          </Pressable>
          <Text style={styles.titleText}>Follwers</Text>
        </View>
      }
    >
      <View style={styles.conatiner}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" style={{ fontSize: 20 }} />
            <TextInput
              placeholder="Tìm kiếm người đã theo dõi bạn...."
              style={styles.input}
            />
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {!isLoading && followers.length > 0 && (
          <View style={[styles.listContainer, { paddingBottom: 40 }]}>
            {followers.map((item) => (
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
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  conatiner: {
    paddingHorizontal: 20,
  },
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#33333321",
    borderWidth: 1,
    borderRadius: 30,
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
    title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  titleText: {
    fontSize: 20
  }
});
