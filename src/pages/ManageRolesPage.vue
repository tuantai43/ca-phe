<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth';
import { RefreshCw, ShieldAlert, UserCheck, ArrowLeft, Users } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const { isAdmin } = useAuth();
const router = useRouter();
const users = ref<any[]>([]);
const loading = ref(true);

const AVAILABLE_ROLES = [
  { id: 'member', name: 'Bán hàng / Ghi chi' },
  { id: 'edit_orders', name: 'Sửa/Xóa đơn' },
  { id: 'view_reports', name: 'Xem Sổ Sách' },
  { id: 'manage_reports', name: 'Xuất/Lưu Báo cáo' }
];

const loadUsers = async () => {
  loading.value = true;
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error loading users:", error);
    alert('Lỗi khi tải danh sách người dùng! Kiểm tra kết nối mạng (hoặc bạn chưa cấp quyền Admin cho chính mình).');
  } finally {
    loading.value = false;
  }
};

const toggleRole = async (user: any, roleId: string) => {
  if (!isAdmin()) {
    alert("Chỉ tài khoản Root Admin mới có quyền đổi role!");
    return;
  }

  const currentRoles = user.roles || [];
  const hasRole = currentRoles.includes(roleId);
  const newRoles = hasRole 
    ? currentRoles.filter((r: string) => r !== roleId)
    : [...currentRoles, roleId];
    
  // Optimistic update
  user.roles = newRoles;
  
  try {
    await updateDoc(doc(db, 'users', user.id), {
      roles: newRoles
    });
  } catch (error) {
    console.error("Error updating roles:", error);
    alert('Lỗi khi cập nhật quyền! Đảm bảo bạn là Root Admin.');
    // Revert on error
    user.roles = currentRoles;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto pb-24">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push('/admin')" title="Quay lại" class="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div class="flex items-center gap-2">
        <Users class="w-7 h-7 text-amber-600" />
        <h1 class="text-2xl font-bold text-gray-800">Quản Trị Nhân Sự</h1>
      </div>
      <div class="flex-1"></div>
      <button @click="loadUsers" title="Làm mới danh sách" class="text-amber-600 hover:text-amber-800 p-2 bg-white rounded-full shadow-sm border border-amber-100 transition-colors">
        <RefreshCw class="w-5 h-5" :class="{'animate-spin': loading}" />
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-2"></div>
      <p>Đang tải danh sách...</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="user in users" :key="user.id" class="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
          <img :src="user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'" 
               class="w-14 h-14 rounded-full border-2 border-amber-100" />
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-800 text-lg truncate">{{ user.displayName || 'Khách' }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ user.email }}</p>
          </div>
          <div v-if="user.roles?.includes('admin')" class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 shrink-0 flex items-center gap-1">
            <ShieldAlert class="w-3 h-3" /> ROOT ADMIN
          </div>
          <div v-else-if="!user.roles || user.roles.length === 0" class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 shrink-0 flex items-center gap-1">
            <UserCheck class="w-3 h-3" /> GUEST
          </div>
        </div>
        
        <div v-if="!user.roles?.includes('admin')" class="flex flex-wrap gap-2">
          <button 
            v-for="role in AVAILABLE_ROLES" 
            :key="role.id"
            @click="toggleRole(user, role.id)"
            class="text-xs px-3 py-2 rounded-lg border transition-all select-none"
            :disabled="!isAdmin()"
            :class="[
              user.roles?.includes(role.id) 
                ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold shadow-inner' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
              !isAdmin() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
          >
            {{ role.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
