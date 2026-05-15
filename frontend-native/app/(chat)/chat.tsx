import React from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";

import { ScreenShell } from "@/components/screen-shell";
// import { AppColors, AppFonts } from "@/constants/theme";


export default function ChatScreen() {
  return (
    <ScreenShell title="Chat">
      <View style={styles.container}>
        <TextInput placeholder="Search Chat..." style={styles.input}/>
        <View style={styles.category}>
          <Text style={styles.categoty_items}>All</Text>
          <Text style={styles.categoty_items}>Chưa đọc</Text>
          <Text style={styles.categoty_items}>Nhóm</Text>
          <Text style={styles.categoty_items}>Khác</Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  category: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    width: '100%',
    marginTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
  },
  categoty_items: {
    fontSize: 16
  }
});
