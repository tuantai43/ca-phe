<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExpenseCategory } from '../types'

const props = defineProps<{
  editId?: string
  editDescription?: string
  editAmount?: number
  editCategory?: ExpenseCategory
}>()

const emit = defineEmits<{
  save: [description: string, amount: number, category: ExpenseCategory]
  update: [id: string, description: string, amount: number, category: ExpenseCategory]
  close: []
}>()

const isEdit = !!props.editId
const description = ref(props.editDescription ?? '')
const amountStr = ref(props.editAmount ? String(props.editAmount) : '0')
const category = ref<ExpenseCategory>(props.editCategory ?? 'khac')

const amountNumber = computed(() => parseInt(amountStr.value) || 0)

const categories: { id: ExpenseCategory; label: string; defaultPrice: number }[] = [
  { id: 'tien-da', label: '🧊 Tiền đá', defaultPrice: 30000 },
  { id: 'tien-mia', label: '🎋 Tiền mía', defaultPrice: 50000 },
  { id: 'tien-rau-ma', label: '🌿 Tiền rau má', defaultPrice: 30000 },
  { id: 'tien-tac', label: '🍋 Tiền tắc', defaultPrice: 20000 },
  { id: 'tien-cam', label: '🍊 Tiền cam', defaultPrice: 50000 },
  { id: 'tien-dua', label: '🥥 Tiền dừa', defaultPrice: 50000 },
  { id: 'tien-ly', label: '🥤 Tiền ly', defaultPrice: 20000 },
  { id: 'ong-hut', label: '🥤 Tiền ống hút', defaultPrice: 10000 },
  { id: 'bich', label: '🛍️ Tiền bịch', defaultPrice: 10000 },
  { id: 'khac', label: '📝 Khác', defaultPrice: 0 },
]

const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫']

function selectCategory(cat: typeof categories[number]) {
  category.value = cat.id
  description.value = cat.label.replace(/^[^\s]+\s/, '') // bỏ icon
  if (cat.defaultPrice > 0) {
    amountStr.value = String(cat.defaultPrice)
  }
}

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
  // Giới hạn tối đa 9 ký tự (999.999.999đ)
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
  if (!description.value.trim() || amountNumber.value <= 0) return
  if (isEdit && props.editId) {
    emit('update', props.editId, description.value.trim(), amountNumber.value, category.value)
  } else {
    emit('save', description.value.trim(), amountNumber.value, category.value)
  }
}
</script>

<template>
  <div class="fixed inset-0 z-60 flex items-end justify-center bg-black/40" @click.self="$emit('close')">
    <div class="w-full max-w-lg rounded-t-2xl bg-white p-5 pb-6 max-h-[90vh] overflow-y-auto">
      <h2 class="mb-3 text-xl font-bold text-gray-800">{{ isEdit ? '✏️ Sửa khoản chi' : '🔴 Nhập khoản chi' }}</h2>

      <!-- Danh mục -->
      <div class="mb-3">
        <label class="mb-2 block text-sm font-medium text-gray-600">Danh mục</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat)"
            class="rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors"
            :class="category === cat.id
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 bg-white text-gray-600 active:bg-gray-50'"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Mô tả -->
      <div class="mb-3">
        <label class="mb-2 block text-sm font-medium text-gray-600">Mô tả</label>
        <input
          v-model="description"
          type="text"
          placeholder="VD: Tiền đá, tiền điện..."
          class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-red-400 focus:outline-none"
        />
      </div>

      <!-- Số tiền hiển thị -->
      <div class="mb-2">
        <label class="mb-2 block text-sm font-medium text-gray-600">Số tiền</label>
        <div class="flex items-center justify-between rounded-xl bg-gray-50 border-2 border-gray-200 px-4 py-3">
          <span class="text-3xl font-bold text-gray-800">{{ formatDisplay(amountNumber) }}</span>
          <button
            @click="clearAmount"
            class="rounded-lg bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 active:bg-gray-300"
          >
            Xoá hết
          </button>
        </div>
      </div>

      <!-- Bàn phím số -->
      <div class="mb-4 grid grid-cols-3 gap-2">
        <button
          v-for="key in numpadKeys"
          :key="key"
          @click="pressKey(key)"
          class="flex items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-xl font-bold min-h-[56px] active:bg-gray-100 transition-colors"
          :class="key === '⌫' ? 'text-red-600' : 'text-gray-800'"
        >
          {{ key }}
        </button>
      </div>

      <!-- Buttons -->
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 rounded-xl border-2 border-gray-200 py-3 text-base font-semibold text-gray-600 active:bg-gray-50 min-h-[56px]"
        >
          Huỷ
        </button>
        <button
          @click="submit"
          :disabled="!description.trim() || amountNumber <= 0"
          class="flex-1 rounded-xl py-3 text-base font-bold text-white min-h-[56px]"
          :class="description.trim() && amountNumber > 0
            ? 'bg-red-600 active:bg-red-700'
            : 'bg-gray-300 cursor-not-allowed'"
        >
          {{ isEdit ? 'Cập nhật' : 'Lưu khoản chi' }}
        </button>
      </div>
    </div>
  </div>
</template>
