import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { AppColors, AppFonts } from "@/constants/theme";

type UserAvatarProps = {
  imageUrl?: string | null;
  name?: string | null;
  size?: number;
};

export function UserAvatar({ imageUrl, name, size = 80 }: UserAvatarProps) {
  const initial = (name || "E").slice(0, 1).toUpperCase();

  return (
    <View
      style={[
        styles.ring,
        { borderRadius: size / 2, height: size, width: size },
      ]}
    >
      <View style={styles.core}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text
            style={[styles.initial, { fontSize: Math.max(18, size * 0.32) }]}
          >
            {initial}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  core: {
    alignItems: "center",
    backgroundColor: AppColors.accentSoft,
    borderRadius: 100,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  initial: {
    color: AppColors.text,
    fontFamily: AppFonts.heading,
  },
  ring: {
    justifyContent: "center",
  },
});
