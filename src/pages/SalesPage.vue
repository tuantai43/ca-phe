<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MenuItem, Order, OrderType } from '../types'
import { menuItems } from '../data/menu'
import { useTransactions } from '../composables/useTransactions'
import OrderTabs from '../components/OrderTabs.vue'
import NewOrderModal from '../components/NewOrderModal.vue'
import MenuCard from '../components/MenuCard.vue'
import CartPanel from '../components/CartPanel.vue'

const { addTransaction } = useTransactions()

const orders = ref<Order[]>([])
const activeOrderId = ref<string | null>(null)
const showNewOrderModal = ref(false)

let orderCounter = 0

const activeOrder = computed(() =>
  orders.value.find(o => o.id === activeOrderId.value) ?? null
)

const activeTotal = computed(() => {
  const order = activeOrder.value
  if (!order) return 0
  const priceKey = order.type === 'takeaway' ? 'priceTakeaway' : 'priceHammock'
  return order.items.reduce((sum, item) => sum + item.menuItem[priceKey] * item.quantity, 0)
})

const usedHammocks = computed(() =>
  orders.value.flatMap(o => o.hammocks)
)

function createOrder(type: OrderType, hammocks: number[]) {
  orderCounter++
  const newOrder: Order = {
    id: 'order-' + orderCounter,
    type,
    hammocks,
    items: [],
    createdAt: Date.now(),
  }
  orders.value.push(newOrder)
  activeOrderId.value = newOrder.id
  showNewOrderModal.value = false
}

function addToCart(item: MenuItem) {
  const order = activeOrder.value
  if (!order) return
  const existing = order.items.find(c => c.menuItem.id === item.id)
  if (existing) {
    existing.quantity++
  } else {
    order.items.push({ menuItem: item, quantity: 1 })
  }
}

function increment(index: number) {
  const order = activeOrder.value
  if (!order) return
  order.items[index].quantity++
}

function decrement(index: number) {
  const order = activeOrder.value
  if (!order) return
  if (order.items[index].quantity > 1) {
    order.items[index].quantity--
  } else {
    order.items.splice(index, 1)
  }
}

function removeItem(index: number) {
  activeOrder.value?.items.splice(index, 1)
}

function clearCart() {
  const order = activeOrder.value
  if (order) order.items = []
}

function getItemQuantity(itemId: string): number {
  const order = activeOrder.value
  if (!order) return 0
  return order.items.find(c => c.menuItem.id === itemId)?.quantity ?? 0
}

function getOrderLabel(order: Order): string {
  if (order.type === 'takeaway') return 'Mang đi'
  return 'Võng ' + order.hammocks.join(', ')
}

async function confirmOrder() {
  const order = activeOrder.value
  if (!order || order.items.length === 0) return
  // Lưu giao dịch thu
  const items = order.items.map(i => ({ name: i.menuItem.name, quantity: i.quantity }))
  const total = activeTotal.value
  await addTransaction('income', 'Đơn ' + getOrderLabel(order), total, undefined, items, order.type)
  alert(`Đã thu ${total.toLocaleString('vi-VN')}đ`)
  // Xoá đơn khỏi danh sách
  const idx = orders.value.findIndex(o => o.id === order.id)
  if (idx >= 0) orders.value.splice(idx, 1)
  // Chuyển sang đơn khác hoặc null
  activeOrderId.value = orders.value.length > 0 ? orders.value[0].id : null
}
</script>

<template>
  <div class="flex flex-col pb-8">
    <!-- Order tabs -->
    <OrderTabs
      :orders="orders"
      :active-order-id="activeOrderId"
      @select="activeOrderId = $event"
      @new-order="showNewOrderModal = true"
    />

    <!-- No order selected -->
    <div v-if="!activeOrder" class="flex flex-col items-center justify-center gap-4 py-20 px-4">
      <span class="text-5xl">☕</span>
      <p class="text-xl text-gray-400">Bấm "+ Đơn mới" để bắt đầu</p>
    </div>

    <!-- Active order content -->
    <div v-else class="flex flex-col gap-6 p-4">
      <!-- Menu grid -->
      <div class="grid grid-cols-2 gap-3">
        <MenuCard
          v-for="item in menuItems"
          :key="item.id"
          :item="item"
          :order-type="activeOrder.type"
          :quantity="getItemQuantity(item.id)"
          @add="addToCart"
        />
      </div>

      <!-- Divider -->
      <hr class="border-gray-200" />

      <!-- Cart -->
      <CartPanel
        :items="activeOrder.items"
        :total="activeTotal"
        :order-type="activeOrder.type"
        @confirm="confirmOrder"
        @clear="clearCart"
        @increment="increment"
        @decrement="decrement"
        @remove-item="removeItem"
      />
    </div>

    <!-- New order modal -->
    <NewOrderModal
      v-if="showNewOrderModal"
      :used-hammocks="usedHammocks"
      @create="createOrder"
      @close="showNewOrderModal = false"
    />
  </div>
</template>
