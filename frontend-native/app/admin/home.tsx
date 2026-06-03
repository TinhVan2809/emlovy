import { Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';

export default function AdminHome() {
  return (
    <ScreenShell title="Admin">
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16 }}>Admin Home</Text>
      </View>
    </ScreenShell>
  );
}
