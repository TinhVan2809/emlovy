import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppColors, AppFonts } from '@/constants/theme';
import { resolveMediaUrl } from '@/services/api';
import type { CreatePostInput, Post, PostMediaInput, PostVisibility, UpdatePostInput } from '@/types/auth';

type PostComposerModalProps = {
  initialPost?: Post | null;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (input: CreatePostInput | UpdatePostInput) => Promise<void>;
  visible: boolean;
};

const visibilityOptions: { label: string; value: PostVisibility }[] = [
  { label: 'Public', value: 'public' },
  { label: 'Followers', value: 'followers' },
  { label: 'Private', value: 'private' },
];

const imagePickerBaseOptions = {
  mediaTypes: ['images'] as ImagePicker.MediaType[],
  quality: Platform.OS === 'android' ? 1 : 0.88,
};

const launchPostImagePicker = async () => {
  const multipleResult = await ImagePicker.launchImageLibraryAsync({
    ...imagePickerBaseOptions,
    allowsMultipleSelection: true,
    legacy: Platform.OS === 'android',
    selectionLimit: 10,
  });

  if (!multipleResult.canceled) {
    return multipleResult;
  }

  return multipleResult;
};

export function PostComposerModal({
  initialPost,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
  visible,
}: PostComposerModalProps) {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [media, setMedia] = useState<PostMediaInput[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setContent(initialPost?.content || '');
    setLocation(initialPost?.location || '');
    setVisibility(initialPost?.visibility || 'public');
    setMedia([]);
    setError('');
  }, [initialPost, visible]);

  const existingPreviewUris = useMemo(
    () =>
      initialPost?.media
        ?.filter((item) => item.type === 'image')
        .map((item) => resolveMediaUrl(item.media_url))
        .filter(Boolean) as string[] | undefined,
    [initialPost],
  );

  const previewUris = media.length > 0 ? media.map((item) => item.uri) : existingPreviewUris || [];
  const canSubmit =
    !isSubmitting &&
    (content.trim().length > 0 || media.length > 0 || (mode === 'edit' && Boolean(initialPost?.media.length)));

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Ung dung can quyen truy cap thu vien anh.');
      return;
    }

    let result: ImagePicker.ImagePickerResult;

    try {
      result = await launchPostImagePicker();
    } catch {
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          ...imagePickerBaseOptions,
          allowsMultipleSelection: false,
          legacy: Platform.OS === 'android',
        });
      } catch (fallbackError) {
        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Khong the mo thu vien anh tren thiet bi nay.',
        );
        return;
      }
    }

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setMedia(
      result.assets.map((asset) => ({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
      })),
    );
    setError('');
  };

  const handleRemoveSelectedImage = (uri: string) => {
    setMedia((current) => current.filter((item) => item.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Hay nhap noi dung hoac chon it nhat mot hinh anh.');
      return;
    }

    const payload: CreatePostInput | UpdatePostInput = {
      content: content.trim() || null,
      location: location.trim() || null,
      visibility,
    };

    if (media.length > 0) {
      payload.media = media;
    }

    if (mode === 'edit') {
      (payload as UpdatePostInput).replaceMedia = media.length > 0;
    }

    setError('');
    await onSubmit(payload);
  };

  const title = mode === 'edit' ? 'Chỉnh sửa bài viết' : 'Tạo bài viết';
  const submitLabel = mode === 'edit' ? 'Lưu' : 'Đăng';

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable disabled={isSubmitting} hitSlop={10} onPress={onClose} style={styles.iconButton}>
              <Ionicons color={AppColors.text} name="close" size={24} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Pressable disabled={!canSubmit} hitSlop={10} onPress={handleSubmit} style={styles.submitHeader}>
              {isSubmitting ? (
                <ActivityIndicator color={AppColors.accent} size="small" />
              ) : (
                <Text style={[styles.submitHeaderText, !canSubmit ? styles.disabledText : null]}>
                  {submitLabel}
                </Text>
              )}
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TextInput
              multiline
              onChangeText={setContent}
              placeholder="Bạn đang nghỉ gì?"
              placeholderTextColor={AppColors.tabInactive}
              style={styles.contentInput}
              textAlignVertical="top"
              value={content}
            />

            <View style={styles.fieldGroup}>
              <View style={styles.fieldIcon}>
                <Ionicons color={AppColors.muted} name="location-outline" size={18} />
              </View>
              <TextInput
                onChangeText={setLocation}
                placeholder="Thêm vị trí"
                placeholderTextColor={AppColors.tabInactive}
                style={styles.inlineInput}
                value={location}
              />
            </View>

            <View style={styles.visibilityRow}>
              {visibilityOptions.map((option) => {
                const isActive = option.value === visibility;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setVisibility(option.value)}
                    style={[styles.visibilityChip, isActive ? styles.visibilityChipActive : null]}>
                    <Text style={[styles.visibilityText, isActive ? styles.visibilityTextActive : null]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.mediaBlock}>
              <View style={styles.mediaHeader}>
                <Text style={styles.mediaTitle}>Hinh anh</Text>
                <Pressable disabled={isSubmitting} onPress={handlePickImages} style={styles.mediaButton}>
                  <Ionicons color={AppColors.surface} name="images-outline" size={18} />
                  <Text style={styles.mediaButtonText}>
                    {previewUris.length > 0 ? 'Đổi ảnh' : 'Chọn ảnh'}
                  </Text>
                </Pressable>
              </View>

              {previewUris.length > 0 ? (
                <ScrollView
                  contentContainerStyle={styles.previewRow}
                  horizontal
                  showsHorizontalScrollIndicator={false}>
                  {previewUris.map((uri) => (
                    <View key={uri} style={styles.previewItem}>
                      <Image contentFit="cover" source={{ uri }} style={styles.previewImage} />
                      {media.length > 0 ? (
                        <Pressable
                          hitSlop={8}
                          onPress={() => handleRemoveSelectedImage(uri)}
                          style={styles.previewRemove}>
                          <Ionicons color={AppColors.surface} name="close" size={14} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Pressable onPress={handlePickImages} style={styles.emptyPicker}>
                  <Ionicons color={AppColors.muted} name="image-outline" size={24} />
                  <Text style={styles.emptyPickerText}>Chọn nhiều ảnh cùng lúc</Text>
                </Pressable>
              )}
            </View>

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
                <Text style={styles.primaryButtonText}>{submitLabel}</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(22, 22, 22, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 30,
  },
  contentInput: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 16,
    minHeight: 132,
    padding: 14,
  },
  disabledText: {
    opacity: 0.45,
  },
  emptyPicker: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 132,
  },
  emptyPickerText: {
    color: AppColors.muted,
    fontFamily: AppFonts.body,
    fontSize: 13,
  },
  errorText: {
    color: AppColors.accent,
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 12,
  },
  iconButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  inlineInput: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 15,
    minHeight: 50,
  },
  mediaBlock: {
    gap: 12,
  },
  mediaButton: {
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  mediaButtonText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  mediaHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  previewItem: {
    backgroundColor: AppColors.surfaceMuted,
    borderRadius: 18,
    height: 138,
    overflow: 'hidden',
    position: 'relative',
    width: 116,
  },
  previewRemove: {
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderColor: AppColors.surface,
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 28,
  },
  previewRow: {
    gap: 10,
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
  sheet: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  submitHeader: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
  },
  submitHeaderText: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  title: {
    color: AppColors.text,
    flex: 1,
    fontFamily: AppFonts.heading,
    fontSize: 17,
    textAlign: 'center',
  },
  visibilityChip: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  visibilityChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  visibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  visibilityText: {
    color: AppColors.muted,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  visibilityTextActive: {
    color: AppColors.surface,
  },
});
