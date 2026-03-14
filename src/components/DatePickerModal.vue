<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string   // yyyy-MM-dd
  min?: string         // yyyy-MM-dd
  max?: string         // yyyy-MM-dd
  title?: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  close: []
}>()

function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function toStr(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

const selected = parse(props.modelValue)
const viewMonth = ref(selected.getMonth())
const viewYear = ref(selected.getFullYear())

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']

// Calendar grid
interface DayCell { day: number; date: Date; str: string; inMonth: boolean; disabled: boolean; selected: boolean; today: boolean }

const days = computed<DayCell[]>(() => {
  const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1)
  const startDay = firstOfMonth.getDay() // 0=CN
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const daysInPrev = new Date(viewYear.value, viewMonth.value, 0).getDate()

  const now = new Date()
  const todayStr = toStr(now)
  const minDate = props.min ? parse(props.min) : null
  const maxDate = props.max ? parse(props.max) : null

  const cells: DayCell[] = []

  // Previous month fill
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(viewYear.value, viewMonth.value - 1, daysInPrev - i)
    const s = toStr(d)
    cells.push({
      day: daysInPrev - i, date: d, str: s, inMonth: false,
      disabled: (minDate && d < minDate) || (maxDate && d > maxDate) || false,
      selected: s === props.modelValue, today: s === todayStr,
    })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(viewYear.value, viewMonth.value, i)
    const s = toStr(d)
    cells.push({
      day: i, date: d, str: s, inMonth: true,
      disabled: (minDate && d < minDate) || (maxDate && d > maxDate) || false,
      selected: s === props.modelValue, today: s === todayStr,
    })
  }

  // Next month fill (complete the last week)
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(viewYear.value, viewMonth.value + 1, i)
      const s = toStr(d)
      cells.push({
        day: i, date: d, str: s, inMonth: false,
        disabled: (minDate && d < minDate) || (maxDate && d > maxDate) || false,
        selected: s === props.modelValue, today: s === todayStr,
      })
    }
  }

  return cells
})

function prevMonth() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}
function nextMonth() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

function selectDay(cell: DayCell) {
  if (cell.disabled) return
  emit('update:modelValue', cell.str)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" @click.self="emit('close')">
    <div class="w-[340px] rounded-3xl bg-white shadow-xl overflow-hidden">
      <!-- Title -->
      <div v-if="title" class="bg-amber-500 px-4 py-3">
        <div class="text-base font-bold text-white">{{ title }}</div>
      </div>

      <!-- Month/Year nav -->
      <div class="flex items-center justify-between px-3 pt-4 pb-2">
        <button @click="prevMonth" class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200">←</button>
        <span class="text-lg font-bold text-gray-800">{{ MONTHS[viewMonth] }} {{ viewYear }}</span>
        <button @click="nextMonth" class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold active:bg-gray-200">→</button>
      </div>

      <!-- Weekday headers -->
      <div class="grid grid-cols-7 px-3">
        <div v-for="wd in WEEKDAYS" :key="wd" class="py-2 text-center text-xs font-bold" :class="wd === 'CN' ? 'text-red-400' : 'text-gray-400'">
          {{ wd }}
        </div>
      </div>

      <!-- Day grid -->
      <div class="grid grid-cols-7 gap-1 px-3 pb-4">
        <button
          v-for="(cell, i) in days"
          :key="i"
          @click="selectDay(cell)"
          :disabled="cell.disabled"
          class="flex h-11 w-full items-center justify-center rounded-xl text-base font-semibold transition-colors"
          :class="[
            cell.selected
              ? 'bg-amber-500 text-white'
              : cell.today
                ? 'bg-amber-50 text-amber-700 border-2 border-amber-300'
                : cell.disabled
                  ? 'text-gray-200'
                  : cell.inMonth
                    ? 'text-gray-800 active:bg-gray-100'
                    : 'text-gray-300 active:bg-gray-50',
          ]"
        >
          {{ cell.day }}
        </button>
      </div>
    </div>
  </div>
</template>
