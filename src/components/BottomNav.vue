<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingCart, Banknote, Settings } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { hasRole } = useAuth()
const router = useRouter()

const tabs = computed(() => {
  const allTabs = [
    { path: '/sales', label: 'Bán hàng', icon: ShoppingCart, show: hasRole('member') },
    { path: '/expense', label: 'Khoản chi', icon: Banknote, show: hasRole('member') },
    { path: '/admin', label: 'Menu', icon: Settings, show: hasRole('manage_roles') || hasRole('view_reports') },
  ]
  return allTabs.filter(t => t.show)
})
</script>

<template>
  <nav class="flex w-full bg-white pb-safe">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      @click="router.push(tab.path)"
      class="flex flex-1 flex-col items-center gap-1 py-3 transition-colors min-h-[60px]"
      :class="($route?.path === tab.path || ($route?.path === '/' && tab.path === '/sales')) ? 'bg-amber-50 text-amber-800' : 'text-gray-500 hover:text-amber-600'"
    >
      <component :is="tab.icon" class="w-6 h-6 mb-1" stroke-width="2.5" />
      <span class="text-sm font-semibold">{{ tab.label }}</span>
    </button>
  </nav>
</template>
