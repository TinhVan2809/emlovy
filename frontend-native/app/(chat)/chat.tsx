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
          <Text>All</Text>
          <Text>Chưa đọc</Text>
          <Text>Nhóm</Text>
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
  }
});
