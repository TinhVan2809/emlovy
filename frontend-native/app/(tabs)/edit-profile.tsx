import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/user-avatar';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { profileApi, resolveMediaUrl } from '@/services/api';
import type { UpdateProfileInput } from '@/types/auth';

const genderOptions = [
  { label: 'Nam', value: '0' },
  { label: 'Nữ', value: '1' },
  { label: 'Không tiết lộ', value: '2' },
] as const;

/**
 * Hàm kiểm tra dữ liệu đầu vào của form chỉnh sửa profile.
 * @returns Một chuỗi thông báo lỗi nếu không hợp lệ, hoặc `null` nếu hợp lệ.
 */
const validateProfileInput = (input: {
  name: string;
  username: string;
  email: string;
}): string | null => {
  const { name, username, email } = input;

  // Các mẫu Regex tương tự backend để đảm bảo tính nhất quán
  const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.trim().length < 2) {
    return 'Họ tên phải có ít nhất 2 ký tự.';
  }
  if (!usernamePattern.test(username.trim())) {
    return 'Username phải có 3-30 ký tự, chỉ gồm chữ, số hoặc dấu gạch dưới.';
  }
  if (email.trim() && !emailPattern.test(email.trim())) {
    return 'Định dạng email không hợp lệ.';
  }
  return null; // Không có lỗi
};

export default function EditProfileScreen() {
  const { token, updateUser, user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState(user?.birthday?.slice(0, 10) || '');
  const [dateForPicker, setDateForPicker] = useState(() =>
    user?.birthday ? new Date(user.birthday) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'0' | '1' | '2' | null>(user?.gender || null);
  const [avatarPreview, setAvatarPreview] = useState(resolveMediaUrl(user?.avatar_url || user?.avatar_url));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDateForPicker(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setBirthday(`${year}-${month}-${day}`);
    }
  };

  const canSave = name.trim().length > 0 && username.trim().length > 0 && !isSaving;

  const handlePickAvatar = async () => {
    if (!token || isUploadingAvatar) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Ứng dụng cần quyền truy cập thư viện ảnh.');
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: Platform.OS !== 'android',
        aspect: [1, 1],
        legacy: Platform.OS === 'android',
        mediaTypes: ['images'],
        quality: Platform.OS === 'android' ? 1 : 0.85,
      });
    } catch (pickerError) {
      setError(
        pickerError instanceof Error ? pickerError.message : 'Không thể mở thư viện ảnh trên thiết bị này.',
      );
      return;
    }

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const previousPreview = avatarPreview;

    setAvatarPreview(asset.uri);
    setIsUploadingAvatar(true);
    setError('');

    try {
      const response = await profileApi.uploadAvatar(token, {
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      });

      updateUser(response.data.user);
      setAvatarPreview(resolveMediaUrl(response.data.profile.avatar_url));
    } catch (uploadError) {
      setAvatarPreview(previousPreview);
      setError(uploadError instanceof Error ? uploadError.message : 'Upload avatar không thành công.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!token || !canSave) {
      return;
    }

    // 1. Thực hiện validation trước khi gửi
    const validationError = validateProfileInput({ name, username, email });
    if (validationError) {
      setError(validationError);
      return; // Dừng lại nếu có lỗi
    }

    // 2. Tạo payload nếu validation thành công
    const payload: UpdateProfileInput = {
      birthday: birthday.trim() || null,
      email: email.trim() || null,
      gender,
      name: name.trim(),
      nickname: nickname.trim() || null,
      phone: phone.trim() || null,
      username: username.trim(),
    };

    setIsSaving(true);
    setError('');

    try {
      const response = await profileApi.updateMe(token, payload);
      updateUser(response.data.user);
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Cập nhật profile không thành công.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboard}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons color={AppColors.text} name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit profile</Text>
          <Pressable disabled={!canSave} hitSlop={10} onPress={handleSave} style={styles.saveHeader}>
            {isSaving ? (
              <ActivityIndicator color={AppColors.accent} size="small" />
            ) : (
              <Text style={[styles.saveHeaderText, !canSave ? styles.disabledText : null]}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.avatarBlock}>
            <Pressable disabled={isUploadingAvatar} onPress={handlePickAvatar} style={styles.avatarPressable}>
              <UserAvatar imageUrl={avatarPreview} name={name} size={112} />
              <View style={styles.avatarBadge}>
                {isUploadingAvatar ? (
                  <ActivityIndicator color={AppColors.surface} size="small" />
                ) : (
                  <Ionicons color={AppColors.surface} name="camera-outline" size={18} />
                )}
              </View>
            </Pressable>
            <Pressable disabled={isUploadingAvatar} onPress={handlePickAvatar}>
              <Text style={styles.avatarAction}>Đổi avatar</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <FormField label="Họ tên" onChangeText={setName} value={name} />
            <FormField
              autoCapitalize="none"
              label="username"
              onChangeText={setUsername}
              placeholder="Nguyễn Minh Anh"
              value={username}
            />
            <FormField
              autoCapitalize="none"
              label="Nickname"
              onChangeText={setNickname}
              placeholder="@nickname"
              value={nickname}
            />
            <FormField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="adc@gmail.com"
              value={email}
            />
            <FormField
              keyboardType="phone-pad"
              label="Số điện thoại"
              onChangeText={setPhone}
              placeholder="+84 123 456 789"
              value={phone}
            />
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh</Text>
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={birthday ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {birthday
                    ? new Date(birthday).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : 'DD-MM-YYYY'}
                </Text>
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={dateForPicker}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.segmentedRow}>
                {genderOptions.map((option) => {
                  const isActive = gender === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setGender(option.value)}
                      style={[styles.segmentedItem, isActive ? styles.segmentedItemActive : null]}>
                      <Text style={[styles.segmentedText, isActive ? styles.segmentedTextActive : null]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              disabled={!canSave}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSave ? styles.primaryButtonDisabled : null,
                pressed ? styles.primaryButtonPressed : null,
              ]}>
              {isSaving ? (
                <ActivityIndicator color={AppColors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

function FormField({
  autoCapitalize,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: FormFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.tabInactive}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarAction: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  avatarBadge: {
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderColor: AppColors.surface,
    borderRadius: 18,
    borderWidth: 3,
    bottom: 2,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 36,
  },
  avatarBlock: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
  },
  avatarPressable: {
    position: 'relative',
  },
  content: {
    gap: 20,
    padding: 18,
    paddingBottom: 34,
  },
  dateInput: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  dateInputText: {
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  dateInputPlaceholder: {
    color: AppColors.tabInactive,
    fontFamily: AppFonts.body,
    fontSize: 15,
  },
  disabledText: {
    opacity: 0.45,
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
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
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 14,
  },
  headerTitle: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.heading,
    fontSize: 18,
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  input: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputGroup: {
    gap: 8,
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
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonPressed: {
    opacity: 0.86,
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
  saveHeader: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
  },
  saveHeaderText: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  segmentedItem: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  segmentedItemActive: {
    backgroundColor: AppColors.text,
  },
  segmentedRow: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 5,
  },
  segmentedText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  segmentedTextActive: {
    color: AppColors.surface,
  },
});
