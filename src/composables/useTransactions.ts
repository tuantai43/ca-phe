import { ref, onUnmounted } from "vue";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp, Timestamp, where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  Transaction, TransactionType, ExpenseCategory, TransactionOrderItem, OrderType,
} from "../types";
import { useAuth } from "./useAuth";
import { useAuditLog } from "./useAuditLog";

// ============================================================
// Part 1: Write-only (không cần listener, dùng cho SalesPage & ExpensePage)
// ============================================================
export function useTransactionActions() {
  const { logAction } = useAuditLog();

  async function addTransaction(
    type: TransactionType,
    description: string,
    amount: number,
    category?: ExpenseCategory,
    orderItems?: TransactionOrderItem[],
    orderType?: OrderType,
  ) {
    const data: Record<string, unknown> = {
      type,
      description,
      amount,
      createdAt: serverTimestamp(),
    };
    if (category) data.category = category;
    if (orderItems) data.orderItems = orderItems;
    if (orderType) data.orderType = orderType;
    await addDoc(collection(db, "transactions"), data);
  }

  async function updateTransaction(
    oldTx: Transaction,
    description: string,
    amount: number,
    category?: ExpenseCategory,
    orderItems?: TransactionOrderItem[]
  ) {
    const data: Record<string, unknown> = { description, amount };
    if (category) data.category = category;
    if (orderItems) data.orderItems = orderItems;

    await logAction('UPDATE', 'transactions', oldTx.id, oldTx, { ...oldTx, ...data });
    await updateDoc(doc(db, "transactions", oldTx.id), data);
  }

  async function deleteTransaction(oldTx: Transaction) {
    await logAction('DELETE', 'transactions', oldTx.id, oldTx);
    await deleteDoc(doc(db, "transactions", oldTx.id));
  }

  return { addTransaction, updateTransaction, deleteTransaction };
}

// ============================================================
// Part 2: Query-based reader (dùng cho ReportPage & ExportModal)
// ============================================================

function parseDoc(d: any): Transaction {
  const data = d.data();
  return {
    id: d.id,
    type: data.type,
    description: data.description,
    amount: data.amount,
    category: data.category,
    orderItems: data.orderItems,
    orderType: data.orderType,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : (data.createdAt ?? Date.now()),
  } as Transaction;
}

export function useTransactionQuery() {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  let unsubscribe: (() => void) | null = null;

  function listen(constraints: QueryConstraint[]) {
    stop();

    const { isAdmin, hasRole } = useAuth();
    if (!isAdmin() && !hasRole('view_reports')) return;

    isLoading.value = true;
    const q = query(collection(db, "transactions"), ...constraints);
    unsubscribe = onSnapshot(q, (snapshot) => {
      transactions.value = snapshot.docs.map(parseDoc);
      isLoading.value = false;
    }, () => {
      unsubscribe = null;
      isLoading.value = false;
    });
  }

  function stop() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  // ---- Helper query builders ----

  function listenByDay(date: Date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    listen([
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc'),
    ]);
  }

  function listenByMonth(month: number, year: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    listen([
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc'),
    ]);
  }

  function listenByYear(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    listen([
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc'),
    ]);
  }

  function listenByRange(startDate: Date, endDate: Date) {
    const start = new Date(startDate); start.setHours(0, 0, 0, 0);
    const end = new Date(endDate); end.setHours(23, 59, 59, 999);
    listen([
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc'),
    ]);
  }

  onUnmounted(stop);

  return {
    transactions,
    isLoading,
    listenByDay,
    listenByMonth,
    listenByYear,
    listenByRange,
    stop,
  };
}
