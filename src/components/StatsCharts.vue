<script setup lang="ts">
import { computed } from 'vue'
import { BarChart2, ShoppingBag, Bed, Trophy } from 'lucide-vue-next'
import type { Transaction } from '../types'

const props = defineProps<{
  transactions: Transaction[]
}>()

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

// -- 1. Thu / Chi bar chart --
const totalIncome = computed(() =>
  props.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
)
const totalExpense = computed(() =>
  props.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
)
const incomeExpenseMax = computed(() => Math.max(totalIncome.value, totalExpense.value, 1))

// -- 2. Mang đi vs Tại võng donut --
const takeawayCount = computed(() =>
  props.transactions.filter(t => t.type === 'income' && t.orderType === 'takeaway').length
)
const hammockCount = computed(() =>
  props.transactions.filter(t => t.type === 'income' && t.orderType === 'hammock').length
)
const totalOrders = computed(() => takeawayCount.value + hammockCount.value)
const takeawayPct = computed(() => totalOrders.value > 0 ? takeawayCount.value / totalOrders.value : 0)

// SVG donut arc
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle - 90) * Math.PI / 180
  const endRad = (endAngle - 90) * Math.PI / 180
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

const takeawayArc = computed(() => {
  if (totalOrders.value === 0) return ''
  const angle = takeawayPct.value * 360
  if (angle >= 360) return describeArc(50, 50, 38, 0, 359.99)
  if (angle <= 0) return ''
  return describeArc(50, 50, 38, 0, angle)
})
const hammockArc = computed(() => {
  if (totalOrders.value === 0) return ''
  const startAngle = takeawayPct.value * 360
  if (startAngle >= 360) return ''
  return describeArc(50, 50, 38, startAngle, 359.99)
})

// -- 3. Top items bar chart --
interface ItemStat { name: string; count: number }
const topItems = computed<ItemStat[]>(() => {
  const map = new Map<string, number>()
  for (const tx of props.transactions) {
    if (tx.orderItems) {
      for (const oi of tx.orderItems) {
        map.set(oi.name, (map.get(oi.name) ?? 0) + oi.quantity)
      }
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})
const topItemMax = computed(() => topItems.value.length > 0 ? topItems.value[0].count : 1)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Thu / Chi bar -->
    <div class="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <h3 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><BarChart2 class="w-5 h-5 text-gray-500" /> Thu / Chi</h3>
      <div class="flex flex-col gap-3">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-green-700">Thu</span>
            <span class="font-bold text-green-700">+{{ formatMoney(totalIncome) }}</span>
          </div>
          <div class="h-6 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full bg-green-500 transition-all"
              :style="{ width: (totalIncome / incomeExpenseMax * 100) + '%' }"
            />
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-red-600">Chi</span>
            <span class="font-bold text-red-600">−{{ formatMoney(totalExpense) }}</span>
          </div>
          <div class="h-6 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              class="h-full rounded-full bg-red-500 transition-all"
              :style="{ width: (totalExpense / incomeExpenseMax * 100) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mang đi vs Tại võng -->
    <div class="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <h3 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <ShoppingBag class="w-4 h-4 text-amber-500" /> Mang đi / <Bed class="w-4 h-4 text-violet-500" /> Tại võng
      </h3>
      <div v-if="totalOrders === 0" class="py-6 text-center text-gray-400">Chưa có đơn hàng</div>
      <div v-else class="flex items-center gap-4">
        <!-- Donut chart -->
        <svg viewBox="0 0 100 100" class="w-28 h-28 shrink-0">
          <!-- Background ring -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" stroke-width="14"/>
          <!-- Takeaway arc -->
          <path v-if="takeawayArc" :d="takeawayArc" fill="none" stroke="#F59E0B" stroke-width="14" stroke-linecap="round"/>
          <!-- Hammock arc -->
          <path v-if="hammockArc" :d="hammockArc" fill="none" stroke="#8B5CF6" stroke-width="14" stroke-linecap="round"/>
          <!-- Center text -->
          <text x="50" y="47" text-anchor="middle" class="text-[10px] font-bold fill-gray-800">{{ totalOrders }}</text>
          <text x="50" y="59" text-anchor="middle" class="text-[7px] fill-gray-500">đơn</text>
        </svg>
        <!-- Legend -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="h-4 w-4 rounded-full bg-amber-400 shrink-0"></span>
            <span class="text-sm text-gray-700">Mang đi: <strong>{{ takeawayCount }}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-4 w-4 rounded-full bg-violet-500 shrink-0"></span>
            <span class="text-sm text-gray-700">Tại võng: <strong>{{ hammockCount }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top items -->
    <div class="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
      <h3 class="text-base font-bold text-gray-800 mb-3 flex items-center gap-2"><Trophy class="w-5 h-5 text-amber-500" /> Món bán chạy</h3>
      <div v-if="topItems.length === 0" class="py-6 text-center text-gray-400">Chưa có dữ liệu</div>
      <div v-else class="flex flex-col gap-2">
        <div v-for="(item, idx) in topItems" :key="item.name" class="flex items-center gap-3">
          <span class="w-6 text-center text-sm font-bold" :class="idx === 0 ? 'text-amber-600' : 'text-gray-400'">
            {{ idx + 1 }}
          </span>
          <div class="flex-1">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-800">{{ item.name }}</span>
              <span class="font-bold text-gray-700">{{ item.count }} ly</span>
            </div>
            <div class="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-amber-300' : 'bg-amber-200'"
                :style="{ width: (item.count / topItemMax * 100) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
