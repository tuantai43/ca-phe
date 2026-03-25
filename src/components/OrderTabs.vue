<script setup lang="ts">
import type { Order } from '../types'
import { ShoppingBag, Bed } from 'lucide-vue-next'

defineProps<{
  orders: Order[]
  activeOrderId: string | null
}>()

defineEmits<{
  select: [orderId: string]
  newOrder: []
}>()

function getOrderLabel(order: Order): string {
  if (order.type === 'takeaway') {
    return 'Mang đi'
  }
  return 'Võng ' + order.hammocks.join(', ')
}

function getOrderTotal(order: Order): number {
  const priceKey = order.type === 'takeaway' ? 'priceTakeaway' : 'priceHammock'
  return order.items.reduce((sum, item) => sum + item.menuItem[priceKey] * item.quantity, 0)
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-gray-200">
    <!-- Nút tạo đơn mới -->
    <button
      @click="$emit('newOrder')"
      class="flex-shrink-0 flex items-center gap-1 rounded-xl border-2 border-dashed border-gray-300 px-4 py-2 text-base font-semibold text-gray-500 active:bg-gray-100 min-h-[48px]"
    >
      <span class="text-xl">+</span> Đơn mới
    </button>

    <!-- Tabs đơn hàng -->
    <button
      v-for="order in orders"
      :key="order.id"
      @click="$emit('select', order.id)"
      class="flex-shrink-0 flex flex-col items-start rounded-xl border-2 px-4 py-2 text-left transition-colors min-h-[48px]"
      :class="[
        activeOrderId === order.id
          ? 'border-amber-600 bg-amber-50'
          : order.items.length > 0
            ? 'border-amber-300 bg-amber-50/50'
            : 'border-gray-200 bg-gray-50'
      ]"
    >
      <span class="text-sm font-semibold text-gray-800 whitespace-nowrap flex items-center gap-1">
        <ShoppingBag v-if="order.type === 'takeaway'" class="w-4 h-4 text-emerald-600" />
        <Bed v-else class="w-4 h-4 text-blue-500" />
        {{ getOrderLabel(order) }}
      </span>
      <span v-if="order.items.length > 0" class="text-xs font-medium text-amber-700 mt-0.5">
        {{ formatMoney(getOrderTotal(order)) }}
      </span>
    </button>
  </div>
</template>
