<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  title: string
  initialAmount: number
}>()

const emit = defineEmits<{
  save: [amount: number]
  close: []
}>()

const amountStr = ref(props.initialAmount > 0 ? String(props.initialAmount) : '0')
const amountNumber = computed(() => parseInt(amountStr.value) || 0)

const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫']

function pressKey(key: string) {
  if (key === '⌫') {
    if (amountStr.value.length <= 1) {
      amountStr.value = '0'
    } else {
      amountStr.value = amountStr.value.slice(0, -1)
    }
  } else {
    if (amountStr.value === '0') {
      amountStr.value = key === '000' ? '0' : key
    } else {
      amountStr.value += key
    }
  }
  // Max 9 digits
  if (amountStr.value.length > 9) {
    amountStr.value = amountStr.value.slice(0, 9)
  }
}

function clearAmount() {
  amountStr.value = '0'
}

function formatDisplay(val: number): string {
  return val.toLocaleString('vi-VN') + 'đ'
}

function submit() {
  emit('save', amountNumber.value)
}
</script>

<template>
  <div class="fixed inset-0 z-[70] flex items-end justify-center bg-black/40" @click.self="$emit('close')">
    <div class="w-full max-w-lg rounded-t-2xl bg-white p-5 pb-6">
      <h2 class="mb-4 text-xl font-bold text-gray-800 text-center">
        {{ title }}
      </h2>

      <!-- Số tiền hiển thị -->
      <div class="mb-4">
        <label class="mb-2 block text-sm font-bold text-gray-600">Mức giá mới</label>
        <div class="flex items-center justify-between rounded-xl bg-gray-50 border-2 border-amber-200 px-4 py-3">
          <span class="text-3xl font-bold text-amber-700">{{ formatDisplay(amountNumber) }}</span>
          <button
            @click="clearAmount"
            class="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 active:bg-gray-300"
          >
            Xoá hết
          </button>
        </div>
      </div>

      <!-- Bàn phím số -->
      <div class="mb-6 grid grid-cols-3 gap-2">
        <button
          v-for="key in numpadKeys"
          :key="key"
          @click="pressKey(key)"
          class="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-2xl font-bold min-h-[60px] active:bg-gray-100 transition-colors"
          :class="key === '⌫' ? 'text-red-600' : 'text-gray-800'"
        >
          {{ key }}
        </button>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border-2 border-gray-200 py-3 text-lg font-semibold text-gray-600 active:bg-gray-50 min-h-[56px]"
        >
          Huỷ thay đổi
        </button>
        <button
          @click="submit"
          class="flex-1 rounded-xl bg-amber-600 py-3 text-lg font-bold text-white active:bg-amber-700 min-h-[56px]"
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
</template>
