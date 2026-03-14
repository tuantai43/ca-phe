# Dự án: Cà Phê Võng Quán (Simple POS Web App)

## 1. Mục tiêu
Xây dựng một ứng dụng web (PWA) quản lý bán hàng cho quán cà phê võng gia đình. 
Yêu cầu cao nhất: Giao diện cực kỳ đơn giản, nút bấm to, rõ ràng, dễ sử dụng cho người lớn tuổi.

## 2. Công nghệ sử dụng
- Framework: Vue 3 (Composition API, <script setup>)
- Build Tool: Vite
- Styling: Tailwind CSS (Ưu tiên các thành phần có độ tương phản cao, font chữ lớn)
- Quản lý dữ liệu: Firebase Firestore hoặc LocalStorage (để chạy offline)

## 3. Chức năng chính (MVP)
### Màn hình Bán hàng (Main):
- Danh sách món dạng thẻ (Card) với nút bấm lớn: Cafe Đen (15k), Cafe Sữa (20k), Nước Ngọt (15k), Thuê Võng (5k/giờ).
- Giỏ hàng đơn giản: Hiển thị danh sách món đã chọn và nút "Xác nhận & Thu tiền" màu xanh lá cây đậm.
- Reset giỏ hàng sau mỗi đơn.

### Màn hình Quản lý Thu/Chi:
- Nút "Nhập Chi": Để nhập các khoản như (Tiền đá, tiền điện, nhập hàng).
- Lưu lịch sử giao dịch (ngày, giờ, số tiền, loại giao dịch).

### Màn hình Báo cáo:
- Tổng thu nhập trong ngày/tháng.
- Hiển thị thông báo trạng thái thuế: "Dưới ngưỡng 500tr/năm - Miễn thuế".

## 4. Nguyên tắc thiết kế (UI/UX)
- Font size mặc định cho các con số: 20px trở lên.
- Nút bấm (Button) phải có chiều cao tối thiểu 60px.
- Màu sắc: Xanh lá (Thu tiền), Đỏ (Chi tiền), Vàng (Cảnh báo).
- Không dùng menu đa tầng, mọi chức năng nằm trong 3 tab chính ở dưới cùng màn hình (Bottom Navigation).
