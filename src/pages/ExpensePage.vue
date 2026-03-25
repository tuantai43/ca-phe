<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactions } from '../composables/useTransactions'
import { useMasterData } from '../composables/useMasterData'
import { PlusCircle, CheckCircle2 } from 'lucide-vue-next'
import type { ExpenseCategory } from '../types'

const { addTransaction } = useTransactions()
const { masterData } = useMasterData()
const router = useRouter()

const description = ref('')
const amountStr = ref('0')
const category = ref<ExpenseCategory>('khac')
const showSuccess = ref(false)

const amountNumber = computed(() => parseInt(amountStr.value) || 0)

const DEFAULT_EXPENSES: { id: ExpenseCategory; label: string; defaultPrice: number }[] = [
  { id: 'tien-da', label: 'Tiền đá', defaultPrice: 30000 },
  { id: 'tien-mia', label: 'Tiền mía', defaultPrice: 50000 },
  { id: 'tien-rau-ma', label: 'Tiền rau má', defaultPrice: 30000 },
  { id: 'tien-tac', label: 'Tiền tắc', defaultPrice: 20000 },
  { id: 'tien-cam', label: 'Tiền cam', defaultPrice: 50000 },
  { id: 'tien-dua', label: 'Tiền dừa', defaultPrice: 50000 },
  { id: 'tien-ly', label: 'Tiền ly', defaultPrice: 20000 },
  { id: 'ong-hut', label: 'Tiền ống hút', defaultPrice: 10000 },
  { id: 'bich', label: 'Tiền bịch', defaultPrice: 10000 },
  { id: 'khac', label: 'Khác', defaultPrice: 0 },
]

const dynamicCategories = computed(() => {
  return DEFAULT_EXPENSES.map(cat => ({
    ...cat,
    defaultPrice: masterData.value.expensePrice[cat.id] ?? cat.defaultPrice
  }))
})

const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫']

function selectCategory(cat: typeof DEFAULT_EXPENSES[number]) {
  category.value = cat.id
  description.value = cat.label 
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
  // Giới hạn tối đa 9 ký tự (999.999.999đ) cho an toàn màn hình
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

async function submit() {
  if (!description.value.trim() || amountNumber.value <= 0) return
  
  try {
    await addTransaction('expense', description.value.trim(), amountNumber.value, category.value)
    showSuccess.value = true
    setTimeout(() => {
      amountStr.value = '0'
      description.value = ''
      category.value = 'khac'
      showSuccess.value = false
      router.push('/sales')
    }, 1500)
  } catch (error) {
    console.error(error)
    alert('Lỗi khi lưu khoản chi')
  }
}
</script>

<template>
  <div class="flex flex-col p-4 pb-20 max-w-lg mx-auto">
    <h2 class="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
      <PlusCircle class="text-red-600 w-7 h-7" />
      Nhập khoản chi
    </h2>

    <div v-if="showSuccess" class="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle2 class="w-10 h-10 text-green-600" />
      </div>
      <h2 class="text-2xl font-bold text-gray-800">Lưu thành công!</h2>
      <p class="text-gray-500 mt-2">Đang trở về Màn hình Bán Hàng...</p>
    </div>

    <div v-else class="flex flex-col">
      <!-- Danh mục (Kế thừa nguyên bản) -->
      <div class="mb-4">
        <label class="mb-2 block text-sm font-bold text-gray-600">Phân loại nhanh</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in dynamicCategories"
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
      <div class="mb-4">
        <label class="mb-2 block text-sm font-bold text-gray-600">Lý do chi chi tiết</label>
        <input
          v-model="description"
          type="text"
          placeholder="VD: Tiền đá, tiền điện..."
          class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-red-400 focus:outline-none"
        />
      </div>

      <!-- Số tiền hiển thị (Cơ chế nhập Numpad cũ) -->
      <div class="mb-3">
        <label class="mb-2 block text-sm font-bold text-gray-600">Số tiền xuất quỹ</label>
        <div class="flex items-center justify-between rounded-xl bg-gray-50 border-2 border-gray-200 px-4 py-3">
          <span class="text-3xl font-bold text-gray-800">{{ formatDisplay(amountNumber) }}</span>
          <button
            @click="clearAmount"
            class="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 active:bg-gray-300"
          >
            Xoá hết
          </button>
        </div>
      </div>

      <!-- Bàn phím số đặc sản -->
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

      <!-- Button lưu -->
      <button
        @click="submit"
        :disabled="!description.trim() || amountNumber <= 0"
        class="w-full flex justify-center items-center rounded-2xl py-4 text-xl font-bold text-white shadow-lg transition-colors min-h-[60px]"
        :class="description.trim() && amountNumber > 0
          ? 'bg-red-600 active:bg-red-700'
          : 'bg-gray-300 cursor-not-allowed'"
      >
        Lưu Phiếu Chi
      </button>
    </div>
  </div>
</template>
