import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
export default function PasswordSetting() {
  const router = useRouter();
  return (
    <ScreenShell
      left={
        <View style={styles.title}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={22} />
          </Pressable>
          <Text>Mật khẩu và bảo mật</Text>
        </View>
      }
    >
      <View>
        <Text>Đổi mật khẩu</Text>
        <Text>Xác thực 2 yếu tố</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
