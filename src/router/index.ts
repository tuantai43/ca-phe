import { createRouter, createWebHistory } from 'vue-router'
import { waitForAuthInit, useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginScreen.vue'),
    meta: { public: true }
  },
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('../components/AccessDenied.vue'),
    meta: { requireAuth: true, public: true } // Vẫn cần đăng nhập để thấy được thông báo Guest
  },
  {
    path: '/',
    alias: '/sales',
    name: 'Sales',
    component: () => import('../pages/SalesPage.vue'),
    meta: { requireAuth: true, roles: ['member'] } // Hoặc Admin tự động được uỷ quyền bên trong hasRole
  },
  {
    path: '/expense',
    name: 'Expense',
    component: () => import('../pages/ExpensePage.vue'),
    meta: { requireAuth: true, roles: ['member'] }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('../pages/ReportPage.vue'),
    meta: { requireAuth: true, roles: ['view_reports'] }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/AdminPage.vue'),
    meta: { requireAuth: true, roles: ['manage_roles'] } // Thực ra bất kỳ role ẩn nào vào admin cũng định tuyến
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { requireAuth: true, roles: ['admin'] } // Root Admin only
  },
  {
    path: '/admin/roles',
    name: 'ManageRoles',
    component: () => import('../pages/ManageRolesPage.vue'),
    meta: { requireAuth: true, roles: ['manage_roles'] }
  },
  {
    path: '/admin/audit',
    name: 'Audit',
    component: () => import('../pages/AuditPage.vue'),
    meta: { requireAuth: true, roles: ['admin'] } // Root Admin only
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Chốt chặn bảo mật (Navigation Guards)
router.beforeEach(async (to, _from) => {
  // Đảm bảo state auth từ Firebase đã có trước khi check
  await waitForAuthInit()

  const { currentUser, isGuest, hasRole } = useAuth()
  const isAuthRequired = to.meta.requireAuth

  // Chưa đăng nhập mà vào route ẩn -> Đá về login
  if (isAuthRequired && !currentUser.value) {
    return '/login'
  }

  // Đã đăng nhập mà cố vào /login -> Đá về home
  if (to.path === '/login' && currentUser.value) {
    return '/'
  }

  // Chặn khách hàng chưa có quyền xâm nhập sâu (trừ trang access-denied)
  if (isAuthRequired && isGuest() && to.path !== '/access-denied') {
    return '/access-denied'
  }

  // Kiểm tra Role cho từng Route cụ thể
  if (to.meta.roles) {
    const routeRoles = to.meta.roles as string[]
    // Nếu user có ÍT NHẤT MỘT role trong mảng yêu cầu
    const hasPermission = routeRoles.some(role => hasRole(role))
    if (!hasPermission) {
      // Đá về / hoặc /access-denied nếu không đủ quyền
      return isGuest() ? '/access-denied' : '/'
    }
  }

  // Nếu là Member nhưng cố vào /access-denied
  if (to.path === '/access-denied' && !isGuest() && currentUser.value) {
    return '/'
  }

  // Hợp lệ, cho phép qua
  return true
})

export default router
