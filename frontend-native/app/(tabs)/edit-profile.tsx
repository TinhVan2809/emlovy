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
import { SafeAreaView } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/user-avatar';
import { AppColors, AppFonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { profileApi, resolveMediaUrl } from '@/services/api';
import type { UpdateProfileInput } from '@/types/auth';

const genderOptions = [
  { label: 'Nam', value: '0' },
  { label: 'Nu', value: '1' },
  { label: 'Khac', value: '2' },
] as const;

export default function EditProfileScreen() {
  const { token, updateUser, user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState(user?.birthday?.slice(0, 10) || '');
  const [gender, setGender] = useState<'0' | '1' | '2' | null>(user?.gender || null);
  const [avatarPreview, setAvatarPreview] = useState(resolveMediaUrl(user?.avatar_url || user?.avata));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const canSave = name.trim().length > 0 && username.trim().length > 0 && !isSaving;

  const handlePickAvatar = async () => {
    if (!token || isUploadingAvatar) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Ung dung can quyen truy cap thu vien anh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

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
      setError(uploadError instanceof Error ? uploadError.message : 'Upload avatar khong thanh cong.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!token || !canSave) {
      return;
    }

    const payload: UpdateProfileInput = {
      birthday: birthday.trim() || null,
      email: email.trim() || null,
      gender,
      name: name.trim(),
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
      setError(saveError instanceof Error ? saveError.message : 'Cap nhat profile khong thanh cong.');
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
              <Text style={styles.avatarAction}>Doi avatar</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <FormField label="Ho ten" onChangeText={setName} value={name} />
            <FormField
              autoCapitalize="none"
              label="Username"
              onChangeText={setUsername}
              value={username}
            />
            <FormField
              autoCapitalize="none"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              value={email}
            />
            <FormField
              keyboardType="phone-pad"
              label="So dien thoai"
              onChangeText={setPhone}
              value={phone}
            />
            <FormField
              label="Ngay sinh"
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              value={birthday}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gioi tinh</Text>
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
                <Text style={styles.primaryButtonText}>Luu thay doi</Text>
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
