<script setup lang="ts">
import { ref } from 'vue'
import { TOTAL_HAMMOCKS } from '../data/menu'

const props = defineProps<{
  usedHammocks: number[]
}>()

const emit = defineEmits<{
  create: [type: 'takeaway' | 'hammock', hammocks: number[]]
  close: []
}>()

const step = ref<'choose' | 'hammock'>('choose')
const selectedHammocks = ref<number[]>([])

const allHammocks = Array.from({ length: TOTAL_HAMMOCKS }, (_, i) => i + 1)

function chooseTakeaway() {
  emit('create', 'takeaway', [])
}

function chooseHammock() {
  step.value = 'hammock'
  selectedHammocks.value = []
}

function toggleHammock(num: number) {
  const idx = selectedHammocks.value.indexOf(num)
  if (idx >= 0) {
    selectedHammocks.value.splice(idx, 1)
  } else {
    selectedHammocks.value.push(num)
  }
}

function confirmHammock() {
  if (selectedHammocks.value.length === 0) return
  const sorted = [...selectedHammocks.value].sort((a, b) => a - b)
  emit('create', 'hammock', sorted)
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-60 flex items-end justify-center bg-black/40" @click.self="$emit('close')">
    <div class="w-full max-w-lg rounded-t-2xl bg-white p-6 pb-8">

      <!-- Bước 1: Chọn loại -->
      <template v-if="step === 'choose'">
        <h2 class="mb-4 text-xl font-bold text-gray-800">Tạo đơn mới</h2>
        <div class="flex flex-col gap-3">
          <button
            @click="chooseTakeaway"
            class="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left active:bg-gray-50 min-h-[60px]"
          >
            <span class="text-3xl">🛍️</span>
            <div>
              <div class="text-lg font-semibold text-gray-800">Mang đi</div>
              <div class="text-sm text-gray-500">Tạo đơn nhanh, thanh toán ngay</div>
            </div>
          </button>
          <button
            @click="chooseHammock"
            class="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left active:bg-gray-50 min-h-[60px]"
          >
            <span class="text-3xl">🛏️</span>
            <div>
              <div class="text-lg font-semibold text-gray-800">Nằm võng</div>
              <div class="text-sm text-gray-500">Chọn võng, thanh toán sau</div>
            </div>
          </button>
        </div>
      </template>

      <!-- Bước 2: Chọn võng -->
      <template v-else>
        <h2 class="mb-4 text-xl font-bold text-gray-800">Chọn võng</h2>
        <div class="grid grid-cols-5 gap-2 mb-4">
          <button
            v-for="num in allHammocks"
            :key="num"
            @click="!usedHammocks.includes(num) && toggleHammock(num)"
            class="flex items-center justify-center rounded-xl border-2 py-3 text-lg font-bold transition-colors"
            :class="[
              usedHammocks.includes(num)
                ? 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed'
                : selectedHammocks.includes(num)
                  ? 'border-amber-500 bg-amber-100 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-700 active:bg-gray-50'
            ]"
          >
            {{ num }}
          </button>
        </div>
        <div class="flex gap-3">
          <button
            @click="step = 'choose'"
            class="flex-1 rounded-xl border-2 border-gray-200 py-3 text-base font-semibold text-gray-600 active:bg-gray-50"
          >
            ← Quay lại
          </button>
          <button
            @click="confirmHammock"
            :disabled="selectedHammocks.length === 0"
            class="flex-1 rounded-xl py-3 text-base font-bold text-white min-h-[48px]"
            :class="selectedHammocks.length > 0 ? 'bg-amber-600 active:bg-amber-700' : 'bg-gray-300 cursor-not-allowed'"
          >
            Xác nhận ({{ selectedHammocks.length }} võng)
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
