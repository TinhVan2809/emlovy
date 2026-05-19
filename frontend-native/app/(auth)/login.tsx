import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Routes } from "@/constants/routes";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
            <Text style={styles.brand}>emlovy</Text>
            <Text style={styles.heading}>Đăng nhập</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username hoặc email</Text>
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
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
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
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.forgetPassword}>
              <Text style={styles.fotgetText}>Quên mật khẩu</Text>
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
    gap: 6,
    justifyContent: "center",
  },
  footerText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 14,
  },
  form: {
    backgroundColor: AppColors.surface,
    borderColor: AppColors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  heading: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 26,
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
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 16,
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
    marginTop: 4.5
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: AppColors.text,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 54,
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
});
