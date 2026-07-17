import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ShieldCheck, Command, Megaphone } from "lucide-react-native";
import { settingRoutes } from "@/constants/routes";
export default function AccountSetting() {
  const router = useRouter();

  return (
    <ScreenShell
      left={
        <View style={styles.title}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} />
          </Pressable>
          <Text>Trung tâm tài khoản</Text>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.box}>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.item, pressed && styles.itemPressed]}>
                <Ionicons name="person-outline" size={20} color="#444" />
                <Text style={styles.text}>Thông tin cá nhân</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => router.push(settingRoutes.password)}>
            {({ pressed }) => (
              <View style={[styles.item, pressed && styles.itemPressed]}>
                <ShieldCheck size={20} color="#444" />
                <Text style={styles.text}>Mật khẩu và bảo mật</Text>
              </View>
            )}
          </Pressable>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.item, pressed && styles.itemPressed]}>
                <Command size={20} color="#444" />
                <Text style={styles.text}>Trải nghiệm kết nối</Text>
              </View>
            )}
          </Pressable>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.item, pressed && styles.itemPressed]}>
                <Megaphone size={20} color="#444" />
                <Text style={styles.text}>Tùy chọn quảng cáo</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 12,
    borderRadius: 10,
  },
  itemPressed: {
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});
