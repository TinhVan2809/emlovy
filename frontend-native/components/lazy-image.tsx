import { Image } from 'expo-image';
import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

interface LazyImageProps {
  source: { uri: string } | number;
  style?: ViewStyle | ImageStyle;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  blurhash?: string;
  priority?: 'low' | 'normal' | 'high';
  placeholder?: React.ReactNode;
  transition?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy Loading Image Component với expo-image
 * - Tự động cache images
 * - Blurhash placeholder cho smooth loading
 * - Priority loading cho ảnh quan trọng
 * - Fade in animation
 */
export function LazyImage({
  source,
  style,
  contentFit = 'cover',
  blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[',
  priority = 'normal',
  placeholder,
  transition = 200,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Loading indicator */}
      {isLoading && !placeholder && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={AppColors.muted} />
        </View>
      )}

      {/* Custom placeholder */}
      {isLoading && placeholder && (
        <View style={styles.placeholderContainer}>
          {placeholder}
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon} />
        </View>
      )}

      {/* Image */}
      {!hasError && (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={transition}
          placeholder={{ blurhash }}
          onLoad={handleLoad}
          onError={handleError}
          cachePolicy="memory-disk"
          priority={priority}
        />
      )}
    </View>
  );
}

/**
 * Avatar Component với lazy loading
 */
interface LazyAvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
  borderWidth?: number;
  borderColor?: string;
}

export function LazyAvatar({
  imageUrl,
  name,
  size = 40,
  style,
  borderWidth = 0,
  borderColor = '#fff',
}: LazyAvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate consistent color from name
  const getColorFromName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7B731', '#5F27CD', '#00D2D3'];
    return colors[Math.abs(hash) % colors.length];
  };

  const backgroundColor = getColorFromName(name);

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
          backgroundColor: !imageUrl || hasError ? backgroundColor : 'transparent',
        },
        style,
      ]}
    >
      {(!imageUrl || hasError) && (
        <View style={styles.initialsContainer}>
          <View style={[styles.initials, { fontSize: size / 2.5 }]}>
            {initials}
          </View>
        </View>
      )}

      {imageUrl && !hasError && (
        <Image
          source={{ uri: imageUrl }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: size / 2 },
          ]}
          contentFit="cover"
          transition={200}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          cachePolicy="memory-disk"
          priority="high"
        />
      )}
    </View>
  );
}

/**
 * Thumbnail Component với progressive loading
 */
interface LazyThumbnailProps {
  uri: string;
  width: number;
  height: number;
  blurhash?: string;
  onPress?: () => void;
}

export function LazyThumbnail({
  uri,
  width,
  height,
  blurhash,
  onPress,
}: LazyThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View style={[styles.thumbnailContainer, { width, height }]}>
      {!isLoaded && (
        <View style={styles.thumbnailPlaceholder}>
          <ActivityIndicator size="small" color={AppColors.muted} />
        </View>
      )}

      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        placeholder={blurhash ? { blurhash } : undefined}
        onLoad={() => setIsLoaded(true)}
        cachePolicy="memory-disk"
        priority="low"
      />
    </View>
  );
}

/**
 * Background Image với overlay
 */
interface LazyBackgroundImageProps {
  uri: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  overlayOpacity?: number;
}

export function LazyBackgroundImage({
  uri,
  children,
  style,
  overlayOpacity = 0.4,
}: LazyBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View style={[styles.backgroundContainer, style]}>
      {!isLoaded && <View style={styles.backgroundPlaceholder} />}

      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        onLoad={() => setIsLoaded(true)}
        cachePolicy="memory-disk"
      />

      {/* Overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(0,0,0,${overlayOpacity})` },
        ]}
      />

      {/* Content */}
      {children && <View style={styles.contentContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initialsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
  },
  thumbnailContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  thumbnailPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backgroundContainer: {
    overflow: 'hidden',
  },
  backgroundPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    zIndex: 10,
  },
});
