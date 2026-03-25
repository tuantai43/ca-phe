<script setup lang="ts">
import { Lock } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const { currentUser, logout } = useAuth()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
      <div class="mb-4 text-red-500 flex justify-center">
        <Lock class="w-16 h-16" stroke-width="2" />
      </div>
      <h2 class="text-2xl font-bold text-red-600 mb-2">Truy cập bị từ chối</h2>
      <p class="text-gray-600 mb-6 font-medium">
        Xin chào <b>{{ currentUser?.displayName }}</b>, tài khoản của bạn đang là <b class="text-amber-600">Guest</b> và
        chưa được cấp quyền để sử dụng hệ thống.
      </p>

      <button @click="logout"
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors w-full">
        Đăng xuất
      </button>

    </div>
  </div>
</template>
