<script setup lang="ts">
import type { CartItem, OrderType } from '../types'
import { ReceiptText, X, CheckCircle } from 'lucide-vue-next'
import MenuIcon from './MenuIcon.vue'

defineProps<{
  items: CartItem[]
  total: number
  orderType: OrderType
}>()

defineEmits<{
  confirm: []
  clear: []
  increment: [index: number]
  decrement: [index: number]
  removeItem: [index: number]
}>()

function formatMoney(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function getPrice(item: CartItem, type: OrderType): number {
  return type === 'takeaway' ? item.menuItem.priceTakeaway : item.menuItem.priceHammock
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2"><ReceiptText class="text-gray-500" /> Đơn hàng</h2>
      <button
        v-if="items.length > 0"
        @click="$emit('clear')"
        class="rounded-lg px-3 py-1 text-sm font-medium text-red-600 bg-red-50 active:bg-red-100"
      >
        Xoá hết
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="items.length === 0" class="py-8 text-center text-gray-400 text-lg">
      Chưa chọn món nào
    </div>

    <!-- Cart items -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(cartItem, index) in items"
        :key="cartItem.menuItem.id"
        class="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3"
      >
        <!-- Left: icon + name -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="w-10 h-10 flex-shrink-0 flex items-center justify-center transform scale-75 origin-left"><MenuIcon :id="cartItem.menuItem.id" /></span>
          <div class="min-w-0">
            <div class="font-semibold text-gray-800 truncate">{{ cartItem.menuItem.name }}</div>
            <div class="text-sm text-gray-500">{{ formatMoney(getPrice(cartItem, orderType)) }}</div>
          </div>
        </div>

        <!-- Right: controls + delete -->
        <div class="flex items-center gap-4 flex-shrink-0">
          <!-- Quantity controls: − qty + -->
          <div class="flex items-center gap-0 rounded-lg border border-gray-200 bg-white">
            <button
              @click="$emit('decrement', index)"
              title="Giảm số lượng"
              class="flex h-12 w-12 items-center justify-center text-xl font-bold text-gray-600 active:bg-gray-100 rounded-l-lg"
            >
              −
            </button>
            <span class="flex h-12 w-12 items-center justify-center text-xl font-bold text-gray-800 border-x border-gray-200">
              {{ cartItem.quantity }}
            </span>
            <button
              @click="$emit('increment', index)"
              title="Tăng số lượng"
              class="flex h-12 w-12 items-center justify-center text-xl font-bold text-gray-600 active:bg-gray-100 rounded-r-lg"
            >
              +
            </button>
          </div>

          <!-- Delete button -->
          <button
            @click="$emit('removeItem', index)"
            title="Xoá món khỏi giỏ hàng"
            class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 text-lg font-bold active:bg-red-200"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Total & Confirm -->
    <div v-if="items.length > 0" class="mt-2 flex flex-col gap-3">
      <div class="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
        <span class="text-xl font-bold text-gray-800">Tổng cộng</span>
        <span class="text-2xl font-bold text-amber-700">{{ formatMoney(total) }}</span>
      </div>
      <button
        @click="$emit('confirm')"
        class="flex items-center justify-center gap-2 w-full rounded-2xl bg-green-700 py-4 text-xl font-bold text-white shadow-lg active:bg-green-800 min-h-[60px]"
      >
        <CheckCircle class="w-6 h-6" /> Xác nhận & Thu tiền
      </button>
    </div>
  </div>
</template>
