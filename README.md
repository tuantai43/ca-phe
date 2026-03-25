# Dự án: Cà Phê Võng Quán (Advanced POS Web App)

## 1. Mục tiêu và Kiến trúc mới
Xây dựng một ứng dụng web (PWA) quản lý bán hàng chuyên nghiệp cho quán cà phê võng.
Hệ thống đã được nâng cấp toàn diện từ một POS cục bộ lên một nền tảng điện toán đám mây bảo mật:
Yêu cầu cao nhất: Giao diện cực kỳ đơn giản, nút bấm to, rõ ràng, dễ sử dụng cho người lớn tuổi NHƯNG bảo vệ chống thất thoát cực cao ở phía backend.

## 2. Công nghệ sử dụng
- Framework: Vue 3 (Composition API, `<script setup>`) + Vite
- Styling: Tailwind CSS (Ưu tiên các thành phần có độ tương phản cao, font chữ lớn, Icon Lucide)
- Xác thực: **Firebase Authentication (Google Login)** với cơ chế Redirect an toàn tuyệt đối.
- Quản lý dữ liệu: **Firebase Firestore** Real-time Database (Secured by Firestore Rules).
- Quản trị State: Pinia/Composable Global Store (`useCartStore`) giúp lưu trữ trạng thái giỏ hàng trọn đời.

## 3. Hệ thống Chức năng Chính
### 3.1. Phân Quyền Hạt Nhân (Role-Based Access Control)
Hệ thống chia làm 4 Role cốt lõi:
- **Member**: Thu ngân, chạy bàn. Được phép tạo Đơn, xem màn hình Trang chủ & Khoản Chi.
- **View Reports**: Kế toán. Được quyền xem màn Sổ Sách, xuất file Excel CSV.
- **Manage Roles**: Quản lý nhân sự. Cấp quyền, khoá tài khoản nhân viên.
- **Admin**: Cổ đông/Chủ quán. Quyền lực vô cực: Đổi giá gốc (Master Data Price) và soi chiếu Nhật Ký Thao Tác (Audit Logs).

### 3.2. Màn hình Bán hàng (Sales)
- Danh sách món lấy giá động từ CSDL Trung Tâm (`master_data`).
- Giỏ hàng **Bất tử (Global Store)**: Chuyển tab không bao giờ mất đơn khách đang order dở.
- Quản lý nhiều võng / khách mang đi độc lập.

### 3.3. Sổ Sách & Sửa Đơn Kế Toán
- Tách bạch giao dịch Thu (Bán hàng) và Chi (Phát sinh).
- **EditOrderModal Cao cấp**: Kế toán có thể sửa số lượng Từng Món trong hoá đơn cũ. Tổng tiền mới sẽ được ép nhân lại đúng với **Đơn Giá Gốc** (Lịch sử) một cách tự động, chống tự nhập tiền sai phạm.

### 3.4. Hệ Thống Admin & Audit Logs
- Quản lý Bảng Giá tập trung (áp dụng Local Numpad Touch Modal).
- **Audit Logger**: Backend tự động Snapshot song song Dữ Liệu Cũ và Mới. Hiển thị lại bằng Visual Diffing Timeline giúp truy vết mọi thao tác "Sửa Tiền", "Xoá Bill" của nhân viên một cách minh bạch.

## 4. Nguyên tắc thiết kế (UI/UX)
- Không dùng Alert/Prompt truyền thống. Tận dụng 100% Custom Modal trượt từ dưới lên (Mobile-first).
- Touch feedback: scale nhỏ lại khi bấm (`active:scale-95`).
- Mọi Sub-page bên trong Admin đều được đồng bộ hoá layout Header (Mũi tên ArrowLeft xám).
