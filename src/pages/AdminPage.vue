<script setup lang="ts">
import { useAuth } from '../composables/useAuth';
import { BarChart3, ChevronRight, Users, Banknote, History, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const { isAdmin, hasRole, currentUser, logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
    await logout();
    router.push('/login');
  }
}
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto pb-24">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Menu Hệ thống</h2>
    </div>

    <div class="flex flex-col gap-3">
      <!-- Bảng Giá Hệ Thống -->
      <router-link
        to="/admin/settings"
        v-if="isAdmin()"
        class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-amber-200 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-amber-50 p-2">
            <Banknote class="w-6 h-6 text-amber-600" />
          </div>
          <span class="font-bold text-gray-800 text-lg">Bảng Giá Đề Xuất</span>
        </div>
        <ChevronRight class="w-5 h-5 text-gray-400" />
      </router-link>

      <!-- Báo cáo Thống kê -->
      <button 
        v-if="hasRole('view_reports')" 
        @click="router.push('/report')" 
        class="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 active:bg-amber-50 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-amber-50 p-2">
            <BarChart3 class="w-6 h-6 text-amber-600" />
          </div>
          <span class="font-bold text-gray-800 text-lg">Báo Cáo Kế Toán</span>
        </div>
        <ChevronRight class="w-5 h-5 text-gray-400" />
      </button>

      <!-- Quản Lý Người Dùng -->
      <button 
        v-if="hasRole('manage_roles')" 
        @click="router.push('/admin/roles')" 
        class="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 active:bg-amber-50 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-amber-50 p-2">
            <Users class="w-6 h-6 text-amber-600" />
          </div>
          <span class="font-bold text-gray-800 text-lg">Phân Quyền Nhân Sự</span>
        </div>
        <ChevronRight class="w-5 h-5 text-gray-400" />
      </button>

      <!-- Nhật Ký Kiểm Toán (Logs) -->
      <button 
        v-if="isAdmin()" 
        @click="router.push('/admin/audit')" 
        class="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 active:bg-amber-50 transition-colors"
      >
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-gray-100 p-2 border border-gray-200">
            <History class="w-6 h-6 text-gray-600" />
          </div>
          <span class="font-bold text-gray-800 text-lg">Nhật Ký Thao Tác (Audit)</span>
        </div>
        <ChevronRight class="w-5 h-5 text-gray-400" />
      </button>
    </div>

    <!-- User Info & Logout -->
    <div v-if="currentUser" class="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-red-100 gap-4">
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <img :src="currentUser.photoURL || 'https://www.gravatar.com/avatar/?d=mp'" 
             class="w-12 h-12 rounded-full border-2 border-red-100" />
        <div class="flex flex-col min-w-0 flex-1">
          <span class="font-bold text-gray-800 truncate">{{ currentUser.displayName || 'Nhân viên' }}</span>
          <span class="text-sm text-gray-500 truncate">{{ currentUser.email }}</span>
        </div>
      </div>
      <button 
        @click="handleLogout" 
        class="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 active:bg-red-200 transition-colors border border-red-100 shadow-sm"
      >
        <LogOut class="w-5 h-5" /> Đăng Xuất
      </button>
    </div>
  </div>
</template>
