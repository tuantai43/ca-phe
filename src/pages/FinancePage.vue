<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExpenseCategory, Transaction } from '../types'
import { useTransactions } from '../composables/useTransactions'
import ExpenseModal from '../components/ExpenseModal.vue'
import ExportHistoryModal from '../components/ExportHistoryModal.vue'

const { allTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions()

// Date navigation
const selectedDate = ref(new Date())

function sameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate()
}

const isViewingToday = computed(() => sameDay(selectedDate.value, new Date()))

function prevDay() {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 1)
  selectedDate.value = d
}
function nextDay() {
  if (isViewingToday.value) return
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 1)
  selectedDate.value = d
}
function goToToday() {
  selectedDate.value = new Date()
}

// Filtered transactions for selected date
const filteredTransactions = computed(() =>
  allTransactions.value
    .filter(t => sameDay(new Date(t.createdAt), selectedDate.value))
    .sort((a, b) => b.createdAt - a.createdAt)
)

const dayIncome = computed(() =>
  filteredTransactions.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
)
const dayExpense = computed(() =>
  filteredTransactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
)
const dayProfit = computed(() => dayIncome.value - dayExpense.value)

const showExpenseModal = ref(false)
const showExportModal = ref(false)
const editingTx = ref<Transaction | null>(null)

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function dateLabel(): string {
  if (isViewingToday.value) {
    return 'Hôm nay, ' + selectedDate.value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const wd = weekdays[selectedDate.value.getDay()]
  return wd + ', ' + selectedDate.value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function saveExpense(description: string, amount: number, category: ExpenseCategory) {
  addTransaction('expense', description, amount, category)
  showExpenseModal.value = false
}

function openEdit(tx: Transaction) {
  editingTx.value = tx
  showExpenseModal.value = true
}

function handleUpdate(id: string, description: string, amount: number, category: ExpenseCategory) {
  updateTransaction(id, description, amount, category)
  editingTx.value = null
  showExpenseModal.value = false
}

function handleDelete(tx: Transaction) {
  if (confirm(`Xoá khoản chi "${tx.description}"?`)) {
    deleteTransaction(tx.id)
  }
}

function closeModal() {
  showExpenseModal.value = false
  editingTx.value = null
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 pb-8">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-gray-800">💰 Thu/Chi</h1>

    <!-- Date navigation -->
    <div class="flex items-center justify-between gap-2">
      <button
        @click="prevDay"
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100"
      >←</button>
      <button
        @click="goToToday"
        class="flex-1 rounded-xl border-2 py-3 text-center text-base font-semibold"
        :class="isViewingToday
          ? 'border-amber-500 bg-amber-50 text-amber-800'
          : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'"
      >
        {{ dateLabel() }}
      </button>
      <button
        @click="nextDay"
        :disabled="isViewingToday"
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100"
        :class="isViewingToday ? 'text-gray-300' : 'text-gray-600'"
      >→</button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
        <div class="text-sm font-medium text-green-700">Tổng thu</div>
        <div class="text-2xl font-bold text-green-700 mt-1">+{{ formatMoney(dayIncome) }}</div>
      </div>
      <div class="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
        <div class="text-sm font-medium text-red-700">Tổng chi</div>
        <div class="text-2xl font-bold text-red-700 mt-1">−{{ formatMoney(dayExpense) }}</div>
      </div>
    </div>

    <!-- Profit -->
    <div class="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex items-center justify-between">
      <span class="text-lg font-bold text-gray-800">Lợi nhuận</span>
      <span class="text-2xl font-bold" :class="dayProfit >= 0 ? 'text-green-700' : 'text-red-700'">
        {{ dayProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(dayProfit)) }}
      </span>
    </div>

    <!-- Add expense button -->
    <div class="flex gap-3">
      <button
        @click="showExpenseModal = true"
        class="flex-1 rounded-2xl bg-red-600 py-4 text-lg font-bold text-white shadow-lg active:bg-red-700 min-h-[60px]"
      >
        + Nhập khoản chi
      </button>
      <button
        @click="showExportModal = true"
        class="rounded-2xl bg-gray-100 px-5 py-4 text-lg font-bold text-gray-700 shadow-sm active:bg-gray-200 min-h-[60px] border-2 border-gray-200"
      >
        📤
      </button>
    </div>

    <!-- Divider -->
    <hr class="border-gray-200" />

    <!-- Transaction history -->
    <h2 class="text-lg font-bold text-gray-800">📋 Lịch sử {{ isViewingToday ? 'hôm nay' : dateLabel() }}</h2>

    <div v-if="filteredTransactions.length === 0" class="py-8 text-center text-gray-400 text-lg">
      Chưa có giao dịch nào
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="rounded-xl bg-white px-4 py-3 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ tx.type === 'income' ? '🟢' : '🔴' }}</span>
            <span class="font-semibold text-gray-800">{{ formatTime(tx.createdAt) }} | {{ tx.description }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-xl font-bold"
              :class="tx.type === 'income' ? 'text-green-700' : 'text-red-600'"
            >
              {{ tx.type === 'income' ? '+' : '−' }}{{ formatMoney(tx.amount) }}
            </span>
            <div v-if="tx.type === 'expense'" class="flex items-center gap-1 ml-2">
              <button
                @click="openEdit(tx)"
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-base active:bg-gray-200"
              >✏️</button>
              <button
                @click="handleDelete(tx)"
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-base active:bg-red-100"
              >🗑️</button>
            </div>
          </div>
        </div>
        <!-- Order items -->
        <div v-if="tx.orderItems && tx.orderItems.length > 0" class="ml-11 mt-1 flex flex-col gap-0.5">
          <div v-for="(oi, idx) in tx.orderItems" :key="idx" class="text-sm text-gray-500">
            • {{ oi.name }} ×{{ oi.quantity }}
          </div>
        </div>
      </div>
    </div>

    <!-- Expense modal -->
    <ExpenseModal
      v-if="showExpenseModal"
      :edit-id="editingTx?.id"
      :edit-description="editingTx?.description"
      :edit-amount="editingTx?.amount"
      :edit-category="editingTx?.category"
      @save="saveExpense"
      @update="handleUpdate"
      @close="closeModal"
    />

    <!-- Export modal -->
    <ExportHistoryModal
      v-if="showExportModal"
      @close="showExportModal = false"
    />
  </div>
</template>
