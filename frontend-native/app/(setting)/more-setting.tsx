import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { AppColors } from "@/constants/theme";
export default function MoreSetting() {
  return (
    <ScreenShell title="Xem thêm các cài đặt">
      {/* Searching */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} />
          <TextInput placeholder="Tìm kiếm cài đặt..." style={styles.input} />
        </View>
      </View>

      <View style={styles.container}>
        {/*Tài khoản của bạn*/}
        <View style={styles.blockItem}>
          <Text style={styles.discription}>Tài khoản của bạn</Text>
          <View style={styles.items}>
            <View style={{ gap: 8 }}>
              <View style={styles.items}>
                <Ionicons size={24} name="person-circle-outline" />
                <Text>Trung tâm tài khoản </Text>
              </View>
              <Text>
                Thông tin cá nhân, mật khẩu, bảo mật, các kết nối và tùy chọn
                quảng cáo
              </Text>
            </View>
          </View>
        </View>

        {/* Cài đặt cá nhân */}
        <View style={styles.blockItem}>
          <Text style={styles.discription}>Cá nhân</Text>
          <View style={styles.items}>
            <Ionicons size={24} name="person-outline" />
            <Text>Chỉnh sửa trang cá nhân</Text>
          </View>
        </View>

        {/* Thông báo */}
        <View style={styles.blockItem}>
          <Text style={styles.discription}>Cài đặt thông báo</Text>
          <View style={styles.items}>
            <Ionicons size={24} name="notifications-outline" />
            <Text>Thông báo</Text>
          </View>
        </View>

        {/* Ai có thể xem nội dung của bạn */}
        <View style={styles.blockItem}>
          <Text style={styles.discription}>Ai có thể xem nội dung của bạn</Text>
          <View style={styles.items}>
            <Ionicons size={24} name="lock-closed-outline" />
            <Text>Quyền riêng tư và tải khoản</Text>
          </View>
          <View style={styles.items}>
            <Ionicons size={24} name="star-outline" />
            <Text>Bạn thân</Text>
          </View>
          <View style={styles.items}>
            <Ionicons size={24} name="stop-circle-outline" />
            <Text>Đã chặn</Text>
          </View>
          <View style={styles.items}>
            <Ionicons size={24} name="location-outline" />
            <Text>Tin và vị trí</Text>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 35,
    flexDirection: "column",
    marginTop: 10,
    padding: 10,
  },
  searchContainer: {
    padding: 10,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    borderRadius: 20,
    paddingRight: 10,
    paddingLeft: 10,
    shadowColor: AppColors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  input: {
    borderRadius: 20,
    paddingTop: 13,
    paddingLeft: 10,
    paddingRight: 10,
  },
  discription: {
    fontSize: 14,
    opacity: 0.4,
  },
  blockItem: {
    flexDirection: "column",
    gap: 20,
  },
  items: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
});
