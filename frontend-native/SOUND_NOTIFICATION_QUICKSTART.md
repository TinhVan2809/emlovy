# 🔔 Sound Notification Quick Start

## Đã làm gì?

✅ Tạo service quản lý sound notification  
✅ Tự động phát âm thanh khi nhận tin nhắn mới  
✅ Cho phép user bật/tắt sound  
✅ Tích hợp sẵn vào chat socket  
✅ UI component cho settings screen  

## Cách dùng ngay

### 1. Không cần làm gì cả! 🎉

Sound notification đã **tự động hoạt động** khi:
- User nhận tin nhắn mới qua WebSocket
- App đang chạy (foreground hoặc background)

```typescript
// ✅ Đã tích hợp sẵn trong chat-socket.ts
subscribeToChatEvents(token, {
  onReceiveMessage: (payload) => {
    notificationSound.play(); // ← Auto play!
    // ...
  }
});
```

### 2. Thêm Settings UI (Optional)

Nếu muốn cho user control sound, thêm vào settings screen:

```typescript
// app/(tabs)/profile.tsx hoặc settings screen
import { NotificationSoundSettings } from '@/components/notification-sound-settings';

<ScrollView>
  <NotificationSoundSettings />
</ScrollView>
```

Sẽ hiển thị:
- 🔊 Switch bật/tắt sound
- ▶️ Button "Nghe thử âm thanh"
- ℹ️ Thông tin về tính năng

### 3. Custom Logic (Advanced)

Nếu muốn control thêm:

```typescript
import { notificationSound } from '@/services/notification-sound';

// Tắt sound
notificationSound.setEnabled(false);

// Bật lại
notificationSound.setEnabled(true);

// Phát sound thủ công
await notificationSound.play();

// Thay đổi volume
await notificationSound.setVolume(0.5); // 50%

// Stop sound đang phát
await notificationSound.stop();
```

## Files đã tạo

```
services/
  ├── notification-sound.ts          # ⭐ Core service
  └── chat-socket.ts                 # ✏️ Updated (thêm sound)

hooks/
  └── useNotificationSound.ts        # 🎣 Hook để control

components/
  ├── notification-sound-settings.tsx # 🎨 Settings UI
  └── video-cache-settings.tsx       # (existing)

app/
  └── _layout.tsx                    # ✏️ Updated (initialize)

docs/
  └── SOUND_NOTIFICATION.md          # 📚 Full documentation
```

## Test ngay

### Cách 1: Test trong Settings
1. Add `<NotificationSoundSettings />` vào profile screen
2. Nhấn "Nghe thử âm thanh" 
3. Should hear a beep sound

### Cách 2: Test với real message
1. Mở 2 devices/accounts
2. Device A gửi tin nhắn cho Device B
3. Device B nghe thấy sound notification

### Cách 3: Test programmatically
```typescript
import { notificationSound } from '@/services/notification-sound';

// Test button
<Button 
  title="Test Sound" 
  onPress={() => notificationSound.play()} 
/>
```

## Current Setup

**Sound source:** URL online (temporary)
```typescript
uri: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
```

**Để thêm sound file local:**

1. Tạo folder:
   ```bash
   mkdir assets/sounds
   ```

2. Copy file `.mp3` vào đó (e.g., `message-notification.mp3`)

3. Update code:
   ```typescript
   // services/notification-sound.ts
   await Audio.Sound.createAsync(
     require('@/assets/sounds/message-notification.mp3'),
     { shouldPlay: false, volume: 0.5 }
   );
   ```

4. Rebuild:
   ```bash
   npx expo prebuild --clean
   ```

## Tính năng

| Feature | Status | Note |
|---------|--------|------|
| Auto-play on message | ✅ | Works |
| Enable/disable toggle | ✅ | Works |
| Volume control | ✅ | 0.0-1.0 |
| Test sound button | ✅ | Works |
| iOS Silent Mode support | ✅ | Plays even in silent |
| Android compatibility | ✅ | Works |
| Background play | ⚠️ | Foreground only (limitation) |
| Custom sounds | ❌ | Single sound only |
| Vibration | ❌ | Not implemented |

## Troubleshooting

### ❌ Sound không phát

**Check 1:** Sound có enabled không?
```typescript
console.log(notificationSound.isNotificationEnabled());
```

**Check 2:** Logs
```
[NotificationSound] Audio mode configured
[NotificationSound] Notification sound loaded  
[NotificationSound] Notification sound played  ← Should see this
```

**Check 3:** Device volume không phải 0

### ❌ "expo-av not found"

```bash
npx expo install expo-av
```

### ❌ Build lỗi

```bash
npx expo prebuild --clean
```

## Disable Sound (nếu cần)

Nếu không muốn dùng sound notification, comment out:

```typescript
// services/chat-socket.ts
const onReceiveMessageWithSound = (payload: ReceiveMessagePayload) => {
  // notificationSound.play().catch(() => {}); // ← Comment này
  handlers.onReceiveMessage?.(payload);
};
```

## Next Steps (Optional)

- [ ] Thêm multiple sound options
- [ ] Thêm vibration
- [ ] Thêm volume slider trong settings
- [ ] Persist settings vào AsyncStorage
- [ ] Custom sound per contact
- [ ] Do Not Disturb schedule

## Questions?

- 📚 Full docs: `docs/SOUND_NOTIFICATION.md`
- 🐛 Issues: Check logs với logger
- 📦 Package: expo-av docs

---

**That's it!** Sound notification đã hoạt động tự động. 🎵
