# Nghiệp vụ: Màn hình Báo cáo

## 1. Mô tả chung

Màn hình tổng hợp doanh thu, chi phí và lợi nhuận theo ngày/tháng/năm.
Hiển thị cảnh báo ngưỡng thuế theo quy định hộ kinh doanh cá thể.

## 2. Chọn khoảng thời gian

- Thanh tab ngang trên đầu: **Ngày** | **Tháng** | **Năm**.
- Sử dụng cặp Mũi tên (← →) để dịch chuyển Dữ liệu theo dòng thời gian Quá Khứ / Hiện Tại cực chuẩn xác.
- Mặc định chọn "Ngày (Hôm nay)". Mọi dữ liệu (Biểu đồ, Doanh Thu, Danh sách hoá đơn) đều phản ứng trực tiếp với Date Picker (Arrow Slider) ngày mà Kế toán chọn.

## 3. Tổng quan (Summary)

Hiển thị 3 ô lớn:

| Ô         | Màu                  | Nội dung                                  |
| --------- | -------------------- | ----------------------------------------- |
| Tổng thu  | Xanh lá              | Tổng tiền bán hàng trong khoảng thời gian |
| Tổng chi  | Đỏ                   | Tổng tiền chi trong khoảng thời gian      |
| Lợi nhuận | Xanh/Đỏ tuỳ dương/âm | Tổng thu − Tổng chi                       |

- Font số: tối thiểu 24px, in đậm.

## 4. Biểu đồ thống kê

Hiển thị ngay sau phần Tổng quan, áp dụng cho khoảng thời gian đang chọn.

### 4.1 Biểu đồ Thu / Chi

- Dạng thanh ngang (horizontal bar).
- 2 thanh: **Thu** (xanh lá) và **Chi** (đỏ).
- Chiều dài thanh tỉ lệ theo giá trị, kèm số tiền hiển thị.

### 4.2 Biểu đồ Mang đi / Tại võng

- Dạng donut chart (vòng tròn rỗng giữa).
- 2 phần: **Mang đi** (cam) và **Tại võng** (tím).
- Số đơn tổng hiển thị ở giữa donut.
- Chú thích (legend) bên phải: tên + số lượng đơn.

### 4.3 Biểu đồ Món bán chạy

- Dạng thanh ngang, xếp hạng top 5 món.
- Thứ hạng 1 → cam đậm, còn lại nhạt dần.
- Hiển thị tên món + số lượng (ly).

## 5. Thống kê chi tiết

### 5.1 Danh sách Giao Dịch
- Hiển thị toàn bộ các hoá đơn thuộc khoảng Thời gian Đang chọn. (Mới nhất nằm trên cùng).
- Mỗi dòng sẽ phân rõ ràng Nhãn (Thu, Chi) và Ngày giờ chuẩn.

### 5.2 Bút Chì Sửa Đơn 
Kế toán bấm bút chì sẽ rẽ 2 nhánh:
- **Nếu là Đơn Chi**: Gọi `ExpenseModal` để sửa lại Số tiền tổng hoặc lý do.
- **Nếu là Đơn Thu (Khách uống)**: Gọi `EditOrderModal` cao cấp. Bày toàn bộ số lượng ly chi tiết trên Order (VD 2 Cafe sữa, 1 Đen). Kế toán tăng giảm số ly, hệ thống ép nhân tự động lại Đơn giá Góc để ra Tổng tiền mới, không cho nhập tay tuỳ tiện.

*(Tất cả quá trình Sửa/Xoá giao dịch đều sẽ bị Firebase chụp ảnh lại trên `audit_logs`)*

## 6. Cảnh báo thuế

- Hộ kinh doanh cá thể: doanh thu dưới **100 triệu/năm** → miễn thuế GTGT và TNCN.
- Hiển thị ở cuối màn hình, dạng card:
  - **Doanh thu năm**: xx.xxx.xxxđ / 100.000.000đ
  - **Thanh progress bar** hiển thị phần trăm.
  - Nếu < 100tr: 🟢 "Miễn thuế" (xanh lá).
  - Nếu ≥ 100tr: 🟡 "Đã vượt ngưỡng miễn thuế" (vàng cảnh báo).

> **Ghi chú**: README ghi 500tr nhưng theo quy định hiện hành (Luật Quản lý thuế 2019), ngưỡng miễn thuế hộ kinh doanh là 100 triệu/năm. Có thể điều chỉnh sau.

## 7. Quy tắc giao diện

- Font số tiền summary: tối thiểu 24px.
- Tab chọn thời gian: min-h 48px, font rõ ràng.
- Progress bar thuế: chiều cao 12px, bo tròn.
- Màu sắc: xanh lá (thu/miễn thuế), đỏ (chi), vàng (cảnh báo vượt ngưỡng).
