import { View, Text, StyleSheet } from "react-native";
export default function Footer() {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.copy}>
        <Text>©</Text>
        <Text>Emlovy 2026</Text>
      </View>
      <View style={styles.info}>
        <Text>Terms of Use</Text>
        <Text>FAQ</Text>
        <Text>Contact</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 5,
    paddingHorizontal: 10,
  },
  copy: {
    flexDirection: "row",
  },
  info: {
    flexDirection: "row",
    gap: 10,
  },
});
