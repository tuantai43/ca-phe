<script setup lang="ts">
defineProps<{
  activeTab: string
}>()

defineEmits<{
  navigate: [tab: string]
}>()

const tabs = [
  { id: 'sales', label: 'Bán hàng', icon: '🛒' },
  { id: 'finance', label: 'Thu/Chi', icon: '💰' },
  { id: 'report', label: 'Báo cáo', icon: '📊' },
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 flex border-t-2 border-gray-200 bg-white">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="$emit('navigate', tab.id)"
      class="flex flex-1 flex-col items-center gap-1 py-3 transition-colors min-h-[60px]"
      :class="activeTab === tab.id ? 'bg-amber-50 text-amber-800' : 'text-gray-500'"
    >
      <span class="text-2xl">{{ tab.icon }}</span>
      <span class="text-sm font-semibold">{{ tab.label }}</span>
    </button>
  </nav>
</template>
