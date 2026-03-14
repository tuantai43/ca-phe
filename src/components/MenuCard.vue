<script setup lang="ts">
import type { MenuItem, OrderType } from '../types'
import MenuIcon from './MenuIcon.vue'

defineProps<{
  item: MenuItem
  orderType: OrderType
  quantity: number
}>()

defineEmits<{
  add: [item: MenuItem]
}>()

function formatPrice(price: number): string {
  return (price / 1000) + 'k'
}
</script>

<template>
  <button
    @click="$emit('add', item)"
    class="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm active:scale-95 active:bg-gray-50 transition-transform min-h-[120px]"
  >
    <!-- Badge số lượng -->
    <span
      v-if="quantity > 0"
      class="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 text-base font-bold text-white shadow"
    >
      {{ quantity }}
    </span>
    <span class="text-4xl"><MenuIcon :id="item.id" /></span>
    <span class="text-lg font-semibold text-gray-800">{{ item.name }}</span>
    <span class="text-xl font-bold text-amber-700">
      {{ formatPrice(orderType === 'takeaway' ? item.priceTakeaway : item.priceHammock) }}
    </span>
  </button>
</template>
