<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { History, ArrowLeft, ArrowRight, User, Clock, Search } from 'lucide-vue-next'

const router = useRouter()
const logs = ref<any[]>([])
const loading = ref(true)

async function fetchLogs() {
  loading.value = true
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100))
    const snap = await getDocs(q)
    logs.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    console.error('Fetch logs error:', e)
  } finally {
    loading.value = false
  }
}

function formatTime(ts: any) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('vi-VN')
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto pb-24">
    <!-- Header đồng bộ -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push('/admin')" class="p-2 rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div class="flex items-center gap-2">
        <History class="w-7 h-7 text-amber-600" />
        <h1 class="text-2xl font-bold text-gray-800">Nhật Ký Thao Tác</h1>
      </div>
      <div class="flex-1"></div>
      <button @click="fetchLogs" title="Làm mới" class="text-amber-600 hover:text-amber-800 p-2 bg-white rounded-xl shadow-sm border border-amber-100 transition-colors">
        <Search class="w-5 h-5" :class="{'animate-spin': loading}" />
      </button>
    </div>

    <!-- Content -->
    <div v-if="loading" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-2"></div>
      <p>Đang tải dữ liệu kiểm toán...</p>
    </div>

    <div v-else-if="logs.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
      Chưa có thao tác nào được ghi nhận.
    </div>

    <div v-else class="space-y-4">
      <div v-for="log in logs" :key="log.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Log header -->
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 text-xs font-bold rounded-md" :class="log.action === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
              {{ log.action === 'DELETE' ? 'XOÁ GIAO DỊCH' : 'SỬA GIAO DỊCH' }}
            </span>
            <span class="text-sm font-semibold text-gray-600 flex items-center gap-1"><User class="w-3 h-3"/> {{ log.userEmail }}</span>
          </div>
          <span class="text-xs text-gray-500 flex items-center gap-1"><Clock class="w-3 h-3"/> {{ formatTime(log.timestamp) }}</span>
        </div>
        
        <!-- Log body (Diffing) -->
        <div class="p-4 flex flex-col md:flex-row gap-4">
          <!-- Cũ -->
          <div class="flex-1 rounded-lg border border-red-100 bg-red-50/30 p-3" v-if="log.oldData">
            <div class="text-xs font-bold text-red-800 mb-2 uppercase">Dữ liệu Cũ</div>
            <div class="text-sm">
              <span class="font-semibold">{{ log.oldData.description }}</span>
              <div class="font-bold text-red-600 mt-1">{{ log.oldData.amount?.toLocaleString('vi-VN') }}đ</div>
            </div>
            <!-- Order Items Detail in Old Data -->
            <div v-if="log.oldData.orderItems?.length > 0" class="mt-2 pt-2 border-t border-red-200/50 flex flex-wrap gap-1">
              <span v-for="(oi, idx) in log.oldData.orderItems" :key="'o'+idx" class="text-[11px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                {{ oi.name }} x{{ oi.quantity }}
              </span>
            </div>
          </div>
          
          <div class="hidden md:flex items-center justify-center text-gray-300" v-if="log.action === 'UPDATE'">
            <ArrowRight class="w-5 h-5" />
          </div>

          <!-- Mới -->
          <div class="flex-1 rounded-lg border border-green-100 bg-green-50/30 p-3" v-if="log.newData && log.action === 'UPDATE'">
            <div class="text-xs font-bold text-green-800 mb-2 uppercase">Dữ liệu Mới</div>
            <div class="text-sm">
              <span class="font-semibold">{{ log.newData.description }}</span>
              <div class="font-bold text-green-600 mt-1">{{ log.newData.amount?.toLocaleString('vi-VN') }}đ</div>
            </div>
             <!-- Order Items Detail in New Data -->
            <div v-if="log.newData.orderItems?.length > 0" class="mt-2 pt-2 border-t border-green-200/50 flex flex-wrap gap-1">
              <span v-for="(oi, idx) in log.newData.orderItems" :key="'n'+idx" class="text-[11px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                {{ oi.name }} x{{ oi.quantity }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
