# 🐛 Hướng dẫn Debug Badge Không Hoạt Động

## Bước 1: Thêm Test Component (Nhanh nhất)

Thêm vào **bất kỳ screen nào** (ví dụ: `index.tsx`) để test badge:

```tsx
import { UnreadBadgeTester } from '@/components/unread-badge-tester';

export default function HomeScreen() {
  // ... existing code
  
  return (
    <View>
      {/* Thêm tester ở đầu để dễ thấy */}
      <UnreadBadgeTester />
      
      {/* Rest of your screen */}
    </View>
  );
}
```

**Component này cho phép:**
- ✅ Xem count hiện tại
- ✅ Test tăng/giảm count
- ✅ Xem preview badge
- ✅ Test các sizes khác nhau
- ✅ Test edge cases (0, 1, 9, 99+)

## Bước 2: Kiểm tra Console Logs

Mở Console/Terminal và chạy app, bạn sẽ thấy:

### 2.1. Context Logs
```
[UnreadMessages] Context state: { unreadCount: 0, hasToken: true, hasUser: true }
[UnreadMessages] Fetching unread count from API...
[UnreadMessages] Unread count from API: 5
```

### 2.2. Badge Logs
```
[ChatNotificationBadge] Rendering with count: 5 size: medium
[ChatNotificationBadge] Will display: 5
```

### 2.3. Socket Logs (khi nhận tin nhắn)
```
[UnreadMessages] Received message event: { senderId: 2, currentUserId: 1, isFromOther: true }
[UnreadMessages] Message from other user, incrementing count
[UnreadMessages] Incrementing unread count
[UnreadMessages] Count increased: 5 -> 6
```

## Bước 3: Xác định vấn đề

### ❌ Vấn đề A: Không thấy logs gì cả
**Nguyên nhân:** Provider chưa được wrap

**Giải pháp:**
1. Mở `app/_layout.tsx`
2. Kiểm tra có `<UnreadMessagesProvider>` wrap `<Stack>`
3. Restart app

```tsx
// app/_layout.tsx
<AuthProvider>
  <UnreadMessagesProvider>  {/* Phải có dòng này */}
    <Stack>...</Stack>
  </UnreadMessagesProvider>
</AuthProvider>
```

---

### ❌ Vấn đề B: Thấy "No token, setting count to 0"
**Nguyên nhân:** User chưa đăng nhập

**Giải pháp:**
1. Đăng nhập vào app
2. Kiểm tra `useAuth()` có trả về token không

---

### ❌ Vấn đề C: API call failed
**Nguyên nhân:** Endpoint không tồn tại hoặc lỗi

**Logs:**
```
[UnreadMessages] Failed to fetch unread count: [Error message]
```

**Giải pháp:**
1. Kiểm tra `chatApi.getConversations()` có hoạt động không
2. Test endpoint với Postman/Thunder Client
3. Verify API response có field `unread_count` trong mỗi conversation

**Expected API Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "conversation_id": 1,
        "unread_count": 3,  // ← Field này cần có
        ...
      }
    ]
  }
}
```

---

### ❌ Vấn đề D: Count luôn là 0 dù có tin nhắn chưa đọc
**Nguyên nhân:** Backend không trả về `unread_count` hoặc luôn trả về 0

**Giải pháp:**
1. Thêm log trong context để xem raw API response:

```tsx
const response = await chatApi.getConversations(token, { limit: 100, page: 1 });
console.log('Full response:', JSON.stringify(response.data.items, null, 2));
```

2. Nếu `unread_count` không có hoặc luôn = 0:
   - Backend cần implement logic tính `unread_count`
   - Hoặc tạm thời mock data để test UI:

```tsx
// Tạm thời trong context
const [unreadCount, setUnreadCount] = useState(5); // Mock để test
```

---

### ❌ Vấn đề E: Badge không xuất hiện dù count > 0
**Nguyên nhân:** CSS/Style issue

**Kiểm tra:**
1. Badge có render không:
```
[ChatNotificationBadge] Rendering with count: 5
```

2. Nếu có render nhưng không thấy → Vấn đề về style

**Giải pháp:**
```tsx
// Parent container phải có position: relative
<View style={{ position: 'relative' }}>
  <Ionicons name="paper-plane-outline" size={24} />
  <ChatNotificationBadge count={unreadCount} />
