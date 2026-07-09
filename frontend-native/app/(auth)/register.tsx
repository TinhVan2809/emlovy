import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState, useRef, forwardRef } from "react";
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

import { Routes } from "@/constants/routes";
import { AppColors, AppFonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // 1. name => username
  const onSubmitNameEditing = () => {
    usernameRef.current?.focus();
  };

  // 2. username => email
  const onSubmitUsernameEditing = () => {
    emailRef.current?.focus();
  };

  // 3. email => number phone
  const onSubmitEmailediting = () => {
    phoneRef.current?.focus();
  };
  // 4. number phone => passowrd
  const onSubmitPhoneEditing = () => {
    passwordRef.current?.focus();
  };
  // 5. passowrd => confirm passowrd
  const onSubmitPasswordEditing = () => {
    confirmPasswordRef.current?.focus();
  };

  const canSubmit =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await register({
        email: email.trim() || undefined,
        name,
        password,
        phone: phone.trim() || undefined,
        username,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đăng ký không thành công.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: "height" })}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.img}
            />
            <Text style={styles.brand}>Create Your Account</Text>
            <Text style={styles.heading}>
              Tạo một tài khoản mới để bắt đầu và tận hưởng quyền truy cập liền
              mạch vào các tính năng của chúng tôi.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              icon="sparkles-outline"
              label="Họ tên"
              onChangeText={setName}
              placeholder="Nguyễn Minh Anh"
              value={name}
              onSubmitEditing={onSubmitNameEditing}
            />
            <AuthInput
              autoCapitalize="none"
              icon="person-outline"
              label="Username"
              onChangeText={setUsername}
              placeholder="minhanh"
              value={username}
              onSubmitEditing={onSubmitUsernameEditing}
              ref={usernameRef}
            />
            <AuthInput
              autoCapitalize="none"
              icon="mail-outline"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
              onSubmitEditing={onSubmitEmailediting}
              ref={emailRef}
            />
            <AuthInput
              icon="call-outline"
              keyboardType="phone-pad"
              label="Số điện thoại"
              onChangeText={setPhone}
              placeholder="0901234567"
              value={phone}
              onSubmitEditing={onSubmitPhoneEditing}
              ref={phoneRef}
            />

            <AuthInput
              icon="lock-closed-outline"
              label="Mật khẩu"
              onChangeText={setPassword}
              placeholder="••••••••"
              value={password}
              onSubmitEditing={onSubmitPasswordEditing}
              ref={passwordRef}
              onTogglePassword={() => setShowPassword((v) => !v)}
              showPassword={showPassword}
              {...(!showPassword ? { secureTextEntry: true } : {})}
            />

            <AuthInput
              icon="shield-checkmark-outline"
              label="Xác nhận mật khẩu"
              onChangeText={setConfirmPassword}
              onSubmitEditing={handleSubmit}
              placeholder="••••••••"
              {...(!showPassword ? { secureTextEntry: true } : {})}
              onTogglePassword={() => setShowPassword((v) => !v)}
              showPassword={showPassword}
              value={confirmPassword}
              ref={confirmPasswordRef}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                  <Text style={styles.primaryButtonText}>Tạo tài khoản</Text>
                  <Ionicons
                    color={AppColors.surface}
                    name="arrow-forward"
                    size={18}
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Đã có tài khoản?</Text>
            <Link href={Routes.login} asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthInputProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  value: string;
};

const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    {
      autoCapitalize,
      icon,
      keyboardType,
      label,
      onChangeText,
      onSubmitEditing,
      placeholder,
      secureTextEntry,
      showPassword,
      onTogglePassword,
      value,
    },
    ref,
  ) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.inputWrap}>
          <Ionicons color={AppColors.muted} name={icon} size={20} />

          <TextInput
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            keyboardType={keyboardType}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={AppColors.tabInactive}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            value={value}
            ref={ref}
          />

          {onTogglePassword && (
            <Pressable hitSlop={10} onPress={onTogglePassword}>
              <Ionicons
                color={AppColors.muted}
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);

AuthInput.displayName = "AuthInput";

const styles = StyleSheet.create({
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 38,
    fontStyle: "italic",
    textAlign: "center",
  },
  content: {
    flexGrow: 1,
    gap: 24,
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
    gap: 16,
    padding: 5,
  },
  header: {
    gap: 8,
    paddingTop: 14,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 35,
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
  img: {
    width: 120,
    height: 120,
  },
});
