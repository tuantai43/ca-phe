# Nghiệp vụ: Màn hình Quản Trị Hệ Thống (Admin Panel)

## 1. Mô tả chung
Màn hình trung tâm điều khiển (Control Panel) được bảo vệ phân quyền nghiêm ngặt dành riêng cho quản lý hoặc chủ quán.
Admin Panel gom toàn bộ 4 chức năng cốt tử (Bảng giá, Báo cáo, Nhân sự, Lịch sử kiểm toán) vào chung một List Menu duy nhất, tối ưu trải nghiệm Touch trên di động.

## 2. Truy cập & Bảo mật
- Yêu cầu đăng nhập Google (`Firebase Auth`).
- Không có quyền (`Guest`) hoặc chỉ là `Member` thu ngân sẽ bị Router đá văng về `/access-denied` (Màn hình từ chối truy cập).
- Từng Sub-Menu sẽ hiển thị hoặc ẩn đi linh hoạt phụ thuộc vào việc User đang cầm Roles nào (`manage_roles`, `view_reports`, `admin`).

## 3. Các Phân Hệ Quản Trị

### 3.1. Bảng Giá Đề Xuất (Master Data)
- **Truy cập:** Quyền `admin`.
- **Chức năng:** Quản lý giá gốc của toàn bộ menu (Đơn Giá Mang Đi, Đơn Giá Tại Võng) và Khoản Chi Mặc Định.
- **Vận hành:** 
  - Thay vì sửa code cứng, admin ấn biểu tượng Bút Chì bên cạnh giá tiền.
  - Sử dụng chung `PriceEditModal` (Bàn phím Numpad chạm) để thiết lập giá.
  - Sau khi lưu, toàn bộ ứng dụng (kể cả máy của máy thu ngân khác) sẽ update realtime giá niêm yết mới.

### 3.2. Báo Cáo Kế Toán
- **Truy cập:** Quyền `view_reports` (hoặc `admin`).
- **Chức năng:** Trỏ về thẳng màn hình `ReportPage` (Phan hệ hiển thị biểu đồ, thống kê % bán ra, và truy vết Sổ Sách).
- **Lưu ý định tuyến:** Giao diện Sổ Sách đã được thiết kế lại Header chứa chuẩn Mũi Tên Trở Về `ArrowLeft` để trả Kế Toán về lại Admin Panel an toàn.

### 3.3. Phân Quyền Nhân Sự
- **Truy cập:** Quyền `manage_roles` (hoặc `admin`).
- **Chức năng:** Quét danh sách mọi cá nhân từng dùng Google đăng nhập vào hệ thống.
- **Thao tác:** Gán hoặc tước các thẻ quyền: Quyền Bán Hàng (`member`), Quyền Sổ Sách (`view_reports`), Quyền Hệ Thống (`manage_roles`). Riêng thẻ `admin` tối cao không thể bị sửa bởi người thường.

### 3.4. Nhật Ký Thao Tác (Audit Logger)
- **Truy cập:** Quyền tối cao `admin`.
- **Chức năng:** Camera an ninh của hệ thống cơ sở dữ liệu.
- **Cơ chế ghi log:** Mọi hành vi Ấn Nút Xoá Bill thẻ đỏ (DELETE), Ấn Nút Sửa Giá thẻ Cam (UPDATE) của Kế Toán Viên tại hàm `useTransactions` sẽ tự động trigger 1 bản ghi ngầm xuống CSDL.
- **Hiển thị (Visual Diffing):** Hiển thị màn hình so sánh trực quan (Timeline). Đặt Dữ Liệu Cũ và Dữ Liệu Mới nằm cạnh nhau nhằm tố giác các hành vi nhập sai, sửa lách tiền, hoặc xoá bill trái luật. Ghi rõ tên tài khoản Gmail tác động.

## 4. Nút Đăng Xuất (Sign Out)
Nằm dưới cùng của Cụm Admin. Hiển thị Rõ Hình Ảnh Avatar Google, Tên và Email để Kế Toán / Nhân viên xác nhận lại thân phận ca làm việc trước khi bấm Đăng Xuất (`signInWithRedirect`). Hệ thống sẽ thu lại tất cả các trạm Lắng Nghe Realtime (`onSnapshot`) tránh lỗi Permission Denied.
