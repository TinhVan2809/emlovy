import React, { useState } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";

type ManagementTab = "users" | "posts" | "others";

export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState<ManagementTab>("users");

  return (
    <ScreenShell title="Management">
      <View style={styles.container}>
        <View style={styles.btnContainer}>
          <Pressable
            onPress={() => setActiveTab("users")}
            style={[
              styles.tabBtn,
              activeTab === "users" && { backgroundColor: "#000" },
            ]}
          >
            <Text
              style={[
                styles.btnText,
                activeTab === "users" && { color: "#fff" },
              ]}
            >
              Users
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("posts")}
            style={[
              styles.tabBtn,
              activeTab === "posts" && { backgroundColor: "#000" },
            ]}
          >
            <Text
              style={[
                styles.btnText,
                activeTab === "posts" && { color: "#fff" },
              ]}
            >
              Posts
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("others")}
            style={[
              styles.tabBtn,
              activeTab === "others" && { backgroundColor: "#000" },
            ]}
          >
            <Text
              style={[
                styles.btnText,
                activeTab === "others" && { color: "#fff" },
              ]}
            >
              Others
            </Text>
          </Pressable>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "users" && (
            <View style={styles.usersTabContainer}>
              <Pressable style={styles.usersTabItems}>
                <View style={styles.item}>
                  <Text style={styles.title}>Quản lý tài khoản người dùng</Text>
                  <Text style={styles.description}>
                    Xem và chỉnh sửa/thay đổi tài khoản người dùng
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={20} style={styles.icon}/>
              </Pressable>
              <Pressable style={styles.usersTabItems}>
                <View style={styles.item}>
                  <Text style={styles.title}>Quản lý trạng thái tài khoản</Text>
                  <Text style={styles.description}>
                    Xem và chỉnh sửa/thay đổi trạng thái tài khoản người dùng
                    (block/unblock)
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={20} style={styles.icon}/>
              </Pressable>
              <Pressable style={styles.usersTabItems}>
                <View style={styles.item}>
                  <Text style={styles.title}>Cấp quyền Admin/Moderator</Text>
                  <Text style={styles.description}>
                    Cấp quyền quản trị của nhân viên
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={20} style={styles.icon}/>
              </Pressable>
              <Pressable style={styles.usersTabItems}>
                <View style={styles.item}>
                  <Text style={styles.title}>Quản lý tick xanh</Text>
                  <Text style={styles.description}>
                    Xác thực tài khoản, gán tick xanh cho người dùng
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={20} style={styles.icon}/>
              </Pressable>
            </View>
          )}

          {activeTab === "posts" && (
            <View>
              <Text>Posts tab content</Text>
            </View>
          )}

          {activeTab === "others" && (
            <View>
              <Text>Others tab content</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  // 3 nút tab chuyển đổi.
  container: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    gap: 20,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabBtn: {
    minWidth: 120,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  btnText: {
    textAlign: "center",
  },

  // style bọc nội dung của các tab
  tabContent: {
    marginTop: 20
  },

  // tab Users
  usersTabContainer: {
    gap: 20,
  },

  usersTabItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    maxWidth: "80%",
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  description: {
    opacity: 0.5
  },
  icon: {
    opacity: 0.7
  }
});
