# Emlovy Native

Giao diện React Native này đã được dựng lại theo phong cách Instagram với:

- `5` tab ở bottom: `Home`, `Search`, `Reels`, `Activity`, `Profile`
- top navbar riêng cho từng màn
- dữ liệu mock để app hiển thị hoàn chỉnh ngay cả khi chưa nối backend
- cấu trúc Expo Router đã được dọn sạch phần scaffold mặc định

## Chạy dự án

```bash
npm install
npx expo start
```

## Cấu trúc chính

- `app/(tabs)`: các màn hình chính
- `components`: component UI dùng chung cho layout/feed
- `constants`: theme và dữ liệu mock

## Ghi chú

- Màu sắc và layout ưu tiên cảm giác giống Instagram nhưng vẫn giữ nhận diện riêng cho `emlovy`
- `backend-node` ở thư mục gốc không bị tác động trong lần chỉnh UI này

### Tài khoản khách hàng
```bash
    tinhlu
    tinhemlovy@28092004
```