<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTransactions } from '../composables/useTransactions'
import { useSavedReports } from '../composables/useSavedReports'
import { getTaxRule, estimateTax } from '../data/taxRules'
import type { SavedReport, Transaction, ExpenseCategory, TransactionOrderItem } from '../types'
import ReportDetailModal from '../components/ReportDetailModal.vue'
import StatsCharts from '../components/StatsCharts.vue'
import ExpenseModal from '../components/ExpenseModal.vue'
import EditOrderModal from '../components/EditOrderModal.vue'
import ExportHistoryModal from '../components/ExportHistoryModal.vue'
import { 
  BarChart3, CalendarDays, Download, AlertTriangle, AlertCircle, 
  CheckCircle2, Banknote, FolderOpen, ClipboardList, 
  Upload, ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, ArrowLeft
} from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
const { allTransactions, updateTransaction, deleteTransaction } = useTransactions()
const { hasRole } = useAuth()
const router = useRouter()

type Period = 'day' | 'month' | 'year'
const period = ref<Period>('day')
const viewMode = ref<'history' | 'stats'>('history')

const now = new Date()
const selectedDate = ref(new Date())
const selectedMonth = ref(now.getMonth())
const selectedYear = ref(now.getFullYear())

watch(period, () => {
  selectedDate.value = new Date()
  selectedMonth.value = now.getMonth()
  selectedYear.value = now.getFullYear()
})

// Month navigation
function prevMonth() {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11
    selectedYear.value--
  } else {
    selectedMonth.value--
  }
}
function nextMonth() {
  if (selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth()) return
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0
    selectedYear.value++
  } else {
    selectedMonth.value++
  }
}

// Year navigation
function prevYear() { selectedYear.value-- }
function nextYear() {
  if (selectedYear.value >= now.getFullYear()) return
  selectedYear.value++
}

// Day navigation
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
const isViewingToday = computed(() => {
  const d = selectedDate.value
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
})

const canNextMonth = computed(() =>
  !(selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth())
)
const canNextYear = computed(() => selectedYear.value < now.getFullYear())

// Filters
function isSelectedDay(ts: number) {
  const d = new Date(ts)
  const sel = selectedDate.value
  return d.getFullYear() === sel.getFullYear()
    && d.getMonth() === sel.getMonth()
    && d.getDate() === sel.getDate()
}
function isSelectedMonth(ts: number) {
  const d = new Date(ts)
  return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
}
function isSelectedYear(ts: number) {
  return new Date(ts).getFullYear() === selectedYear.value
}

const filtered = computed(() => {
  const filter = period.value === 'day' ? isSelectedDay
    : period.value === 'month' ? isSelectedMonth
    : isSelectedYear
  return allTransactions.value.filter(t => filter(t.createdAt))
})

const totalIncome = computed(() =>
  filtered.value.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
)
const totalExpense = computed(() =>
  filtered.value.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
)
const totalProfit = computed(() => totalIncome.value - totalExpense.value)

const incomeCount = computed(() => filtered.value.filter(t => t.type === 'income').length)
const expenseCount = computed(() => filtered.value.filter(t => t.type === 'expense').length)

