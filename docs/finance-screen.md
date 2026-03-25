# Nghiệp vụ: Màn hình Thu/Chi

## 1. Mô tả chung

Màn hình quản lý dòng tiền:

- **Tiền thu**: tự động ghi khi bấm "Xác nhận & Thu tiền" ở màn Bán hàng.
- **Tiền chi**: nhập thủ công các khoản mua nguyên liệu, vật tư.

Chi phí ghi vào **ngày thực tế mua** (không phân bổ theo ngày sử dụng). Báo cáo tháng sẽ tự cân bằng.

## 2. Tổng quan ngày (Summary)

- Hiển thị trên đầu màn hình, gồm 2 ô:
  - **Tổng thu** (xanh lá): tổng tiền bán hàng trong ngày.
  - **Tổng chi** (đỏ): tổng tiền các khoản chi trong ngày.
- Bên dưới: **Lợi nhuận** = Tổng thu − Tổng chi.
- Ngày hiện tại hiển thị rõ ràng ở header (ví dụ: "Hôm nay, 14/03/2026").

## 3. Nút thao tác

- Nút **"+ Nhập khoản chi"** — màu đỏ, chiều cao tối thiểu 60px.
- Khi bấm → mở popup nhập chi.

## 4. Popup nhập khoản chi

### 4.1 Chọn danh mục (Có giá động)

Danh mục Thu/Chi hiện tại (như Tiền đá, Tiền mía...) cùng với giá mặc định không còn bị hard-code. Toàn bộ danh mục này được thiết lập tại trang Admin thông qua `useMasterData`. Bấm danh mục → tự điền mô tả + lấy giá tự động. Người dùng có thể sửa lại giá tùy ý.

### 4.2 Mô tả

- Text input, placeholder "VD: Tiền đá, tiền điện...".
- Tự điền khi chọn danh mục, có thể sửa.

### 4.3 Nhập số tiền (Bàn phím tự tạo)

Không dùng bàn phím hệ thống. Tự tạo bàn phím gồm:

- Ô hiển thị số tiền phía trên (font lớn, đơn vị: đồng).
- Các nút số: **1, 2, 3, 4, 5, 6, 7, 8, 9, 000, 0, ⌫**
  - `000`: nhập nhanh 3 số 0.
  - `⌫`: xoá 1 ký tự cuối.
- Nút **"Xoá hết"**: reset số tiền về 0.
- Layout: grid 4 cột × 3 hàng + hàng nút xoá hết.
- Kích thước nút: tối thiểu 60px chiều cao, font to, dễ bấm.

### 4.4 Xác nhận

- Nút **"Lưu khoản chi"** — màu đỏ, min-h 60px.
- Khi bấm:
  1. Validate: mô tả không rỗng, số tiền > 0.
  2. Lưu khoản chi vào danh sách.
  3. Đóng popup, cập nhật tổng chi.

## 5. Lịch sử giao dịch

- Danh sách dọc, sắp xếp theo giờ (mới nhất lên đầu).
- Mỗi dòng hiển thị:
  - **Dòng chính**: `🟢/🔴 HH:mm Mô tả` và số tiền bên phải.
    - Ví dụ: `🟢 20:00 Đơn Mang đi     +15.000đ`
    - Ví dụ: `🔴 08:30 Tiền đá          −30.000đ`
  - **Dòng phụ** (nếu là đơn thu có danh sách món): liệt kê các món bên dưới.
    - Ví dụ:
      ```
      🟢 20:00 Đơn Mang đi       +30.000đ
         • Cà Phê Đen ×2
         • Nước Cam ×1
      ```
  - **Nút sửa/xoá**: chỉ hiện cho khoản chi.
- Khi danh sách rỗng: hiển thị "Chưa có giao dịch nào".

## 6. Quy tắc giao diện

- Font số tiền: tối thiểu 20px.
- Nút bấm: chiều cao tối thiểu 60px.
- Bàn phím số: nút tối thiểu 60px, font lớn.
- Màu sắc: xanh lá (thu), đỏ (chi).
- Số tiền thu: màu xanh, prefix "+". Số tiền chi: màu đỏ, prefix "−".
