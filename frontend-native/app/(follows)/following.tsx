import { ScreenShell } from "@/components/screen-shell"
import { Ionicons } from "@expo/vector-icons"
import { View, Text, TextInput, StyleSheet } from "react-native"
export default function Following() {
    return (
        <ScreenShell title="Following">
           <View style={styles.conatiner}>
             <View style={styles.headerTitle}>
                <Text style={styles.description}>8 following. Xem những người mà bạn đã theo dõi trên emlovy mà chưa theo dõi trên Thread yet. <Text style={styles.seeAll}>See all</Text></Text>
            </View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" style={{fontSize: 20}}/>
                    <TextInput placeholder="Tìm kiếm người đã theo dõi...." style={styles.input}/>
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