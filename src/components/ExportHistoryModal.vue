<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '../composables/useTransactions'
import DatePickerModal from './DatePickerModal.vue'

const emit = defineEmits<{ close: [] }>()
const { allTransactions } = useTransactions()

const now = new Date()

// yyyy-MM-dd format for native date input
function toInputDate(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
function fromInputDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Default: đầu tháng → hôm nay
const startStr = ref(toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)))
const endStr = ref(toInputDate(now))
const todayStr = toInputDate(now)

const startDate = computed(() => fromInputDate(startStr.value))
const endDate = computed(() => fromInputDate(endStr.value))

const showStartPicker = ref(false)
const showEndPicker = ref(false)

// Filtered transactions
function inRange(ts: number): boolean {
  const d = new Date(ts)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return day >= startDate.value && day <= endDate.value
}

const filtered = computed(() =>
  allTransactions.value
    .filter(t => inRange(t.createdAt))
    .sort((a, b) => a.createdAt - b.createdAt)
)

function formatDate(d: Date): string {
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateShort(d: Date): string {
  return String(d.getDate()).padStart(2, '0') + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + d.getFullYear()
}

function exportCSV() {
  if (filtered.value.length === 0) return

  const BOM = '\uFEFF'
  const header = 'Ngày,Giờ,Loại,Mô tả,Danh mục,Số tiền\n'
  const rows = filtered.value.map(t => {
    const d = new Date(t.createdAt)
    const date = formatDate(d)
    const time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
    const type = t.type === 'income' ? 'Thu' : 'Chi'
    const desc = csvEscape(t.description)
    const cat = t.category ?? ''
    const amount = t.amount.toString()
    return `${date},${time},${type},${desc},${cat},${amount}`
  }).join('\n')

  const csv = BOM + header + rows
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `thu-chi_${formatDateShort(startDate.value)}_${formatDateShort(endDate.value)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  emit('close')
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}
</script>

<template>
  <div class="fixed inset-0 z-60 flex items-end justify-center bg-black/40" @click.self="emit('close')">
    <div class="w-full max-w-lg rounded-t-3xl bg-white pb-6">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-800">📤 Xuất lịch sử CSV</h2>
        <button @click="emit('close')" class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg active:bg-gray-200">✕</button>
      </div>

      <div class="flex flex-col gap-4 p-4">
        <!-- Start date -->
        <div>
          <label class="text-base font-semibold text-gray-600 mb-2 block">Từ ngày</label>
          <button
            @click="showStartPicker = true"
            class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-bold text-gray-800 bg-white text-left active:border-amber-500"
          >
            📅 {{ formatDate(startDate) }}
          </button>
        </div>

        <!-- End date -->
        <div>
          <label class="text-base font-semibold text-gray-600 mb-2 block">Đến ngày</label>
          <button
            @click="showEndPicker = true"
            class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-bold text-gray-800 bg-white text-left active:border-amber-500"
          >
            📅 {{ formatDate(endDate) }}
          </button>
        </div>

        <!-- Preview count -->
        <div class="rounded-xl bg-gray-50 px-4 py-3 text-center">
          <span class="text-lg font-bold" :class="filtered.length > 0 ? 'text-gray-800' : 'text-gray-400'">
            {{ filtered.length > 0 ? `Tìm thấy ${filtered.length} giao dịch` : 'Không có giao dịch nào' }}
          </span>
        </div>

        <!-- Export button -->
        <button
          @click="exportCSV"
          :disabled="filtered.length === 0"
          class="w-full rounded-2xl py-4 text-xl font-bold shadow-lg min-h-[60px]"
          :class="filtered.length > 0
            ? 'bg-green-600 text-white active:bg-green-700'
            : 'bg-gray-200 text-gray-400'"
        >
          📤 Xuất CSV ({{ filtered.length }})
        </button>
      </div>
    </div>

    <!-- Date pickers -->
    <DatePickerModal
      v-if="showStartPicker"
      :modelValue="startStr"
      @update:modelValue="startStr = $event"
      @close="showStartPicker = false"
      :max="endStr"
      title="Từ ngày"
    />
    <DatePickerModal
      v-if="showEndPicker"
      :modelValue="endStr"
      @update:modelValue="endStr = $event"
      @close="showEndPicker = false"
      :min="startStr"
      :max="todayStr"
      title="Đến ngày"
    />
  </div>
</template>
