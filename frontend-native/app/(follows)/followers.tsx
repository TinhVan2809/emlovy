import { ScreenShell } from "@/components/screen-shell"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, TextInput, StyleSheet } from "react-native"
export default function Followers() {
    return (
        <ScreenShell title="Following">
           <View style={styles.conatiner}>
             <View style={styles.headerTitle}>
                <Text style={styles.description}>8 followers. Xem những người đang theo dõi bạn. <Text style={styles.seeAll}>See all</Text></Text>
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" style={{fontSize: 20}}/>
                    <TextInput placeholder="Tìm kiếm người đang theo dõi...." style={styles.input}/>
                </View>
            </View>
           </View>
        </ScreenShell>
    );
}

const styles = StyleSheet.create({
    conatiner: {
        padding: 20,
    },
    headerTitle: {
        
    },
    description: {
        color: '#0000008c'
    },
    seeAll: {
        color: '#000',
        fontWeight: 600,
    },
    searchContainer: {
        marginTop: 25
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '20px'
    },
    input: {
        width: '100%',
    }
})