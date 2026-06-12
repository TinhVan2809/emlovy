import { Text, View, StyleSheet } from "react-native";
import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/contexts/auth-context";
import {
  Bell,
  UserRound,
  ShieldCheck,
  PhoneCall,
  Languages,
  TriangleAlert,
  LogOut,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import { resolveMediaUrl } from "@/services/api";
import { UserAvatar } from "@/components/user-avatar";
export default function AdminProfile() {
  const { user } = useAuth();

  const displayUser = user;
  const displayName = displayUser?.name || "Emlovy User";
  const displayHandle = displayUser?.username
    ? `@${displayUser.username}`
    : "@emlovy";
  const avatarUrl = resolveMediaUrl(
    displayUser?.avatar_url || displayUser?.avata,
  );

  return (
    <ScreenShell
      title="Profile"
      right={
        <View>
          <Bell />
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.headProfile}>
          <UserAvatar imageUrl={avatarUrl} name={displayName} />
          <View>
            <Text style={[styles.infoText, styles.name]}>{displayName}</Text>
            <Text style={[styles.infoText, styles.username]}>{displayHandle}</Text>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <View style={styles.action}>
            <View style={styles.items}>
              <UserRound style={styles.icon}/>
              <Text>Personal infomation</Text>
            </View>
            <ChevronDown style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <ShieldCheck style={styles.icon}/>
              <Text>Login and Security</Text>
            </View>
            <ChevronDown style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <PhoneCall style={styles.icon}/>
              <Text>Customer Suppoort</Text>
            </View>
            <ChevronDown style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <Languages style={styles.icon}/>
              <Text>Languages</Text>
            </View>
            <ChevronDown style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <TriangleAlert style={styles.icon}/>
              <Text>Share the App</Text>
            </View>
            <ChevronRight style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <LogOut style={styles.icon}/>
              <Text>Log out</Text>
            </View>
            <ChevronRight style={styles.icon}/>
          </View>
          <View style={styles.action}>
            <View style={styles.items}>
              <Text style={styles.textNumber}>Number ID:</Text>
              <Text style={styles.numberID}>{user?.user_id}</Text>
            </View>
            <View style={styles.copyBox}>
              <Copy style={styles.icon}/>
              <Text style={styles.copyText}>Copy</Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 35,
  },
  headProfile: {
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10
  },
  infoText: {
    textAlign: 'center'
  },
  name: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  username: {
    fontSize: 15,
    opacity: .8
  },
  actionContainer: {
    flexDirection: 'column',
    gap: 33
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  items: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  icon: {
    opacity: .8
  },
  textNumber: {
    fontSize: 16,
    opacity: .8
  },
  numberID: {
    fontSize: 18,
    fontWeight: 'semibold'
  },
  copyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 39, 43, 0.1)',
    padding: 10,
    borderRadius: 10,
  },
  copyText: {
    opacity: .8
  }
})