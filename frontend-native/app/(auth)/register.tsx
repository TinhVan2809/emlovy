import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Routes } from '@/constants/routes';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await register({
        email: email.trim() || undefined,
        name,
        password,
        phone: phone.trim() || undefined,
        username,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Đăng ký không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.brand}>emlovy</Text>
            <Text style={styles.heading}>Đăng ký</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              icon="sparkles-outline"
              label="Họ tên"
              onChangeText={setName}
              placeholder="Nguyễn Minh Anh"
              value={name}
            />
            <AuthInput
              autoCapitalize="none"
              icon="person-outline"
              label="Username"
              onChangeText={setUsername}
              placeholder="minhanh"
              value={username}
            />
            <AuthInput
              autoCapitalize="none"
              icon="mail-outline"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="you@example.com"
              value={email}
            />
            <AuthInput
              icon="call-outline"
              keyboardType="phone-pad"
              label="Số điện thoại"
              onChangeText={setPhone}
              placeholder="0901234567"
              value={phone}
            />
            <AuthInput
              icon="lock-closed-outline"
              label="Mật khẩu"
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              value={password}
            />
            <AuthInput
              icon="shield-checkmark-outline"
              label="Xác nhận mật khẩu"
              onChangeText={setConfirmPassword}
              onSubmitEditing={handleSubmit}
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSubmit ? styles.primaryButtonDisabled : null,
                pressed ? styles.primaryButtonPressed : null,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.surface} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Tạo tài khoản</Text>
                  <Ionicons color={AppColors.surface} name="arrow-forward" size={18} />
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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

function AuthInput({
  autoCapitalize,
  icon,
  keyboardType,
  label,
  onChangeText,
  onSubmitEditing,
  placeholder,
  secureTextEntry,
  value,
}: AuthInputProps) {
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: AppColors.text,
    fontFamily: AppFonts.brand,
    fontSize: 38,
    fontStyle: 'italic',
  },
  content: {
    flexGrow: 1,
    gap: 24,
    justifyContent: 'center',
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
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
    gap: 16,
    padding: 18,
  },
  header: {
    gap: 8,
    paddingTop: 14,
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
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
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
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
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
