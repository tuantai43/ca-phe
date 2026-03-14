<script setup lang="ts">
import { ref } from 'vue'
import SalesPage from './pages/SalesPage.vue'
import FinancePage from './pages/FinancePage.vue'
import ReportPage from './pages/ReportPage.vue'
import BottomNav from './components/BottomNav.vue'

const activeTab = ref('sales')
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <!-- Pages -->
    <SalesPage v-if="activeTab === 'sales'" />
    <FinancePage v-else-if="activeTab === 'finance'" />
    <ReportPage v-else-if="activeTab === 'report'" />

    <!-- Bottom Navigation -->
    <BottomNav :active-tab="activeTab" @navigate="activeTab = $event" />
  </div>
</template>
