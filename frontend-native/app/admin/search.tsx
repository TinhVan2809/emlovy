import { Text, View } from 'react-native';
import { ScreenShell } from '@/components/screen-shell';

export default function AdminSearch() {
  return (
    <ScreenShell title="Search">
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 16 }}>Search</Text>
      </View>
    </ScreenShell>
  );
}
