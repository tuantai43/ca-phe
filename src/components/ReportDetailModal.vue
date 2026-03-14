<script setup lang="ts">
import type { SavedReport } from '../types'

const props = defineProps<{ report: SavedReport }>()
const emit = defineEmits<{
  close: []
  delete: [id: string]
}>()

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.getHours().toString().padStart(2, '0')
    + ':' + d.getMinutes().toString().padStart(2, '0')
}
</script>

<template>
  <div class="fixed inset-0 z-60 flex items-end justify-center bg-black/40" @click.self="emit('close')">
    <div class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white pb-6">
      <!-- Header -->
      <div class="sticky top-0 z-10 flex items-center justify-between bg-white px-4 pt-5 pb-3 border-b border-gray-100">
        <div>
          <h2 class="text-xl font-bold text-gray-800">📊 {{ report.periodLabel }}</h2>
          <div class="text-sm text-gray-500">Lưu lúc {{ formatDate(report.createdAt) }}</div>
        </div>
        <button @click="emit('close')" class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg active:bg-gray-200">✕</button>
      </div>

      <div class="flex flex-col gap-4 p-4">
        <!-- Summary cards -->
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-green-50 border-2 border-green-200 p-4">
            <div class="text-sm font-medium text-green-700">Tổng thu</div>
            <div class="text-2xl font-bold text-green-700 mt-1">+{{ formatMoney(report.totalIncome) }}</div>
            <div class="text-xs text-green-600 mt-1">{{ report.incomeCount }} đơn</div>
          </div>
          <div class="rounded-2xl bg-red-50 border-2 border-red-200 p-4">
            <div class="text-sm font-medium text-red-700">Tổng chi</div>
            <div class="text-2xl font-bold text-red-700 mt-1">−{{ formatMoney(report.totalExpense) }}</div>
            <div class="text-xs text-red-600 mt-1">{{ report.expenseCount }} khoản</div>
          </div>
        </div>

        <!-- Profit -->
        <div class="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex items-center justify-between">
          <span class="text-lg font-bold text-gray-800">Lợi nhuận</span>
          <span class="text-2xl font-bold" :class="report.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ report.totalProfit >= 0 ? '+' : '−' }}{{ formatMoney(Math.abs(report.totalProfit)) }}
          </span>
        </div>

        <!-- Breakdown -->
        <div v-if="report.breakdown.length > 0" class="flex flex-col gap-2">
          <h3 class="text-lg font-bold text-gray-800">📅 Chi tiết</h3>
          <div
            v-for="item in report.breakdown"
            :key="item.label"
            class="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100"
          >
            <span class="text-base font-semibold text-gray-800">{{ item.label }}</span>
            <div class="flex gap-3 text-sm font-medium">
              <span class="text-green-700">+{{ formatMoney(item.income) }}</span>
              <span class="text-red-600">−{{ formatMoney(item.expense) }}</span>
              <span :class="item.profit >= 0 ? 'text-gray-800' : 'text-red-600'" class="font-bold">
                {{ formatMoney(item.profit) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tax info -->
        <div class="rounded-2xl border-2 p-4"
          :class="report.yearlyIncome > report.taxThreshold
            ? 'border-yellow-400 bg-yellow-50'
            : 'border-green-200 bg-green-50'"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-base font-bold text-gray-800">Doanh thu năm {{ report.taxYear }}</span>
            <span class="text-sm font-medium" :class="report.yearlyIncome > report.taxThreshold ? 'text-yellow-700' : 'text-green-700'">
              {{ report.yearlyIncome > report.taxThreshold ? '🟡 Vượt ngưỡng' : '🟢 Miễn thuế' }}
            </span>
          </div>
          <div class="text-xl font-bold text-gray-800 mb-2">
            {{ formatMoney(report.yearlyIncome) }} / {{ formatMoney(report.taxThreshold) }}
          </div>
          <div v-if="report.estimatedTax > 0" class="rounded-xl bg-yellow-100 px-3 py-2 mb-2">
            <div class="text-sm font-bold text-yellow-800">
              💰 Thuế ước tính: {{ formatMoney(report.estimatedTax) }}
            </div>
            <div class="text-xs text-yellow-700 mt-1">
              = ({{ formatMoney(report.yearlyIncome) }} − {{ formatMoney(report.taxThreshold) }}) × {{ (report.taxRate * 100) }}%
            </div>
          </div>
          <div class="text-xs text-gray-500">
            <div>{{ report.taxDescription }}</div>
            <div class="mt-0.5">📎 {{ report.taxLegalBasis }}</div>
          </div>
        </div>

        <!-- Delete button -->
        <button
          @click="emit('delete', report.id)"
          class="w-full rounded-2xl border-2 border-red-200 bg-red-50 py-4 text-lg font-bold text-red-600 active:bg-red-100 min-h-[60px]"
        >
          🗑️ Xoá báo cáo này
        </button>
      </div>
    </div>
  </div>
</template>
