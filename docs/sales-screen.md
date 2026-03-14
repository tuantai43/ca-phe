# Nghiệp vụ: Màn hình Bán hàng

## 1. Mô tả chung

Màn hình chính của ứng dụng, dùng để tạo đơn hàng và thu tiền khách.
Hỗ trợ nhiều đơn hàng mở cùng lúc (quản lý theo số võng).

## 2. Loại khách & Quản lý đơn

### 2.1 Hai loại khách

- **Khách mang đi**: Không gán võng, tạo đơn nhanh, thanh toán ngay.
- **Khách nằm võng**: Gán 1 hoặc nhiều võng cho đơn, có thể thanh toán sau.

### 2.2 Quản lý đơn hàng (trên đầu màn hình)

- Thanh ngang cuộn được, gồm: nút **"+ Đơn mới"** + danh sách các đơn đang mở.
- Mỗi đơn mở hiển thị dạng tab: **tên đơn** + tổng tiền nhỏ.
- Tên đơn:
  - Khách mang đi: "Mang đi #1", "Mang đi #2", ...
  - Khách nằm võng: "Võng 2, 3" (ghép số các võng đã chọn).
- Trạng thái tab:
  - **Trắng/xám**: đơn chưa có món.
  - **Cam/vàng**: đơn đang có món chưa thanh toán.
  - **Viền đậm**: đơn đang được chọn (active).
- Bấm vào tab → hiển thị đơn hàng đó bên dưới.

### 2.3 Tạo đơn mới

- Bấm **"+ Đơn mới"** → hiện popup chọn loại:
  - **🛍️ Mang đi**: tạo đơn ngay, không cần chọn võng.
  - **🛏️ Nằm võng**: hiện danh sách võng (Võng 1 → N), chọn 1 hoặc nhiều võng → tạo đơn.
- Võng đã được gán cho đơn khác → hiển thị disabled (xám), không cho chọn.
- Sau khi tạo → tự động chuyển sang tab đơn vừa tạo.

## 3. Danh sách món (Menu)

| ID        | Tên món    | Giá mang đi | Giá tại võng | Icon (SVG)  |
| --------- | ---------- | ----------- | ------------ | ----------- |
| cafe-den  | Cà Phê Đen | 15.000đ     | 20.000đ      | ☕ ly đen   |
| cafe-sua  | Cà Phê Sữa | 15.000đ     | 20.000đ      | ☕ ly sữa   |
| nuoc-ngot | Nước Ngọt  | 15.000đ     | 20.000đ      | 🥤 lon đỏ   |
| nuoc-cam  | Nước Cam   | 15.000đ     | 20.000đ      | 🍊 quả cam  |
| nuoc-dua  | Nước Dừa   | 15.000đ     | 20.000đ      | 🥥 trái dừa |
| tra-tac   | Trà Tắc    | 10.000đ     | 15.000đ      | 🍋 ly chanh |
| rau-ma    | Rau Má     | 15.000đ     | 20.000đ      | 🌿 ly xanh  |
| nuoc-mia  | Nước Mía   | 10.000đ     | 15.000đ      | 🎋 ly mía   |

> **Ghi chú**: Icon hiển thị bằng SVG tự vẽ (component MenuIcon), không dùng emoji. Mỗi món có hình vẽ riêng biệt, dễ nhận dạng.

- Hiển thị dạng grid 2 cột.
- Mỗi món là 1 thẻ (card) có: icon, tên món, giá.
- Bấm vào thẻ → thêm món vào đơn hàng đang chọn.
- Giá hiển thị dạng rút gọn trên thẻ (15k, 20k).

## 4. Đơn hàng (Order)

### 4.1 Trạng thái rỗng

- Hiển thị text "Chưa chọn món nào".

### 4.2 Khi có món

Mỗi dòng sản phẩm gồm (từ trái sang phải):

```
[Icon] [Tên món]        [−] [số lượng] [+]   [✕]
                         bộ control           xoá dòng
```

- **Bộ control số lượng**: nút trừ `−` | số lượng | nút cộng `+`.
- **Nút ✕** (bên phải bộ control): xoá dòng đó khỏi đơn hàng (bất kể số lượng).
- Bấm thẻ món nhiều lần → tăng số lượng (quantity + 1), không tạo dòng mới.
- Bấm `−` khi quantity = 1 → xoá dòng đó.
- Nút "Xoá hết" (góc phải header đơn hàng) → xoá toàn bộ đơn hàng.

### 4.3 Tổng cộng

- Dòng tổng cộng hiển thị: Tổng = Σ (giá × số lượng) của tất cả dòng.
- Định dạng tiền: `xx.xxxđ` (dấu chấm phân cách hàng nghìn, hậu tố "đ").

## 5. Xác nhận & Thanh toán

- Nút "✅ Xác nhận & Thu tiền" — màu xanh lá đậm, chiều cao tối thiểu 60px.
- Chỉ hiện khi đơn hàng có ít nhất 1 món.
- Khi bấm:
  1. Hiển thị thông báo xác nhận tổng tiền đã thu.
  2. Xoá đơn hàng (reset võng về trạng thái trống).
  3. _(TODO)_ Lưu giao dịch vào lịch sử với: ngày giờ, loại khách (mang đi/võng số mấy), danh sách món, tổng tiền.

## 6. Quy tắc giao diện

- Font số: tối thiểu 20px.
- Nút bấm: chiều cao tối thiểu 60px.
- Thẻ món: chiều cao tối thiểu 120px.
- Nút control (cộng/trừ): tối thiểu 40×40px, dễ bấm.
- Màu sắc: xanh lá (thu tiền), đỏ (xoá/chi), cam/vàng (võng có đơn, highlight tổng).
- Touch feedback: scale nhỏ lại khi bấm (active:scale-95).
