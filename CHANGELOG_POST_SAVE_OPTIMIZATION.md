# Tối ưu hóa kiểm tra Post đã lưu (Post Save Optimization)

## Vấn đề
Trước đây, frontend phải gọi API riêng biệt để kiểm tra xem mỗi bài post có được lưu hay không (`/api/post-save/${postId}/check`). Điều này gây quá tải server khi có nhiều bài post trên feed.

## Giải pháp
Tích hợp logic kiểm tra `is_saved` trực tiếp vào API `getFeed` và các API liên quan, trả về trạng thái lưu của từng bài post cùng với dữ liệu post.

## Các thay đổi

### Backend

#### 1. `backend-node/models/postModel.js`
- **Thêm trường `is_saved`** vào `buildPostSelectFields()`:
  - Sử dụng subquery `EXISTS` để kiểm tra xem user hiện tại có lưu bài post này không
  - Tương tự như cách kiểm tra `liked_by_me`
  
- **Cập nhật `toPublicPost()`**:
  - Thêm `is_saved: Boolean(post.is_saved)` vào object trả về

**Kết quả**: Mọi API trả về danh sách posts (getFeed, getMyPosts, getUserPosts, getFollowingFeed) đều tự động bao gồm trường `is_saved`.

### Frontend Next.js

#### 2. `frontend-next/components/PostCard.tsx`
- **Cập nhật interface `Post`**:
  - Thêm `is_saved?: boolean`
  
- **Xóa `useEffect` kiểm tra saved**:
  - Loại bỏ việc gọi API `/api/post-save/${postId}/check`
  - Loại bỏ import `useEffect` không cần thiết
  
- **Cập nhật state initialization**:
  - Khởi tạo `isSaved` từ `postData.is_saved` thay vì `false`
  - `const [isSaved, setIsSaved] = useState<boolean>(() => postData.is_saved ?? false);`

**Kết quả**: Giảm N API calls xuống 0 calls cho việc kiểm tra saved status.

### Frontend React Native

#### 3. `frontend-native/types/auth.ts`
- **Cập nhật type `Post`**:
  - Thêm `is_saved: boolean`

#### 4. `frontend-native/services/api.ts`
- **Thêm API methods vào `postApi`**:
  ```typescript
  async save(token: string, postId: number)
  async unsave(token: string, postId: number)
  ```

#### 5. `frontend-native/components/post-card.tsx`
- **Thêm prop `onToggleSave`** vào component
- **Cập nhật bookmark icon**:
  - Hiển thị `bookmark` (filled) nếu `post.is_saved === true`
  - Hiển thị `bookmark-outline` nếu `post.is_saved === false`
  - Gọi `onToggleSave` khi click

#### 6. `frontend-native/app/(tabs)/index.tsx`
- **Thêm `handleTogglePostSave()`**:
  - Tương tự logic của `handleTogglePostLike`
  - Optimistic update với `patchPost`
  - Gọi `postApi.save()` hoặc `postApi.unsave()`
  - Error handling với rollback
  
- **Cập nhật `renderPostItem` và `FeedPostItem`**:
  - Thêm prop `onToggleSave={handleTogglePostSave}`
  - Truyền prop xuống `PostCard`

## Lợi ích

### Performance
- **Giảm số lượng API calls**: Từ N+1 calls xuống còn 1 call duy nhất cho feed
- **Tăng tốc độ tải trang**: Không cần đợi N requests riêng lẻ hoàn thành
- **Giảm tải server**: Server chỉ cần xử lý 1 query với JOIN/subquery thay vì N queries riêng biệt

### User Experience
- **Hiển thị ngay lập tức**: Trạng thái saved hiển thị ngay khi load posts
- **Không có trạng thái loading**: Không cần skeleton hoặc placeholder cho saved icon
- **Optimistic updates**: UI phản hồi ngay lập tức khi user click save/unsave

### Code Quality
- **Đơn giản hóa logic**: Loại bỏ useEffect phức tạp trong PostCard
- **Tính nhất quán**: Cùng pattern với `liked_by_me`
- **Dễ maintain**: Logic tập trung ở một nơi (postModel)

## Testing

### Các trường hợp cần test:
1. ✅ Feed hiển thị đúng trạng thái saved cho mỗi post
2. ✅ Click save/unsave cập nhật UI ngay lập tức (optimistic)
3. ✅ Sau khi API hoàn thành, trạng thái vẫn đúng
4. ✅ Xử lý lỗi đúng cách (rollback UI nếu API fail)
5. ✅ User chưa đăng nhập: `is_saved` luôn là `false`
6. ✅ Performance: Kiểm tra thời gian load feed trước và sau

## Migration Notes

- **Backward compatible**: Các API cũ vẫn hoạt động bình thường
- **Không cần database migration**: Sử dụng bảng `post_save` hiện có
- **Không breaking changes**: Thêm field mới, không xóa field cũ
