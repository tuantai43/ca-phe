<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OrderType } from '../types'
import { menuItems } from '../data/menu'
import { useTransactionActions } from '../composables/useTransactions'
import { useCartStore } from '../composables/useCartStore'
import OrderTabs from '../components/OrderTabs.vue'
import NewOrderModal from '../components/NewOrderModal.vue'
import MenuCard from '../components/MenuCard.vue'
import CartPanel from '../components/CartPanel.vue'
import { Coffee } from 'lucide-vue-next'
import { useMasterData } from '../composables/useMasterData'

const { addTransaction } = useTransactionActions()
const { masterData } = useMasterData()
const cartStore = useCartStore()

const showNewOrderModal = ref(false)

const activeTotal = computed(() => {
  const order = cartStore.activeOrder.value
  if (!order) return 0
  const priceKey = order.type === 'takeaway' ? 'priceTakeaway' : 'priceHammock'
  return order.items.reduce((sum, item) => sum + item.menuItem[priceKey] * item.quantity, 0)
})

const dynamicMenuItems = computed(() => {
  return menuItems.map(item => ({
    ...item,
    priceTakeaway: masterData.value.menuPrice[item.id] ?? item.priceTakeaway,
    priceHammock: masterData.value.menuHammockPrice[item.id] ?? item.priceHammock
  }))
})

function createOrder(type: OrderType, hammocks: number[]) {
  cartStore.createOrder(type, hammocks)
  showNewOrderModal.value = false
}

function getOrderLabel(type: OrderType, hammocks: number[]): string {
  if (type === 'takeaway') return 'Mang đi'
  return 'Võng ' + hammocks.join(', ')
}

const isSubmitting = computed(() => {
  const order = cartStore.activeOrder.value
  return order ? cartStore.isSubmitting(order.id) : false
})

async function confirmOrder() {
  const order = cartStore.activeOrder.value
  if (!order || order.items.length === 0) return
  
  // Chặn double-submit
  if (cartStore.isSubmitting(order.id)) return
  cartStore.setSubmitting(order.id, true)
  
  try {
    // Lưu giao dịch thu
    const priceKey = order.type === 'takeaway' ? 'priceTakeaway' : 'priceHammock'
    const items = order.items.map(i => ({ 
      name: i.menuItem.name, 
      quantity: i.quantity,
      price: i.menuItem[priceKey]
    }))
    const total = activeTotal.value
    
    await addTransaction('income', 'Đơn ' + getOrderLabel(order.type, order.hammocks), total, undefined, items, order.type)
    alert(`Đã thu ${total.toLocaleString('vi-VN')}đ`)
    
    // Remove committed order from cart store
    cartStore.removeOrder(order.id)
  } catch (error) {
    console.error(error)
    alert('Lỗi khi lưu đơn hàng, vui lòng thử lại')
    cartStore.setSubmitting(order.id, false)
  }
}
</script>

<template>
  <div class="flex flex-col pb-8">
    <!-- Order tabs -->
    <OrderTabs
      :orders="cartStore.orders.value"
      :active-order-id="cartStore.activeOrderId.value"
      @select="cartStore.activeOrderId.value = $event"
      @new-order="showNewOrderModal = true"
    />

    <!-- No order selected -->
    <div v-if="!cartStore.activeOrder.value" class="flex flex-col items-center justify-center gap-4 py-20 px-4">
      <Coffee class="w-12 h-12 text-gray-300" stroke-width="2" />
      <p class="text-xl text-gray-400">Bấm "+ Đơn mới" để bắt đầu</p>
    </div>

    <!-- Active order content -->
    <div v-else class="flex flex-col gap-6 p-4">
      <!-- Menu grid -->
      <div class="grid grid-cols-2 gap-3">
        <MenuCard
          v-for="item in dynamicMenuItems"
          :key="item.id"
          :item="item"
          :order-type="cartStore.activeOrder.value.type"
          :quantity="cartStore.getItemQuantity(item.id)"
          @add="cartStore.addToCart"
        />
      </div>

      <!-- Divider -->
      <hr class="border-gray-200" />

      <!-- Cart -->
      <CartPanel
        :items="cartStore.activeOrder.value.items"
        :total="activeTotal"
        :order-type="cartStore.activeOrder.value.type"
        :is-submitting="isSubmitting"
        @confirm="confirmOrder"
        @clear="cartStore.clearCart"
        @increment="cartStore.increment"
        @decrement="cartStore.decrement"
        @remove-item="cartStore.removeItem"
      />
    </div>

    <!-- New order modal -->
    <NewOrderModal
      v-if="showNewOrderModal"
      :used-hammocks="cartStore.usedHammocks.value"
      @create="createOrder"
      @close="showNewOrderModal = false"
    />
  </div>
</template>
