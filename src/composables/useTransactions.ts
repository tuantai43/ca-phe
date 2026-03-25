import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  Transaction, TransactionType, ExpenseCategory, TransactionOrderItem, OrderType,
} from "../types";
import { useAuth } from "./useAuth";
import { useAuditLog } from "./useAuditLog";

const transactions = ref<Transaction[]>([]);
let unsubscribe: (() => void) | null = null;
let listenersCount = 0;

function startListening() {
  listenersCount++;
  if (unsubscribe) return;
  
  const { isAdmin, hasRole } = useAuth();
  if (!isAdmin() && !hasRole('view_reports')) {
    return;
  }

  const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    transactions.value = snapshot.docs.map((d) => {
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
    });
  }, () => {
    unsubscribe = null;
  });
}

function stopListening() {
  listenersCount--;
  if (listenersCount <= 0) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    listenersCount = 0;
  }
}

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function useTransactions() {
  onMounted(startListening);
  onUnmounted(stopListening);
  
  const { logAction } = useAuditLog();

  const todayTransactions = computed(() =>
    transactions.value
      .filter((t) => isToday(t.createdAt))
      .sort((a, b) => b.createdAt - a.createdAt),
  );

  const todayIncome = computed(() =>
    todayTransactions.value
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const todayExpense = computed(() =>
    todayTransactions.value
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const todayProfit = computed(() => todayIncome.value - todayExpense.value);

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

  return {
    allTransactions: transactions,
    transactions: todayTransactions,
    todayIncome,
    todayExpense,
    todayProfit,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
