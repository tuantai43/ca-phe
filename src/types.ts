export type OrderType = "takeaway" | "hammock";

export interface MenuItem {
  id: string;
  name: string;
  priceTakeaway: number;
  priceHammock: number;
  icon: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  type: OrderType;
  hammocks: number[]; // số võng (rỗng nếu mang đi)
  items: CartItem[];
  createdAt: number;
}

// Thu/Chi
export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "tien-da"
  | "tien-mia"
  | "tien-rau-ma"
  | "tien-tac"
  | "tien-cam"
  | "tien-dua"
  | "tien-ly"
  | "ong-hut"
  | "bich"
  | "tien-dien"
  | "khac";

export interface TransactionOrderItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // luôn dương
  category?: ExpenseCategory;
  orderItems?: TransactionOrderItem[];
  orderType?: OrderType;
  createdAt: number;
}

// Báo cáo đã lưu
export interface SavedReportBreakdown {
  label: string;
  income: number;
  expense: number;
  profit: number;
}

export interface SavedReport {
  id: string;
  periodType: "day" | "month" | "year";
  periodLabel: string;
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  incomeCount: number;
  expenseCount: number;
  taxYear: number;
  yearlyIncome: number;
  taxThreshold: number;
  taxRate: number;
  estimatedTax: number;
  taxDescription: string;
  taxLegalBasis: string;
  breakdown: SavedReportBreakdown[];
  createdAt: number;
}