</View>
```

---

### ❌ Vấn đề F: Socket không nhận tin nhắn
**Nguyên nhân:** Event listener không được subscribe

**Logs nếu đúng:**
```
[UnreadMessages] Subscribing to chat events for user: 1
```

**Logs nếu sai:**
```
[UnreadMessages] Socket listener not active - missing token or user
```

**Giải pháp:**
1. Kiểm tra `chat-socket.ts` có export `subscribeToChatEvents`
2. Verify event name: `receive_message` (chính xác)
3. Test bằng cách gửi tin nhắn từ user khác

---

## Bước 4: Quick Fixes

### Fix 1: Mock data để test UI
```tsx
// Trong UnreadMessagesProvider
export function UnreadMessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(3); // TEST
  
  // Comment out API call tạm thời
  // const refreshUnreadCount = useCallback(async () => { ... });
  
  return <UnreadMessagesContext.Provider value={{ unreadCount, ... }}>
    {children}
  </UnreadMessagesContext.Provider>;
}
```

Nếu badge xuất hiện với count=3 → UI hoạt động ✅
Vấn đề nằm ở API/Socket logic ❌

---

### Fix 2: Force increment để test Socket
Trong chat screen, thêm button test:

```tsx
import { useUnreadMessages } from '@/contexts/unread-messages-context';

function ChatScreen() {
  const { incrementUnreadCount } = useUnreadMessages();
  
  return (
    <View>
      <Button title="Test +1" onPress={incrementUnreadCount} />
      {/* ... rest */}
    </View>
  );
}
```

Click button → Badge tăng lên → Context hoạt động ✅

---

### Fix 3: Bypass API và dùng hardcode
```tsx
const refreshUnreadCount = useCallback(async () => {
  // Tạm thời bỏ API call
  console.log('[UnreadMessages] Using hardcoded count');
  setUnreadCount(7); // Hardcode
  return;
  
  // Comment out phần API
  // try { ... } catch { ... }
}, []);
```

---

## Bước 5: Xóa Debug Logs sau khi fix

Sau khi tìm ra và fix vấn đề, xóa tất cả debug logs:

### Tìm kiếm trong VSCode:
```
console\.log\('\[UnreadMessages\].*?\);
console\.log\('\[ChatNotificationBadge\].*?\);
```

### Hoặc xóa thủ công trong:
- `contexts/unread-messages-context.tsx`
- `components/chat-notification-badge.tsx`

---

## 📋 Checklist Hoàn chỉnh

- [ ] Provider được wrap trong `_layout.tsx`
- [ ] User đã đăng nhập (có token)
- [ ] API endpoint `/chat/conversations` hoạt động
- [ ] API response có field `unread_count` cho mỗi conversation
- [ ] Socket.IO đã connect thành công
- [ ] Event `receive_message` được emit từ backend
- [ ] Badge component render với count > 0
- [ ] Badge xuất hiện đúng vị trí (góc trên phải icon)
- [ ] Count tăng khi nhận tin nhắn từ người khác
- [ ] Count không tăng khi gửi tin nhắn đi
- [ ] Count refresh sau khi mở chat screen

---

## 🆘 Vẫn không work?

Cung cấp thông tin sau:

1. **Console logs** từ khi khởi động app
2. **API response** từ `/chat/conversations`
3. **Socket connection status**
4. **Screenshots** của:
   - Console logs
   - App UI (có/không có badge)
   - Network tab (API calls)

---

## ✅ Nếu mọi thứ OK

Badge sẽ:
- Xuất hiện khi có tin nhắn chưa đọc
- Hiển thị số lượng (1-99) hoặc "99+"
- Cập nhật realtime qua Socket.IO
- Ẩn đi khi count = 0
- Refresh khi mở chat screen

🎉 **Chúc mừng! Badge hoạt động!**
