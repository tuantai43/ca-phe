<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { Coffee } from 'lucide-vue-next'

const { loginWithGoogle } = useAuth()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border-t-4 border-amber-500">
      <div class="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4 text-4xl">
        <Coffee class="w-10 h-10 text-amber-600" stroke-width="2.5" />
      </div>
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Cà Phê Quản lý</h2>
      <p class="text-gray-500 mb-8">Vui lòng đăng nhập để tiếp tục</p>
      
      <button 
        @click="loginWithGoogle" 
        class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-amber-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all shadow-sm"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" class="w-6 h-6" />
        Đăng nhập với Google
      </button>
    </div>
  </div>
</template>
