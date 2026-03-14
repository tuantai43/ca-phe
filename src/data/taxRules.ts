/**
 * Bảng thuế hộ kinh doanh (F&B — dịch vụ có gắn hàng hoá) theo luật VN.
 * Mỗi entry áp dụng từ `fromYear` trở đi cho đến khi có entry mới.
 * Khi luật thay đổi → thêm 1 dòng mới, không cần migrate data.
 */
export interface TaxRule {
  fromYear: number;
  /** Ngưỡng doanh thu miễn thuế (VND/năm) */
  threshold: number;
  /** Thuế suất tổng trên phần DT vượt ngưỡng (GTGT + TNCN hoặc TNCN tổng hợp) */
  taxRate: number;
  /** Mô tả để hiển thị */
  description: string;
  /** Căn cứ pháp lý */
  legalBasis: string;
  /** Khai thuế theo kỳ */
  filingPeriod: "quarter" | "month" | "year";
}

export const TAX_RULES: TaxRule[] = [
  {
    fromYear: 2021,
    threshold: 100_000_000,
    taxRate: 0.015, // 1% GTGT + 0.5% TNCN
    description:
      "Thuế khoán: miễn thuế nếu DT ≤ 100 triệu/năm, trên ngưỡng nộp 1.5%",
    legalBasis: "Thông tư 40/2021/TT-BTC",
    filingPeriod: "year",
  },
  {
    fromYear: 2026,
    threshold: 500_000_000,
    taxRate: 0.015, // 1.5% cho dịch vụ gắn hàng hoá (mục d, khoản 3, Điều 7 Luật TNCN 109)
    description:
      "Tự khai tự nộp: miễn thuế nếu DT ≤ 500 triệu/năm, trên ngưỡng nộp 1.5%",
    legalBasis: "Nghị định 68/2026/NĐ-CP, Luật TNCN 109/2025/QH15",
    filingPeriod: "quarter",
  },
];

/**
 * Lấy rule thuế cho 1 năm cụ thể.
 * Trả về rule có fromYear lớn nhất mà <= year.
 * Nếu năm quá cũ (trước rule đầu tiên) → trả về null.
 */
export function getTaxRule(year: number): TaxRule | null {
  const sorted = [...TAX_RULES].sort((a, b) => b.fromYear - a.fromYear);
  for (const rule of sorted) {
    if (year >= rule.fromYear) return rule;
  }
  return null;
}

/**
 * Tính thuế ước tính cho doanh thu năm.
 * Chỉ tính trên phần vượt ngưỡng.
 */
export function estimateTax(yearlyRevenue: number, rule: TaxRule): number {
  if (yearlyRevenue <= rule.threshold) return 0;
  return (yearlyRevenue - rule.threshold) * rule.taxRate;
}
