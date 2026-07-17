import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { authApi, ApiError } from "@/services/api";

export default function PasswordSetting() {
  const router = useRouter();
  const { token } = useAuth();

  const [isPasswordModal, setIsPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPasswordModal = () => {
    setIsPasswordModal(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleCloseModal = () => {
    setIsPasswordModal(false);
  };

  const handleChangePassword = async () => {
    // Validation phía client
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    if (!token) {
      setError("Bạn cần đăng nhập để thực hiện chức năng này.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.changePassword(token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert("Thành công", "Đổi mật khẩu thành công!");
      setIsPasswordModal(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuItem} onPress={onPasswordModal}>
            <Text>Đổi mật khẩu</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text>Xác thực 2 yếu tố</Text>
          </Pressable>
        </View>
      </ScreenShell>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPasswordModal}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={handleCloseModal}
                disabled={isLoading}
              >
                <Text style={styles.textStyle}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonChange]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.textStyle}>Thay đổi</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  menuContainer: {
    padding: 10,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 45,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonClose: {
    backgroundColor: "#6c757d",
  },
  buttonChange: {
    backgroundColor: "#007bff",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
    width: "100%",
  },
});
