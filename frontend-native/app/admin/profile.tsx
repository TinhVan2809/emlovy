import { Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';
import { useAuth } from '@/contexts/auth-context';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <ScreenShell title="Profile">
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16 }}>Admin profile for {user?.username}</Text>
      </View>
    </ScreenShell>
  );
}
