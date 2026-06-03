import { Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';

export default function AdminManagement() {
  return (
    <ScreenShell title="Management">
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16 }}>Management</Text>
      </View>
    </ScreenShell>
  );
}
