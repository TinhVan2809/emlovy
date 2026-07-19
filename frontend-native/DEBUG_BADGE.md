# Debug Badge Không Hoạt Động

## 🔍 Checklist Debug

Chạy app và kiểm tra console logs để xác định vấn đề:

### 1. Provider đã được wrap chưa?
```
[UnreadMessages] Context state: { unreadCount: X, hasToken: true/false, hasUser: true/false }
```
- ✅ Nếu thấy log này → Provider đang hoạt động
- ❌ Nếu không thấy → Provider chưa được wrap hoặc component không render

### 2. Token và User có sẵn không?
```
[UnreadMessages] Fetching unread count from API...
[UnreadMessages] Unread count from API: X
```
- ✅ Nếu thấy → API call thành công
- ❌ Nếu thấy "No token, setting count to 0" → User chưa đăng nhập

### 3. Socket có subscribe không?
```
[UnreadMessages] Subscribing to chat events for user: X
```
- ✅ Nếu thấy → Socket đang lắng nghe
- ❌ Nếu thấy "Socket listener not active" → Thiếu token hoặc user

### 4. Badge có render không?
```
[ChatNotificationBadge] Rendering with count: X size: medium
```
- ✅ Nếu thấy count > 0 → Badge đang render
- ❌ Nếu thấy "Count is 0 or negative, returning null" → Badge bị ẩn

### 5. Socket events có được nhận không?
Gửi tin nhắn từ user khác và kiểm tra:
```
[UnreadMessages] Received message event: { senderId: X, currentUserId: Y, isFromOther: true }
[UnreadMessages] Message from other user, incrementing count
[UnreadMessages] Incrementing unread count
[UnreadMessages] Count increased: 0 -> 1
```

## 🐛 Các vấn đề thường gặp

### Vấn đề 1: Badge không xuất hiện
**Nguyên nhân:**
- `unreadCount` luôn là 0
- Provider không được wrap đúng cách
- API không trả về `unread_count`

**Giải pháp:**
1. Kiểm tra `app/_layout.tsx` có wrap `UnreadMessagesProvider`
2. Kiểm tra API response có field `unread_count`
3. Test bằng cách gọi `incrementUnreadCount()` thủ công

### Vấn đề 2: Badge không cập nhật realtime
**Nguyên nhân:**
- Socket.IO chưa connect
- Event listener không được subscribe
- `sender_id` không đúng format

**Giải pháp:**
1. Kiểm tra Socket.IO connection status
2. Verify event name: `receive_message` 
3. Check `message.sender_id` type (number vs string)

### Vấn đề 3: Badge không đúng vị trí
**Nguyên nhân:**
- CSS `position: absolute` không hoạt động
- Parent container không có `position: relative`

**Giải pháp:**
```tsx
<View style={{ position: 'relative' }}>
  <Ionicons name="paper-plane-outline" size={24} />
  <ChatNotificationBadge count={unreadCount} />
</View>
```

### Vấn đề 4: Badge không ẩn sau khi đọc tin nhắn
**Nguyên nhân:**
- `refreshUnreadCount()` không được gọi
- API không cập nhật `unread_count` sau khi đọc

**Giải pháp:**
1. Gọi `refreshUnreadCount()` trong chat screen
2. Verify API endpoint đánh dấu tin nhắn đã đọc
3. Check backend có reset `unread_count`

## 🧪 Test Commands

### Test 1: Manual increment (trong console hoặc debug)
```tsx
import { useUnreadMessages } from '@/contexts/unread-messages-context';

function TestComponent() {
  const { incrementUnreadCount, unreadCount } = useUnreadMessages();
  
  return (
    <View>
      <Text>Count: {unreadCount}</Text>
      <Button title="Test +1" onPress={incrementUnreadCount} />
    </View>
  );
}
```

### Test 2: Verify API response
```tsx
// Trong context, thêm log chi tiết
const response = await chatApi.getConversations(token, { limit: 100, page: 1 });
console.log('Conversations:', JSON.stringify(response.data.items, null, 2));
```

### Test 3: Mock unread count
```tsx
// Tạm thời hardcode để test UI
const [unreadCount, setUnreadCount] = useState(5); // Thay vì 0
```

## 📱 Quick Fix - Nếu cần test ngay

Trong `contexts/unread-messages-context.tsx`, tạm thời set count cố định:

```tsx
export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(3); // TEST: hardcode 3
  
  // ... rest of code
}
```

Nếu badge xuất hiện với count=3, nghĩa là:
- ✅ Badge component hoạt động đúng
- ✅ Provider được wrap đúng
- ❌ Vấn đề nằm ở API hoặc Socket logic

## 🔧 Remove Debug Logs

Sau khi fix xong, xóa tất cả `console.log` để clean code:

```bash
# Search trong VSCode
console.log\('\[UnreadMessages\].*?\);
console.log\('\[ChatNotificationBadge\].*?\);
```

## 📞 Cần thêm debug info?

Thêm vào issue:
1. Console logs từ các bước trên
2. API response example
3. Socket connection status
4. Screenshots của badge (hoặc không có gì)
