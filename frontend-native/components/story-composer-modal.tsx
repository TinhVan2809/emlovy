import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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
import type { CreateStoryInput, StoryItem, StoryMediaInput, UpdateStoryInput } from '@/types/auth';

type StoryComposerModalProps = {
  initialStory?: StoryItem | null;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (input: CreateStoryInput | UpdateStoryInput) => Promise<void>;
  visible: boolean;
};

const colorOptions = ['#FFE1D6', '#FDE8C9', '#D9EFE1', '#DDE7FF', '#F5DCF9', '#161616'];

const musicOptions = [
  { label: 'Khong nhac', value: '' },
  { label: 'Lo-fi glow', value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { label: 'Soft city', value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { label: 'Night walk', value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const imagePickerOptions = {
  mediaTypes: ['images'] as ImagePicker.MediaType[],
  quality: Platform.OS === 'android' ? 1 : 0.9,
};

export function StoryComposerModal({
  initialStory,
  isSubmitting = false,
  mode,
  onClose,
  onSubmit,
  visible,
}: StoryComposerModalProps) {
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(colorOptions[0]);
  const [musicUrl, setMusicUrl] = useState('');
  const [media, setMedia] = useState<StoryMediaInput[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setContent(initialStory?.content || '');
    setBackgroundColor(initialStory?.background_color || colorOptions[0]);
    setMusicUrl(initialStory?.music_url || '');
    setMedia([]);
    setError('');
  }, [initialStory, visible]);

  const existingPreviewUri = useMemo(
    () => resolveMediaUrl(initialStory?.media.find((item) => item.type === 'image')?.media_url),
    [initialStory],
  );

  const previewUri = media[0]?.uri || existingPreviewUri;
  const canSubmit =
    !isSubmitting &&
    (content.trim().length > 0 || media.length > 0 || (mode === 'edit' && Boolean(initialStory?.media.length)));
  const title = mode === 'edit' ? 'Sua story' : 'Tao story';
  const submitLabel = mode === 'edit' ? 'Luu' : 'Dang';

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError('Ung dung can quyen truy cap thu vien anh.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        ...imagePickerOptions,
        allowsMultipleSelection: false,
        legacy: Platform.OS === 'android',
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setMedia([
        {
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          uri: asset.uri,
        },
      ]);
      setError('');
    } catch (pickError) {
      setError(pickError instanceof Error ? pickError.message : 'Khong the mo thu vien anh.');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Hay them chu hoac chon mot anh cho story.');
      return;
    }

    const payload: CreateStoryInput | UpdateStoryInput = {
      background_color: backgroundColor,
      content: content.trim() || null,
      music_url: musicUrl || null,
    };

    if (media.length > 0) {
      payload.media = media;
    }

    if (mode === 'edit') {
      (payload as UpdateStoryInput).replaceMedia = media.length > 0;
    }

    setError('');
    await onSubmit(payload);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
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

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={[styles.preview, { backgroundColor }]}>
              {previewUri ? <Image contentFit="cover" source={{ uri: previewUri }} style={StyleSheet.absoluteFill} /> : null}
              <View style={styles.previewShade} />
              <Text numberOfLines={5} style={styles.previewText}>
                {content.trim() || 'Story'}
              </Text>
              {musicUrl ? (
                <View style={styles.musicBadge}>
                  <Ionicons color={AppColors.surface} name="musical-notes" size={13} />
                  <Text numberOfLines={1} style={styles.musicBadgeText}>
                    {musicOptions.find((item) => item.value === musicUrl)?.label || 'Music'}
                  </Text>
                </View>
              ) : null}
            </View>

            <TextInput
              maxLength={280}
              multiline
              onChangeText={setContent}
              placeholder="Them chu vao story"
              placeholderTextColor={AppColors.tabInactive}
              style={styles.textInput}
              value={content}
            />

            <View style={styles.toolRow}>
              <Pressable disabled={isSubmitting} onPress={handlePickImage} style={styles.toolButton}>
                <Ionicons color={AppColors.surface} name="image-outline" size={18} />
                <Text style={styles.toolButtonText}>{previewUri ? 'Doi anh' : 'Them anh'}</Text>
              </Pressable>
            </View>

            <View style={styles.optionBlock}>
              <Text style={styles.optionTitle}>Mau nen</Text>
              <View style={styles.colorRow}>
                {colorOptions.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setBackgroundColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      color === backgroundColor ? styles.colorSwatchActive : null,
                    ]}>
                    {color === backgroundColor ? (
                      <Ionicons color={color === '#161616' ? AppColors.surface : AppColors.text} name="checkmark" size={16} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.optionBlock}>
              <Text style={styles.optionTitle}>Nhac nen</Text>
              <ScrollView contentContainerStyle={styles.musicRow} horizontal showsHorizontalScrollIndicator={false}>
                {musicOptions.map((option) => {
                  const active = option.value === musicUrl;

                  return (
                    <Pressable
                      key={option.value || 'none'}
                      onPress={() => setMusicUrl(option.value)}
                      style={[styles.musicChip, active ? styles.musicChipActive : null]}>
                      <Ionicons color={active ? AppColors.surface : AppColors.muted} name="musical-note" size={14} />
                      <Text style={[styles.musicText, active ? styles.musicTextActive : null]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
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
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    alignItems: 'center',
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  colorSwatchActive: {
    borderColor: AppColors.text,
    borderWidth: 2,
  },
  content: {
    gap: 16,
    padding: 18,
    paddingBottom: 30,
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
  header: {
    alignItems: 'center',
    borderBottomColor: AppColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  musicBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(22, 22, 22, 0.56)',
    borderRadius: 999,
    bottom: 14,
    flexDirection: 'row',
    gap: 5,
    left: 14,
    maxWidth: '84%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    position: 'absolute',
  },
  musicBadgeText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  musicChip: {
    alignItems: 'center',
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  musicChipActive: {
    backgroundColor: AppColors.text,
    borderColor: AppColors.text,
  },
  musicRow: {
    gap: 8,
  },
  musicText: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 12,
  },
  musicTextActive: {
    color: AppColors.surface,
  },
  optionBlock: {
    gap: 10,
  },
  optionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 14,
  },
  preview: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    justifyContent: 'center',
    maxHeight: 430,
    overflow: 'hidden',
    width: '72%',
  },
  previewShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  previewText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 26,
    lineHeight: 33,
    paddingHorizontal: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.28)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppColors.text,
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 52,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '94%',
    overflow: 'hidden',
  },
  submitHeader: {
    alignItems: 'center',
    minWidth: 48,
  },
  submitHeaderText: {
    color: AppColors.accent,
    fontFamily: AppFonts.heading,
    fontSize: 15,
  },
  textInput: {
    backgroundColor: AppColors.surfaceMuted,
    borderColor: AppColors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: AppColors.text,
    fontFamily: AppFonts.body,
    fontSize: 15,
    minHeight: 84,
    padding: 14,
    textAlignVertical: 'top',
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
    fontSize: 17,
  },
  toolButton: {
    alignItems: 'center',
    backgroundColor: AppColors.accent,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  toolButtonText: {
    color: AppColors.surface,
    fontFamily: AppFonts.heading,
    fontSize: 13,
  },
  toolRow: {
    flexDirection: 'row',
  },
});
