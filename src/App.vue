<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import BottomNav from './components/BottomNav.vue'

const { isLoadingAuth } = useAuth()
</script>

<template>
  <div v-if="isLoadingAuth" class="flex h-screen items-center justify-center bg-gray-50">
    <div class="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent shadow-lg" />
  </div>
  
  <div v-else class="flex flex-col h-screen bg-gray-50 relative">
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
    
    <!-- Hide navigation on login/denied screens -->
    <BottomNav v-if="!['/login', '/access-denied'].includes($route?.path)" class="flex-none shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-10" />
  </div>
</template>
