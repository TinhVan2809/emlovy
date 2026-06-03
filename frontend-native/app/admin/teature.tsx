import { Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';

export default function AdminTeature() {
  return (
    <ScreenShell title="Teature">
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16 }}>Teature</Text>
      </View>
    </ScreenShell>
  );
}
