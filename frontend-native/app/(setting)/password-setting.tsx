import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Pressable, Modal, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
export default function PasswordSetting() {
  const router = useRouter();

  const [isPasswordModal, setIsPasswordModal] = useState(false);

  const onPassowrdModal = () => {
    setIsPasswordModal(true);
  }

  return (
    <>
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
          <Pressable onPress={onPassowrdModal}>
            <Text>Đổi mật khẩu</Text>
          </Pressable>
          <Pressable>
            <Text>Xác thực 2 yếu tố</Text>
          </Pressable>
        </View>
      </ScreenShell>

      {isPasswordModal && (
        <Modal
          animationType="slide"
          transparent={true}
        >
          <View>
            <TextInput placeholder="Nhập mật khẩu hiện tại" />
          </View>
          <View>
            <TextInput placeholder="Nhập mật khẩu mới" />
          </View>
          <View>
            <TextInput placeholder="Xác nhận mật khẩu mới" />
          </View>

          <View>
            <Text>
              Thay đổi
            </Text>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
});
