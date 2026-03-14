# Xuất báo cáo & Xuất lịch sử giao dịch

## 1. Xuất báo cáo (Màn hình Báo cáo)

### Mục đích

- Lưu lại "snapshot" báo cáo tại thời điểm xuất (giữ nguyên số liệu + luật thuế tại thời điểm đó)
- Danh sách báo cáo đã lưu, bấm vào xem chi tiết

### Flow

1. User đang xem báo cáo (Hôm nay / Tháng X / Năm Y)
2. Bấm nút **"📥 Lưu báo cáo"**
3. Hệ thống snapshot toàn bộ số liệu hiện tại → lưu vào `savedReports[]`
4. Phía dưới hiện danh sách **"📂 Báo cáo đã lưu"**
5. Mỗi item: `[icon] Tháng 02/2026 — Lưu lúc 14/03 15:30 [Chi tiết]`
6. Bấm **"Chi tiết"** → mở popup xem lại đầy đủ báo cáo đã lưu

### Dữ liệu SavedReport

```ts
interface SavedReport {
  id: string;
  // Thông tin kỳ báo cáo
  periodType: "today" | "month" | "year";
  periodLabel: string; // "Hôm nay, 14/03/2026" | "Tháng 02/2026" | "Năm 2025"
  // Snapshot số liệu
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  incomeCount: number;
  expenseCount: number;
  // Thuế
  taxYear: number;
  yearlyIncome: number;
  taxThreshold: number;
  taxRate: number;
  estimatedTax: number;
  taxDescription: string;
  taxLegalBasis: string;
  // Breakdown
  breakdown: {
    label: string;
    income: number;
    expense: number;
    profit: number;
  }[];
  // Meta
  createdAt: number; // thời điểm xuất
}
```

### Popup Chi tiết

- Fullscreen popup (z-60)
- Header: tiêu đề kỳ + ngày lưu
- Body: hiển thị lại toàn bộ thông tin báo cáo (summary cards, profit, breakdown, thuế)
- Footer: nút "Đóng" + nút "🗑️ Xoá"

---

## 2. Xuất lịch sử giao dịch CSV (Màn hình Thu/Chi)

### Mục đích

- Xuất danh sách giao dịch theo khoảng thời gian → file CSV
- Dùng để lưu trữ, gửi kế toán, hoặc import vào Excel

### Flow

1. Bấm nút **"📤 Xuất lịch sử"** ở màn hình Thu/Chi
2. Mở popup chọn khoảng thời gian:
   - **Từ ngày**: date picker (← ngày →)
   - **Đến ngày**: date picker (← ngày →)
   - Mặc định: từ đầu tháng hiện tại → hôm nay
   - Preview: "Tìm thấy X giao dịch"
3. Bấm **"Xuất CSV"** → tải file CSV

### Format CSV

```
Ngày,Giờ,Loại,Mô tả,Danh mục,Số tiền
14/03/2026,08:30,Thu,Đơn #1 — Mang đi,,45000
14/03/2026,09:15,Chi,Tiền đá,tien-da,50000
```

- Encoding: UTF-8 with BOM (để Excel mở đúng tiếng Việt)
- Tên file: `thu-chi_{from}_{to}.csv` (ví dụ: `thu-chi_01-03-2026_14-03-2026.csv`)

### Popup xuất CSV

- Popup z-60
- 2 date picker (start/end) dùng nút ← →
- Số giao dịch tìm thấy (real-time)
- Nút "Xuất CSV" (disabled nếu 0 giao dịch)
- Nút "Đóng"

---

## UI Notes

- Nút "Lưu báo cáo" + "Xuất lịch sử": nút lớn min-h-[60px], full width
- Popup: z-60 (trên BottomNav z-50)
- Font size cho người lớn tuổi: text-base trở lên
