<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Trash2, Plus, Minus, Info } from 'lucide-vue-next'
import type { Transaction, TransactionOrderItem } from '../types'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  close: []
  update: [id: string, description: string, amount: number, items: TransactionOrderItem[]]
}>()

// Clone the arrays so we don't mutate parent's reference directly before saving
const localItems = ref<TransactionOrderItem[]>([])
const localDescription = ref(props.transaction.description)

watch(() => props.transaction, (newVal) => {
  localItems.value = JSON.parse(JSON.stringify(newVal.orderItems || []))
  localDescription.value = newVal.description
}, { immediate: true })

const activeTotal = computed(() => {
  return localItems.value.reduce((sum, item) => sum + ((item.price ?? 0) * item.quantity), 0)
})

function increment(index: number) {
  localItems.value[index].quantity++
}

function decrement(index: number) {
  if (localItems.value[index].quantity > 1) {
    localItems.value[index].quantity--
  } else {
    localItems.value.splice(index, 1)
  }
}

function removeItem(index: number) {
  localItems.value.splice(index, 1)
}

function submit() {
  emit('update', props.transaction.id, localDescription.value, activeTotal.value, localItems.value)
}

function formatMoney(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex justify-center items-end sm:items-center bg-black/50 overflow-hidden" @click.self="$emit('close')">
    <div class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
      <!-- Header -->
      <div class="px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h2 class="text-xl font-bold text-gray-800">Sửa Giao Dịch Bán</h2>
        <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Warning info -->
      <div class="bg-blue-50/50 p-3 mx-4 mt-4 rounded-xl border border-blue-100 flex gap-2 shrink-0">
        <Info class="w-5 h-5 text-blue-500 shrink-0" />
        <p class="text-xs text-blue-700 font-medium">Bạn đang sửa lại Số Lượng của hoá đơn chốt dở. Tổng tiền sẽ được hệ thống nhân lại theo <b>Đơn Giá Gốc</b> lúc khách mua.</p>
      </div>

      <!-- Body -->
      <div class="px-5 py-4 pb-6 overflow-y-auto flex-1">
        <div class="mb-4">
          <label class="block text-sm font-bold text-gray-700 mb-1">Mô tả/Ghi chú</label>
          <input 
            type="text" 
            v-model="localDescription" 
            class="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 focus:border-amber-500 outline-none" 
            placeholder="Ghi chú đơn..."
          />
        </div>

        <div class="font-bold text-gray-800 mb-2 border-b pb-1">Chi Tiết Ly ({{ localItems.length }} món)</div>
        
        <div v-if="localItems.length === 0" class="text-center py-6 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl">
          Hoá đơn này sẽ thành hoá đơn rỗng (0đ).
        </div>
        
        <div class="flex flex-col gap-3">
          <div v-for="(item, idx) in localItems" :key="idx" class="flex flex-col border border-gray-100 rounded-xl p-3 bg-gray-50/50 shadow-sm relative pr-12">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-800 text-sm sm:text-base">{{ item.name }}</span>
              <span class="text-sm font-bold text-amber-700">{{ formatMoney(item.price ?? 0) }}/ly</span>
            </div>
            
            <div class="flex items-center gap-3">
              <button @click="decrement(idx)" class="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 active:bg-gray-100 select-none">
                <Minus class="w-4 h-4" />
              </button>
              <div class="w-8 text-center font-bold text-lg select-none">{{ item.quantity }}</div>
              <button @click="increment(idx)" class="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-amber-600 active:bg-amber-50 select-none">
                <Plus class="w-4 h-4" />
              </button>
              <span class="ml-auto font-bold text-green-700">= {{ formatMoney((item.price ?? 0) * item.quantity) }}</span>
            </div>

            <button @click="removeItem(idx)" class="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="p-5 border-t border-gray-100 bg-white shadow-2xl shrink-0">
        <div class="flex items-end justify-between mb-4">
          <span class="text-gray-500 font-bold">Tổng Mới:</span>
          <span class="text-2xl font-black text-green-700">{{ formatMoney(activeTotal) }}</span>
        </div>
        <button 
          @click="submit" 
          class="w-full h-12 rounded-xl bg-amber-600 text-white font-bold text-lg hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-lg"
        >
          Lưu Chỉnh Sửa Hoá Đơn
        </button>
      </div>
    </div>
  </div>
</template>