// Tax for the displayed year
const taxYear = computed(() => {
  if (period.value === 'year') return selectedYear.value
  if (period.value === 'month') return selectedYear.value
  return now.getFullYear()
})
const taxRule = computed(() => getTaxRule(taxYear.value))
const yearlyIncome = computed(() =>
  allTransactions.value
    .filter(t => new Date(t.createdAt).getFullYear() === taxYear.value && t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
)
const taxThreshold = computed(() => taxRule.value?.threshold ?? 500_000_000)
const taxPercent = computed(() => Math.min((yearlyIncome.value / taxThreshold.value) * 100, 100))
const estimatedTax = computed(() => {
  if (!taxRule.value) return 0
  return Math.round(estimateTax(yearlyIncome.value, taxRule.value))
})

// Daily breakdown for month view
interface DaySummary { label: string; income: number; expense: number; profit: number }
const dailyBreakdown = computed<DaySummary[]>(() => {
  if (period.value !== 'month') return []
  const map = new Map<string, DaySummary>()
  for (const t of filtered.value) {
    const d = new Date(t.createdAt)
    const key = `${d.getDate()}/${d.getMonth() + 1}`
    if (!map.has(key)) map.set(key, { label: key, income: 0, expense: 0, profit: 0 })
    const s = map.get(key)!
    if (t.type === 'income') s.income += t.amount
    else s.expense += t.amount
    s.profit = s.income - s.expense
  }
  return [...map.values()].sort((a, b) => {
    const [ad, am] = a.label.split('/').map(Number)
    const [bd, bm] = b.label.split('/').map(Number)
    return bm - am || bd - ad
  })
})

// Monthly breakdown for year view
interface MonthSummary { label: string; month: number; income: number; expense: number; profit: number }
const monthlyBreakdown = computed<MonthSummary[]>(() => {
  if (period.value !== 'year') return []
  const map = new Map<number, MonthSummary>()
  for (const t of filtered.value) {
    const m = new Date(t.createdAt).getMonth()
    if (!map.has(m)) map.set(m, { label: 'Tháng ' + (m + 1), month: m, income: 0, expense: 0, profit: 0 })
    const s = map.get(m)!
    if (t.type === 'income') s.income += t.amount
    else s.expense += t.amount
    s.profit = s.income - s.expense
  }
  return [...map.values()].sort((a, b) => b.month - a.month)
})

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function periodLabel(): string {
  if (period.value === 'day') {
    if (isViewingToday.value) {
      return 'Hôm nay, ' + selectedDate.value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return selectedDate.value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  if (period.value === 'month') {
    return 'Tháng ' + String(selectedMonth.value + 1).padStart(2, '0') + '/' + selectedYear.value
  }
  return 'Năm ' + selectedYear.value
}

const tabs: { id: Period; label: string }[] = [
  { id: 'day', label: 'Ngày' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' },
]

// --- HISTORY MODALS & ACTIONS ---
const showExpenseModal = ref(false)
const showEditOrderModal = ref(false)
const showExportModal = ref(false)
const editingTx = ref<Transaction | null>(null)

function openEdit(tx: Transaction) {
  editingTx.value = tx
  if (tx.type === 'income') {
    showEditOrderModal.value = true
  } else {
    showExpenseModal.value = true
  }
}

function handleUpdateExpense(_id: string, description: string, amount: number, category: ExpenseCategory) {
  if (editingTx.value) {
    updateTransaction(editingTx.value, description, amount, category)
  }
  editingTx.value = null
  showExpenseModal.value = false
}

function handleUpdateOrder(_id: string, description: string, amount: number, items: TransactionOrderItem[]) {
  if (editingTx.value) {
    updateTransaction(editingTx.value, description, amount, undefined, items)
  }
  editingTx.value = null
  showEditOrderModal.value = false
}

function handleDelete(tx: Transaction) {
  if (confirm(`Xoá giao dịch "${tx.description}"?`)) {
    deleteTransaction(tx)
  }
}

function closeModal() {
  showExpenseModal.value = false
  showEditOrderModal.value = false
  editingTx.value = null
}

// --- SAVED REPORTS ---
const { reports: savedReports, addReport, deleteReport } = useSavedReports()
const viewingReport = ref<SavedReport | null>(null)

function saveCurrentReport() {
  addReport({
    periodType: period.value,
    periodLabel: periodLabel(),
    totalIncome: totalIncome.value,
    totalExpense: totalExpense.value,
    totalProfit: totalProfit.value,
    incomeCount: incomeCount.value,
    expenseCount: expenseCount.value,
    taxYear: taxYear.value,
    yearlyIncome: yearlyIncome.value,
    taxThreshold: taxThreshold.value,
    taxRate: taxRule.value?.taxRate ?? 0,
    estimatedTax: estimatedTax.value,
    taxDescription: taxRule.value?.description ?? '',
    taxLegalBasis: taxRule.value?.legalBasis ?? '',
    breakdown: period.value === 'month'
      ? dailyBreakdown.value
      : period.value === 'year'
        ? monthlyBreakdown.value
        : [],
  })
}

function handleDeleteReport(id: string) {
  deleteReport(id)
  viewingReport.value = null
}

function formatReportDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    + ' ' + d.getHours().toString().padStart(2, '0')
    + ':' + d.getMinutes().toString().padStart(2, '0')
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 pb-20 max-w-3xl mx-auto">
    <div class="flex items-center gap-3 mb-2">
      <button @click="router.push('/admin')" title="Quay lại" class="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div class="flex items-center gap-2">
        <BarChart3 class="w-7 h-7 text-amber-600" />
        <h1 class="text-2xl font-bold text-gray-800">Sổ Sách & Thống Kê</h1>
      </div>
    </div>

    <!-- Period tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="period = tab.id"
        class="flex-1 rounded-xl border-2 py-3 text-center text-sm sm:text-base font-semibold transition-colors"
        :class="period === tab.id
          ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 active:bg-gray-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Period navigation -->
    <div v-if="period === 'day'" class="flex items-center justify-between gap-2">
      <button @click="prevDay" title="Ngày trước" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100">←</button>
      <span class="text-lg font-bold text-gray-800">{{ periodLabel() }}</span>
      <button @click="nextDay" title="Ngày sau" :disabled="isViewingToday" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100" :class="!isViewingToday ? 'text-gray-600' : 'text-gray-300'">→</button>
    </div>
    <div v-else-if="period === 'month'" class="flex items-center justify-between gap-2">
      <button @click="prevMonth" title="Tháng trước" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100">←</button>
      <span class="text-lg font-bold text-gray-800">{{ periodLabel() }}</span>
      <button @click="nextMonth" title="Tháng sau" :disabled="!canNextMonth" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100" :class="canNextMonth ? 'text-gray-600' : 'text-gray-300'">→</button>
    </div>
    <div v-else class="flex items-center justify-between gap-2">
      <button @click="prevYear" title="Năm trước" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100">←</button>
      <span class="text-lg font-bold text-gray-800">{{ periodLabel() }}</span>
      <button @click="nextYear" title="Năm sau" :disabled="!canNextYear" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100" :class="canNextYear ? 'text-gray-600' : 'text-gray-300'">→</button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
        <div class="text-sm font-medium text-green-700">Tổng thu</div>
        <div class="text-xl sm:text-2xl font-bold text-green-700 mt-1">+{{ formatMoney(totalIncome) }}</div>
      </div>
      <div class="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
        <div class="text-sm font-medium text-red-700">Tổng chi</div>
        <div class="text-xl sm:text-2xl font-bold text-red-700 mt-1">−{{ formatMoney(totalExpense) }}</div>
      </div>
    </div>

    <!-- Profit -->
    <div class="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex items-center justify-between">
      <span class="text-lg font-bold text-gray-800">Lợi nhuận</span>
      <span class="text-2xl font-bold" :class="totalProfit >= 0 ? 'text-green-700' : 'text-red-700'">
        {{ totalProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(totalProfit)) }}
      </span>
    </div>

    <!-- View Mode Toggle -->
    <div class="flex gap-1 mt-2 bg-gray-100 p-1 rounded-xl">
      <button @click="viewMode = 'history'" class="flex-1 py-3 text-sm font-bold rounded-lg transition-colors shadow-sm" :class="viewMode === 'history' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'">Lịch sử giao dịch</button>
      <button @click="viewMode = 'stats'" class="flex-1 py-3 text-sm font-bold rounded-lg transition-colors shadow-sm" :class="viewMode === 'stats' ? 'bg-white text-gray-800' : 'text-gray-500 hover:text-gray-700'">Biểu đồ Phân tích</button>
    </div>

    <!-- ==================== TAB 1: HISTORY ==================== -->
    <template v-if="viewMode === 'history'">
      <div class="flex items-center justify-between mb-1 mt-2">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><ClipboardList class="w-5 h-5 text-gray-500" /> Dòng thời gian</h2>
        <button
          v-if="hasRole('manage_reports')"
          @click="showExportModal = true"
          title="Xuất dữ liệu Excel"
          class="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 shadow-sm active:bg-gray-200 border border-gray-200 gap-2"
        >
          <Upload class="w-4 h-4" /> Xuất Excel
        </button>
      </div>

      <div v-if="filtered.length === 0" class="py-8 text-center text-gray-400 text-lg">
        Chưa có giao dịch nào
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="tx in filtered"
          :key="tx.id"
          class="rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-100"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <ArrowUpCircle v-if="tx.type === 'income'" class="w-6 h-6 text-green-600 shrink-0" />
              <ArrowDownCircle v-else class="w-6 h-6 text-red-500 shrink-0" />
              <div class="flex flex-col">
                <span class="font-semibold text-gray-800 text-sm sm:text-base">{{ tx.description }}</span>
                <span class="text-xs font-medium text-gray-400">{{ formatTime(tx.createdAt) }} — {{ new Date(tx.createdAt).toLocaleDateString('vi-VN') }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="text-lg font-bold"
                :class="tx.type === 'income' ? 'text-green-700' : 'text-red-600'"
              >
                {{ tx.type === 'income' ? '+' : '−' }}{{ formatMoney(tx.amount) }}
              </span>
              <div class="flex items-center gap-1 ml-2">
                <button
                  v-if="hasRole('edit_orders')"
                  @click="openEdit(tx)"
                  title="Chỉnh sửa giao dịch"
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-base active:bg-gray-200"
                ><Pencil class="w-4 h-4 text-gray-600" /></button>
                <button
                  v-if="hasRole('edit_orders')"
                  @click="handleDelete(tx)"
                  title="Cảnh báo: Xoá giao dịch"
                  class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-base active:bg-red-100"
                ><Trash2 class="w-4 h-4 text-red-600" /></button>
              </div>
            </div>
          </div>
          <!-- Order items -->
          <div v-if="tx.orderItems && tx.orderItems.length > 0" class="ml-9 mt-2 flex flex-col gap-1">
            <div v-for="(oi, idx) in tx.orderItems" :key="idx" class="text-sm font-medium text-gray-500 bg-gray-50 rounded-md px-2 py-1 inline-flex w-fit items-center flex-wrap">
              {{ oi.name }} <span class="text-amber-600 mx-1">×{{ oi.quantity }}</span>
              <span v-if="oi.price" class="text-gray-400">({{ formatMoney(oi.price) }})</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== TAB 2: STATS ==================== -->
    <template v-else>
      <!-- Charts -->
      <StatsCharts :transactions="filtered" />

      <!-- Daily stats -->
      <div v-if="period === 'day'" class="flex gap-3 mt-2">
        <div class="flex-1 rounded-xl bg-white border border-gray-100 shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-green-700">{{ incomeCount }}</div>
          <div class="text-sm text-gray-500 mt-1">đơn bán hàng</div>
        </div>
        <div class="flex-1 rounded-xl bg-white border border-gray-100 shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-red-600">{{ expenseCount }}</div>
          <div class="text-sm text-gray-500 mt-1">khoản chi</div>
        </div>
      </div>

      <!-- Month breakdown -->
      <div v-if="period === 'month' && dailyBreakdown.length > 0" class="flex flex-col gap-2 mt-2">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><CalendarDays class="w-5 h-5 text-gray-500" /> Lũy kế theo ngày</h2>
        <div
          v-for="day in dailyBreakdown"
          :key="day.label"
          class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm"
        >
          <span class="text-base font-semibold text-gray-800 w-16">{{ day.label }}</span>
          <div class="flex gap-4 text-sm font-medium">
            <span class="text-green-700">+{{ formatMoney(day.income) }}</span>
            <span class="text-red-600">−{{ formatMoney(day.expense) }}</span>
            <span :class="day.profit >= 0 ? 'text-gray-800' : 'text-red-600'" class="font-bold w-20 text-right">
              {{ formatMoney(day.profit) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Year breakdown -->
      <div v-if="period === 'year' && monthlyBreakdown.length > 0" class="flex flex-col gap-2 mt-2">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><CalendarDays class="w-5 h-5 text-gray-500" /> Tóm tắt theo tháng</h2>
        <div
          v-for="m in monthlyBreakdown"
          :key="m.month"
          class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm"
        >
          <span class="text-base font-semibold text-gray-800">{{ m.label }}</span>
          <div class="flex gap-4 text-sm font-medium">
            <span class="text-green-700">+{{ formatMoney(m.income) }}</span>
            <span class="text-red-600">−{{ formatMoney(m.expense) }}</span>
            <span :class="m.profit >= 0 ? 'text-gray-800' : 'text-red-600'" class="font-bold w-20 text-right">
              {{ formatMoney(m.profit) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Save report button -->
      <button
        v-if="hasRole('manage_reports')"
        @click="saveCurrentReport"
        class="flex justify-center items-center gap-2 w-full mt-4 rounded-2xl bg-blue-600 py-4 text-xl font-bold text-white shadow-lg active:bg-blue-700 min-h-[60px] transition-colors"
      >
        <Download class="w-6 h-6" /> Lưu chốt sổ báo cáo
      </button>

      <!-- Tax info -->
      <hr class="border-gray-200 mt-2 mb-2" />
      <div class="rounded-2xl border-2 p-4"
        :class="!taxRule
          ? 'border-gray-300 bg-gray-50'
          : yearlyIncome > taxThreshold
            ? 'border-yellow-400 bg-yellow-50'
            : 'border-green-200 bg-green-50'"
      >
        <div v-if="!taxRule" class="text-center text-gray-500">
          <div class="text-base font-bold mb-1 flex items-center justify-center gap-1"><AlertTriangle class="w-5 h-5 text-gray-400" /> Không có dữ liệu thuế năm {{ taxYear }}</div>
        </div>
        <template v-else>
          <div class="flex items-center justify-between mb-2">
            <span class="text-base font-bold text-gray-800">Doanh thu năm {{ taxYear }}</span>
            <span class="text-sm font-medium flex items-center gap-1" :class="yearlyIncome > taxThreshold ? 'text-yellow-700' : 'text-green-700'">
              <AlertCircle v-if="yearlyIncome > taxThreshold" class="w-4 h-4" />
              <CheckCircle2 v-else class="w-4 h-4" />
              {{ yearlyIncome > taxThreshold ? 'Vượt ngưỡng' : 'Miễn thuế' }}
            </span>
          </div>
          <div class="text-xl font-bold text-gray-800 mb-2">
            {{ formatMoney(yearlyIncome) }} <span class="text-gray-400 font-medium text-sm">/ {{ formatMoney(taxThreshold) }}</span>
          </div>
          <div class="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="yearlyIncome > taxThreshold ? 'bg-yellow-500' : 'bg-green-500'"
              :style="{ width: taxPercent + '%' }"
            />
          </div>
          <div v-if="estimatedTax > 0" class="mt-3 rounded-xl bg-yellow-100 px-3 py-2">
            <div class="text-sm font-bold text-yellow-800 flex items-center gap-1">
              <Banknote class="w-4 h-4" /> Thuế ước tính: {{ formatMoney(estimatedTax) }}
            </div>
            <div class="text-xs text-yellow-700 mt-1">
              = ({{ formatMoney(yearlyIncome) }} − {{ formatMoney(taxThreshold) }}) × {{ (taxRule.taxRate * 100) }}%
            </div>
          </div>
        </template>
      </div>

      <!-- Saved reports list -->
      <div v-if="savedReports.length > 0" class="flex flex-col gap-2 mt-4">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><FolderOpen class="w-5 h-5 text-gray-500" /> Báo cáo đã chốt</h2>
        <div
          v-for="rpt in [...savedReports].reverse()"
          :key="rpt.id"
          @click="viewingReport = rpt"
          class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm active:bg-gray-50 cursor-pointer"
        >
          <div>
            <div class="font-semibold text-gray-800">{{ rpt.periodLabel }}</div>
            <div class="text-sm text-gray-500">Lưu: {{ formatReportDate(rpt.createdAt) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold" :class="rpt.totalProfit >= 0 ? 'text-green-700' : 'text-red-600'">
              {{ rpt.totalProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(rpt.totalProfit)) }}
            </span>
            <span class="text-gray-400 text-lg">›</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <ExpenseModal
      v-if="showExpenseModal"
      :edit-id="editingTx?.id"
      :edit-type="editingTx?.type"
      :edit-description="editingTx?.description"
      :edit-amount="editingTx?.amount"
      :edit-category="editingTx?.category"
      @save="() => { /* Not used in Report mode since we only edit */ }"
      @update="handleUpdateExpense"
      @close="closeModal"
    />

    <EditOrderModal
      v-if="showEditOrderModal && editingTx"
      :transaction="editingTx"
      @update="handleUpdateOrder"
      @close="closeModal"
    />

    <ExportHistoryModal
      v-if="showExportModal"
      @close="showExportModal = false"
    />

    <ReportDetailModal
      v-if="viewingReport"
      :report="viewingReport"
      :can-manage="hasRole('manage_reports')"
      @close="viewingReport = null"
      @delete="handleDeleteReport"
    />
  </div>
</template>
