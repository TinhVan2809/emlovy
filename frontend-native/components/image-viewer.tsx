import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppFonts } from "@/constants/theme";

type Props = {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageViewer({
  visible,
  images = [],
  initialIndex = 0,
  onClose,
}: Props) {
  const { width, height } = useWindowDimensions();
  const flatRef = useRef<FlatList<string> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // ensure FlatList has measured before scrolling
      setTimeout(() => {
        flatRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 50);
    }
  }, [visible, initialIndex]);

  const renderItem = ({ item }: { item: string }) => (
    <View style={[styles.item, { width, height }]}>
      <ScrollView
        maximumZoomScale={3}
        minimumZoomScale={1}
        contentContainerStyle={{ width, height }}
        centerContent
      >
        <Image source={{ uri: item }} contentFit="contain" style={{ width, height }} />
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} presentationStyle="overFullScreen">
      <View style={styles.container}>
        <SafeAreaView style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          <Text style={styles.counter}>{`${currentIndex + 1}/${images.length}`}</Text>

          <View style={{ width: 40 }} />
        </SafeAreaView>

        <FlatList
          ref={flatRef}
          data={images}
          keyExtractor={(i) => i}
          renderItem={renderItem}
          horizontal={false}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
          onMomentumScrollEnd={(ev) => {
            const offsetY = ev.nativeEvent.contentOffset.y;
            const idx = Math.round(offsetY / height);
            setCurrentIndex(idx);
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  closeButton: { padding: 8 },
  counter: {
    color: "#fff",
    fontFamily: AppFonts.heading,
    fontSize: 16,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
