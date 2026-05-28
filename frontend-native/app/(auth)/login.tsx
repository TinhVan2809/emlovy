import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Routes, authRoute } from "@/constants/routes";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const canSubmit =
    loginName.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login({
        login: loginName,
        password,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đăng nhập không thành công.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const onSubmitEditing = () => {
    passwordRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.img}
            />
            <Text style={styles.brand}>Welcome back</Text>
            <Text style={styles.heading}>
              Đăng nhập để xem và khám phá những bài viết mới mẽ dành cho bạn.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username/Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  color={AppColors.muted}
                  name="person-outline"
                  size={20}
                />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setLoginName}
                  placeholder="emlovy_user"
                  placeholderTextColor={AppColors.tabInactive}
                  returnKeyType="next"
                  style={styles.input}
                  value={loginName}
                  ref={usernameRef}
                  onSubmitEditing={onSubmitEditing}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  color={AppColors.muted}
                  name="lock-closed-outline"
                  size={20}
                />
                <TextInput
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={AppColors.tabInactive}
                  returnKeyType="done"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onSubmitEditing={handleSubmit}
                  ref={passwordRef}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.forgetPassword}>
              <Link href={authRoute.forget} style={styles.fotgetText}>
                Quên mật khẩu?
              </Link>
            </View>

            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSubmit ? styles.primaryButtonDisabled : null,
                pressed ? styles.primaryButtonPressed : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.surface} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                  <Ionicons
                    color={AppColors.surface}
                    name="arrow-forward"
                    size={18}
                    style={styles.icon}
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.orthersLogin}>
            <View
              style={{
                width: 130,
                backgroundColor: "#000",
                height: 1,
                opacity: 0.2,
              }}
            />
            <Text>OR</Text>
            <View
              style={{
                width: 130,
                backgroundColor: "#000",
                height: 1,
                opacity: 0.2,
              }}
            />
          </View>

          <View style={styles.loginOrder}>
            <Pressable style={styles.orthersBtn}>
              <Image
                source={require("../../assets/images/google-logo.png")}
                style={styles.orthersLogo}
              />
              <Text>Đăng nhập bằng Google</Text>
            </Pressable>
            <Pressable style={styles.orthersBtn}>
              <Image
                source={require("../../assets/images/apple-logo.png")}
                style={styles.orthersLogo}
              />
              <Text>Đăng nhập bằng Apple</Text>
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            <Link href={Routes.register} asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.footerLink}>Đăng ký</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 42,
    fontStyle: "italic",
  },
  brandBlock: {
    gap: 10,
    paddingTop: 28,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    width: 120,
    height: 120,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    justifyContent: "center",
    padding: 22,
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 13,
    lineHeight: 18,
  },
  footerLink: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  form: {
    backgroundColor: AppColors.surface,
    gap: 18,
    padding: 5,
  },
  heading: {
    color: AppColors.text,
    opacity: 0.5,
    fontFamily: AppFonts.heading,
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 15,
    minHeight: 48,
    padding: 0,
  },
  inputGroup: {
    gap: 8,
  },
  inputWrap: {
    alignItems: "center",
    // backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  keyboard: {
    flex: 1,
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  forgetPassword: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 2,
    marginBottom: 2,
  },
  fotgetText: {
    fontSize: 14,
  },
  icon: {
    marginTop: 4.5,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: AppColors.text,
    borderRadius: 30,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  safeArea: {
    backgroundColor: AppColors.background,
    flex: 1,
  },
  orthersLogin: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loginOrder: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  orthersBtn: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: "center",
    display: "flex",
    backgroundColor: '#cccccc60',
    width: '100%',
    borderRadius: 30,
    gap: 10,
    padding: 15
  },
  orthersLogo: {
    width: 20,
    height: 20
  },
});
