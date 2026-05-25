import { Ionicons } from "@expo/vector-icons";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Routes } from "@/constants/routes";
import { useRouter } from "expo-router";

export default function ForgetPassword() {
    const router = useRouter();
  return (
      <View style={styles.constainer}>
        <View style={styles.head}>
          <Ionicons name="mail-unread-outline" size={40}/>
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.description}>
            Nhập email của tài khoản mà bạn đã đăng ký, chúng tôi sẽ gửi mail
            xác nhận cho bạn.
          </Text>
        </View>
        <View style={styles.box}>
          <TextInput placeholder="Nhập email của bạn" style={styles.input} />
          <Text style={styles.btn}>Tiếp tục</Text>
        </View>
        <View style={styles.bottom}>
            <Text onPress={() => router.push(Routes.login)}>Nhớ lại mật khẩu?</Text>
            <Text>Thử cách khác</Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  constainer: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  head: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
  },
  description: {
    opacity: .5
  },
  box: {
    width: "100%",
    flexDirection: "column",
    gap: 10,
    marginTop: 30
  },
  input: {
    backgroundColor: "#fff",
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
    paddingLeft: 15,
    borderRadius: 15,
    borderWidth: 0.1
  },
  btn: {
    backgroundColor: '#000',
    color: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    paddingLeft: 10,
    textAlign: 'center',
    borderRadius: 20
  },
  bottom: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 10,
    paddingLeft: 10,
  },
});
