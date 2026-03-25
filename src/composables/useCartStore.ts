import { ref, computed } from 'vue'
import type { Order, OrderType, MenuItem } from '../types'

const orders = ref<Order[]>([])
const activeOrderId = ref<string | null>(null)
let orderCounter = 0

export function useCartStore() {
  const activeOrder = computed(() =>
    orders.value.find(o => o.id === activeOrderId.value) ?? null
  )

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

  function removeOrder(id: string) {
    const idx = orders.value.findIndex(o => o.id === id)
    if (idx >= 0) orders.value.splice(idx, 1)
    activeOrderId.value = orders.value.length > 0 ? orders.value[0].id : null
  }

  return {
    orders,
    activeOrderId,
    activeOrder,
    usedHammocks,
    createOrder,
    addToCart,
    increment,
    decrement,
    removeItem,
    clearCart,
    getItemQuantity,
    removeOrder
  }
}
