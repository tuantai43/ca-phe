# Nghiệp vụ: Màn hình Báo cáo

## 1. Mô tả chung

Màn hình tổng hợp doanh thu, chi phí và lợi nhuận theo ngày/tháng/năm.
Hiển thị cảnh báo ngưỡng thuế theo quy định hộ kinh doanh cá thể.

## 2. Chọn khoảng thời gian

- Thanh tab ngang trên đầu: **Hôm nay** | **Tháng này** | **Năm nay**.
- Mặc định chọn "Hôm nay".
- Khi chọn "Tháng này": hiển thị tháng/năm (VD: "Tháng 03/2026").
- Khi chọn "Năm nay": hiển thị năm (VD: "Năm 2026").

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

### 5.1 Khi chọn "Hôm nay"

- Hiển thị số đơn bán hàng trong ngày.
- Hiển thị số khoản chi trong ngày.

### 5.2 Khi chọn "Tháng này"

- Danh sách theo ngày (mới nhất lên đầu), mỗi dòng:
  - Ngày (DD/MM)
  - Thu | Chi | Lợi nhuận
- Chỉ hiện những ngày có giao dịch.

### 5.3 Khi chọn "Năm nay"

- Danh sách 12 tháng, mỗi dòng:
  - Tháng (Tháng 1, Tháng 2, ...)
  - Thu | Chi | Lợi nhuận
- Chỉ hiện những tháng có giao dịch.

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
