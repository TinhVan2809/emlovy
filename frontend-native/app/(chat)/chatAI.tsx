import { ScreenShell } from "@/components/screen-shell";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
export default function ChatAI () {
    return (
       <ScreenShell title="Emloly"
       right={
        <Pressable>
            <Ionicons name="search-outline"/>
        </Pressable>
       }>
        <View>
            <Text>chat with AI</Text>
        </View>
       </ScreenShell>
    )
}