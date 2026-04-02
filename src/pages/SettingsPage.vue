<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMasterData, type MasterData } from '../composables/useMasterData'
import { menuItems } from '../data/menu'
import { Banknote, Save, ArrowLeft, CheckCircle2, Pencil } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import PriceEditModal from '../components/PriceEditModal.vue'

const { masterData, updateMasterData } = useMasterData()
const router = useRouter()

const loading = ref(false)
const showSuccess = ref(false)

const localMenuTakeaway = ref<Record<string, number>>({})
const localMenuHammock = ref<Record<string, number>>({})
const localExpense = ref<Record<string, number>>({})

const DEFAULT_EXPENSES = [
  { id: 'tien-da', label: 'Tiền đá', defaultPrice: 30000 },
  { id: 'tien-mia', label: 'Tiền mía', defaultPrice: 50000 },
  { id: 'tien-rau-ma', label: 'Tiền rau má', defaultPrice: 30000 },
  { id: 'tien-tac', label: 'Tiền tắc', defaultPrice: 20000 },
  { id: 'tien-cam', label: 'Tiền cam', defaultPrice: 50000 },
  { id: 'tien-dua', label: 'Tiền dừa', defaultPrice: 50000 },
  { id: 'tien-ly', label: 'Tiền ly', defaultPrice: 20000 },
  { id: 'ong-hut', label: 'Tiền ống hút', defaultPrice: 10000 },
  { id: 'bich', label: 'Tiền bịch', defaultPrice: 10000 },
]

// Modal State
const editingTarget = ref<{
  type: 'menuTakeaway' | 'menuHammock' | 'expense',
  id: string,
  title: string,
  amount: number
} | null>(null)

function openEdit(type: 'menuTakeaway' | 'menuHammock' | 'expense', id: string, title: string, amount: number) {
  editingTarget.value = { type, id, title, amount }
}

function handleSave(newAmount: number) {
  if (!editingTarget.value) return
  const { type, id } = editingTarget.value
  if (type === 'menuTakeaway') localMenuTakeaway.value[id] = newAmount
  if (type === 'menuHammock') localMenuHammock.value[id] = newAmount
  if (type === 'expense') localExpense.value[id] = newAmount
  editingTarget.value = null
}

watch(masterData, (newVal) => {
  localMenuTakeaway.value = { ...newVal.menuPrice }
  localMenuHammock.value = { ...newVal.menuHammockPrice }
  localExpense.value = { ...newVal.expensePrice }

  // Populate defaults for UI if missing
  menuItems.forEach(item => {
    if (localMenuTakeaway.value[item.id] === undefined) localMenuTakeaway.value[item.id] = item.priceTakeaway
    if (localMenuHammock.value[item.id] === undefined) localMenuHammock.value[item.id] = item.priceHammock
  })
  DEFAULT_EXPENSES.forEach(exp => {
    if (localExpense.value[exp.id] === undefined) localExpense.value[exp.id] = exp.defaultPrice
  })
}, { deep: true, immediate: true })

async function submit() {
  loading.value = true
  const payload: MasterData = {
    menuPrice: localMenuTakeaway.value,
    menuHammockPrice: localMenuHammock.value,
    expensePrice: localExpense.value
  }
  
  try {
    await updateMasterData(payload)
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (error) {
    console.error(error)
    alert('Lỗi cập nhật bảng giá')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 pb-20 max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-2">
      <button @click="router.back()" class="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div class="flex items-center gap-2">
        <Banknote class="w-7 h-7 text-amber-600" />
        <h1 class="text-2xl font-bold text-gray-800">Bảng Giá Hệ Thống</h1>
      </div>
    </div>

    <!-- Alert Success -->
    <div v-if="showSuccess" class="rounded-xl bg-green-100 border border-green-200 p-4 flex items-center justify-center gap-2 text-green-700 font-bold animate-in fade-in slide-in-from-top-4">
      <CheckCircle2 class="w-6 h-6" /> Đã cập nhật giá mới cho toàn hệ thống!
    </div>

    <div class="flex flex-col gap-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h2 class="text-lg font-bold text-amber-700 border-b pb-2">Đơn Giá Món (Menu)</h2>
      <div class="flex flex-col gap-4">
        <div v-for="item in menuItems" :key="item.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl leading-none">{{ item.icon }}</span>
            <span class="font-semibold text-gray-800 text-lg">{{ item.name }}</span>
          </div>
          <div class="flex flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <div class="flex flex-col flex-1 sm:w-32">
              <label class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Mang đi</label>
              <button @click="openEdit('menuTakeaway', item.id, item.name + ' (Mang đi)', localMenuTakeaway[item.id])" class="flex items-center justify-between w-full rounded-lg border-2 border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors active:border-amber-400">
                <span class="text-sm font-bold text-gray-800">{{ localMenuTakeaway[item.id]?.toLocaleString('vi-VN') }}đ</span>
                <Pencil class="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div class="flex flex-col flex-1 sm:w-32">
              <label class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Tại võng</label>
              <button @click="openEdit('menuHammock', item.id, item.name + ' (Tại võng)', localMenuHammock[item.id])" class="flex items-center justify-between w-full rounded-lg border-2 border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors active:border-amber-400">
                <span class="text-sm font-bold text-gray-800">{{ localMenuHammock[item.id]?.toLocaleString('vi-VN') }}đ</span>
                <Pencil class="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h2 class="text-lg font-bold text-red-600 border-b pb-2">Giá Đề Xuất Khoản Chi</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="exp in DEFAULT_EXPENSES" :key="exp.id" class="flex items-center justify-between gap-3 border-b md:border-none border-gray-50 pb-3 md:pb-0">
          <span class="font-medium text-gray-700 text-base">{{ exp.label }}</span>
          <button @click="openEdit('expense', exp.id, exp.label, localExpense[exp.id])" class="flex flex-1 max-w-[140px] items-center justify-between rounded-lg border-2 border-gray-200 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors active:border-red-400">
            <span class="text-sm font-bold text-gray-800">{{ localExpense[exp.id]?.toLocaleString('vi-VN') }}đ</span>
            <Pencil class="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </div>

    <button
      @click="submit"
      :disabled="loading"
      class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-xl font-bold text-white shadow-lg transition-colors active:bg-amber-700 disabled:opacity-50 min-h-[60px]"
    >
      <span v-if="loading" class="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
      <template v-else><Save class="w-6 h-6" /> Cập nhật bảng giá</template>
    </button>

    <!-- Numpad Modal -->
    <PriceEditModal
      v-if="editingTarget"
      :title="'Thay đổi giá: ' + editingTarget.title"
      :initial-amount="editingTarget.amount"
      @save="handleSave"
      @close="editingTarget = null"
    />
  </div>
</template>
