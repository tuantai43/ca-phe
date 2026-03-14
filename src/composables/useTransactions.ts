import { ref, computed, onMounted } from "vue";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  Transaction,
  TransactionType,
  ExpenseCategory,
  TransactionOrderItem,
  OrderType,
} from "../types";

const transactions = ref<Transaction[]>([]);
let unsubscribe: (() => void) | null = null;

function startListening() {
  if (unsubscribe) return;
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
  });
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
    id: string,
    description: string,
    amount: number,
    category?: ExpenseCategory,
  ) {
    const data: Record<string, unknown> = { description, amount };
    if (category) data.category = category;
    await updateDoc(doc(db, "transactions", id), data);
  }

  async function deleteTransaction(id: string) {
    await deleteDoc(doc(db, "transactions", id));
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
