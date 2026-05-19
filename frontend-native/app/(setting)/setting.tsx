import { ScreenShell } from "@/components/screen-shell";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"
export default function Setting() {
  return (
    <>
      <ScreenShell title="Cài đặt">
        <View style={styles.settingContainer}>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="hourglass"/> Lịch sử hoạt động</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="color-fill"/> Chủ đề</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="lock-closed"/> Quản lý mật khẩu</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="transgender"/> Cài đặt trang cá nhân và gắn thẻ</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="lock-closed-outline"/> Khóa bảo vệ trang cá nhân</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="eye-outline"/> Chế độ xem</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="heart-circle-outline"/> Thêm tin nổi bật</Text>
          </Pressable>
          <Pressable style={styles.items}>
            <Text style={styles.text}><Ionicons size={17} name="settings-outline"/> Xem thêm cài đặt</Text>
          </Pressable>
        </View>
      </ScreenShell>
    </>
  );
}

const styles = StyleSheet.create({

  settingContainer: {
    gap: 10,
    borderRadius: 15
  },
  items: {
    padding: 14,
  },
  text: {
    fontSize: 18
  }
});
