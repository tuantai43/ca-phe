<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTransactions } from '../composables/useTransactions'
import { useSavedReports } from '../composables/useSavedReports'
import { getTaxRule, estimateTax } from '../data/taxRules'
import type { SavedReport } from '../types'
import ReportDetailModal from '../components/ReportDetailModal.vue'
import StatsCharts from '../components/StatsCharts.vue'

const { allTransactions } = useTransactions()

type Period = 'today' | 'month' | 'year'
const period = ref<Period>('today')

const now = new Date()
const selectedMonth = ref(now.getMonth())
const selectedYear = ref(now.getFullYear())

watch(period, () => {
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

const canNextMonth = computed(() =>
  !(selectedYear.value === now.getFullYear() && selectedMonth.value >= now.getMonth())
)
const canNextYear = computed(() => selectedYear.value < now.getFullYear())

// Filters
function isToday(ts: number) {
  const d = new Date(ts)
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}
function isSelectedMonth(ts: number) {
  const d = new Date(ts)
  return d.getFullYear() === selectedYear.value && d.getMonth() === selectedMonth.value
}
function isSelectedYear(ts: number) {
  return new Date(ts).getFullYear() === selectedYear.value
}

const filtered = computed(() => {
  const filter = period.value === 'today' ? isToday
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

function periodLabel(): string {
  if (period.value === 'today') {
    return 'Hôm nay, ' + now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  if (period.value === 'month') {
    return 'Tháng ' + String(selectedMonth.value + 1).padStart(2, '0') + '/' + selectedYear.value
  }
  return 'Năm ' + selectedYear.value
}

const tabs: { id: Period; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' },
]

// Saved reports
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
  <div class="flex flex-col gap-4 p-4 pb-8">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-gray-800">📊 Báo cáo</h1>

    <!-- Period tabs -->
    <div class="flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="period = tab.id"
        class="flex-1 rounded-xl border-2 py-3 text-center text-base font-semibold transition-colors"
        :class="period === tab.id
          ? 'border-amber-500 bg-amber-50 text-amber-800'
          : 'border-gray-200 bg-white text-gray-600 active:bg-gray-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Period navigation -->
    <div v-if="period === 'today'" class="text-center text-base font-semibold text-gray-600">
      {{ periodLabel() }}
    </div>
    <div v-else-if="period === 'month'" class="flex items-center justify-between gap-2">
      <button @click="prevMonth" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100">←</button>
      <span class="text-lg font-bold text-gray-800">{{ periodLabel() }}</span>
      <button @click="nextMonth" :disabled="!canNextMonth" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100" :class="canNextMonth ? 'text-gray-600' : 'text-gray-300'">→</button>
    </div>
    <div v-else class="flex items-center justify-between gap-2">
      <button @click="prevYear" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-600 active:bg-gray-100">←</button>
      <span class="text-lg font-bold text-gray-800">{{ periodLabel() }}</span>
      <button @click="nextYear" :disabled="!canNextYear" class="flex h-12 w-12 items-center justify-center rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold active:bg-gray-100" :class="canNextYear ? 'text-gray-600' : 'text-gray-300'">→</button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
        <div class="text-sm font-medium text-green-700">Tổng thu</div>
        <div class="text-2xl font-bold text-green-700 mt-1">+{{ formatMoney(totalIncome) }}</div>
      </div>
      <div class="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
        <div class="text-sm font-medium text-red-700">Tổng chi</div>
        <div class="text-2xl font-bold text-red-700 mt-1">−{{ formatMoney(totalExpense) }}</div>
      </div>
    </div>

    <!-- Profit -->
    <div class="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex items-center justify-between">
      <span class="text-lg font-bold text-gray-800">Lợi nhuận</span>
      <span class="text-2xl font-bold" :class="totalProfit >= 0 ? 'text-green-700' : 'text-red-700'">
        {{ totalProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(totalProfit)) }}
      </span>
    </div>

    <!-- Charts -->
    <StatsCharts :transactions="filtered" />

    <!-- Today stats -->
    <div v-if="period === 'today'" class="flex gap-3">
      <div class="flex-1 rounded-xl bg-white border border-gray-200 p-4 text-center">
        <div class="text-3xl font-bold text-green-700">{{ incomeCount }}</div>
        <div class="text-sm text-gray-500 mt-1">đơn bán hàng</div>
      </div>
      <div class="flex-1 rounded-xl bg-white border border-gray-200 p-4 text-center">
        <div class="text-3xl font-bold text-red-600">{{ expenseCount }}</div>
        <div class="text-sm text-gray-500 mt-1">khoản chi</div>
      </div>
    </div>

    <!-- Month breakdown -->
    <div v-if="period === 'month' && dailyBreakdown.length > 0" class="flex flex-col gap-2">
      <h2 class="text-lg font-bold text-gray-800">📅 Theo ngày</h2>
      <div
        v-for="day in dailyBreakdown"
        :key="day.label"
        class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100"
      >
        <span class="text-base font-semibold text-gray-800">{{ day.label }}</span>
        <div class="flex gap-4 text-sm font-medium">
          <span class="text-green-700">+{{ formatMoney(day.income) }}</span>
          <span class="text-red-600">−{{ formatMoney(day.expense) }}</span>
          <span :class="day.profit >= 0 ? 'text-gray-800' : 'text-red-600'" class="font-bold">
            {{ formatMoney(day.profit) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Year breakdown -->
    <div v-if="period === 'year' && monthlyBreakdown.length > 0" class="flex flex-col gap-2">
      <h2 class="text-lg font-bold text-gray-800">📅 Theo tháng</h2>
      <div
        v-for="m in monthlyBreakdown"
        :key="m.month"
        class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100"
      >
        <span class="text-base font-semibold text-gray-800">{{ m.label }}</span>
        <div class="flex gap-4 text-sm font-medium">
          <span class="text-green-700">+{{ formatMoney(m.income) }}</span>
          <span class="text-red-600">−{{ formatMoney(m.expense) }}</span>
          <span :class="m.profit >= 0 ? 'text-gray-800' : 'text-red-600'" class="font-bold">
            {{ formatMoney(m.profit) }}
          </span>
        </div>
      </div>
    </div>

    <!-- No data -->
    <div
      v-if="filtered.length === 0"
      class="py-8 text-center text-gray-400 text-lg"
    >
      Chưa có dữ liệu
    </div>

    <!-- Save report button -->
    <button
      @click="saveCurrentReport"
      class="w-full rounded-2xl bg-blue-600 py-4 text-xl font-bold text-white shadow-lg active:bg-blue-700 min-h-[60px]"
    >
      📥 Lưu báo cáo
    </button>

    <!-- Tax info -->
    <hr class="border-gray-200" />
    <div class="rounded-2xl border-2 p-4"
      :class="!taxRule
        ? 'border-gray-300 bg-gray-50'
        : yearlyIncome > taxThreshold
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-green-200 bg-green-50'"
    >
      <div v-if="!taxRule" class="text-center text-gray-500">
        <div class="text-base font-bold mb-1">⚠️ Không có dữ liệu thuế cho năm {{ taxYear }}</div>
        <div class="text-sm">Thông tin thuế chỉ có từ năm 2021 trở đi</div>
      </div>
      <template v-else>
        <div class="flex items-center justify-between mb-2">
          <span class="text-base font-bold text-gray-800">Doanh thu năm {{ taxYear }}</span>
          <span class="text-sm font-medium" :class="yearlyIncome > taxThreshold ? 'text-yellow-700' : 'text-green-700'">
            {{ yearlyIncome > taxThreshold ? '🟡 Vượt ngưỡng' : '🟢 Miễn thuế' }}
          </span>
        </div>
        <div class="text-xl font-bold text-gray-800 mb-2">
          {{ formatMoney(yearlyIncome) }} / {{ formatMoney(taxThreshold) }}
        </div>
        <!-- Progress bar -->
        <div class="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="yearlyIncome > taxThreshold ? 'bg-yellow-500' : 'bg-green-500'"
            :style="{ width: taxPercent + '%' }"
          />
        </div>
        <div v-if="estimatedTax > 0" class="mt-3 rounded-xl bg-yellow-100 px-3 py-2">
          <div class="text-sm font-bold text-yellow-800">
            💰 Thuế ước tính: {{ formatMoney(estimatedTax) }}
          </div>
          <div class="text-xs text-yellow-700 mt-1">
            = ({{ formatMoney(yearlyIncome) }} − {{ formatMoney(taxThreshold) }}) × {{ (taxRule.taxRate * 100) }}%
          </div>
        </div>
        <div class="mt-3 text-xs text-gray-500">
          <div>{{ taxRule.description }}</div>
          <div class="mt-0.5">📎 {{ taxRule.legalBasis }}</div>
          <div class="mt-0.5">📅 Khai thuế: {{ taxRule.filingPeriod === 'quarter' ? 'theo quý' : taxRule.filingPeriod === 'month' ? 'theo tháng' : 'theo năm' }}</div>
        </div>
      </template>
    </div>

    <!-- Saved reports list -->
    <div v-if="savedReports.length > 0" class="flex flex-col gap-2">
      <h2 class="text-lg font-bold text-gray-800">📂 Báo cáo đã lưu</h2>
      <div
        v-for="rpt in [...savedReports].reverse()"
        :key="rpt.id"
        @click="viewingReport = rpt"
        class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm active:bg-gray-50"
      >
        <div>
          <div class="font-semibold text-gray-800">{{ rpt.periodLabel }}</div>
          <div class="text-sm text-gray-500">Lưu lúc {{ formatReportDate(rpt.createdAt) }}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-base font-bold" :class="rpt.totalProfit >= 0 ? 'text-green-700' : 'text-red-600'">
            {{ rpt.totalProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(rpt.totalProfit)) }}
          </span>
          <span class="text-gray-400 text-lg">›</span>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <ReportDetailModal
      v-if="viewingReport"
      :report="viewingReport"
      @close="viewingReport = null"
      @delete="handleDeleteReport"
    />
  </div>
</template>
