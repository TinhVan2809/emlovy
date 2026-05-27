import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
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
    <ScreenShell title="Following">
      <View style={styles.conatiner}>
        <View style={styles.headerTitle}>
          <Text style={styles.description}>
            8 followers. Xem những người đang theo dõi bạn.{" "}
            <Text style={styles.seeAll}>See all</Text>
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" style={{ fontSize: 20 }} />
            <TextInput
              placeholder="Tìm kiếm người đang theo dõi...."
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
    borderRadius: "20px",
    borderColor: '#33333321',
    borderWidth: 1
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
});
