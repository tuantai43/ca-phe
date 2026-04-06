import { ref, computed, watch } from 'vue'
import type { Order, OrderType, MenuItem } from '../types'

const STORAGE_KEY = 'caphe_cart_orders'
const STORAGE_ACTIVE_KEY = 'caphe_cart_active'
const STORAGE_COUNTER_KEY = 'caphe_cart_counter'

function loadFromStorage(): { orders: Order[]; activeOrderId: string | null; counter: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const activeId = localStorage.getItem(STORAGE_ACTIVE_KEY)
    const counter = parseInt(localStorage.getItem(STORAGE_COUNTER_KEY) || '0', 10)
    if (raw) {
      const parsed = JSON.parse(raw) as Order[]
      return { orders: parsed, activeOrderId: activeId, counter }
    }
  } catch { /* ignore corrupt data */ }
  return { orders: [], activeOrderId: null, counter: 0 }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
    localStorage.setItem(STORAGE_ACTIVE_KEY, activeOrderId.value || '')
    localStorage.setItem(STORAGE_COUNTER_KEY, String(orderCounter))
  } catch { /* quota exceeded, ignore */ }
}

const restored = loadFromStorage()
const orders = ref<Order[]>(restored.orders)
const activeOrderId = ref<string | null>(restored.activeOrderId)
let orderCounter = restored.counter
const submittingOrderIds = ref<Set<string>>(new Set())

// Auto-save on every change
watch(orders, saveToStorage, { deep: true })
watch(activeOrderId, saveToStorage)

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

  function isSubmitting(orderId: string): boolean {
    return submittingOrderIds.value.has(orderId)
  }

  function setSubmitting(orderId: string, value: boolean) {
    if (value) {
      submittingOrderIds.value.add(orderId)
    } else {
      submittingOrderIds.value.delete(orderId)
    }
    // Trigger reactivity
    submittingOrderIds.value = new Set(submittingOrderIds.value)
  }

  return {
    orders,
    activeOrderId,
    activeOrder,
    usedHammocks,
    submittingOrderIds,
    createOrder,
    addToCart,
    increment,
    decrement,
    removeItem,
    clearCart,
    getItemQuantity,
    removeOrder,
    isSubmitting,
    setSubmitting,
  }
}
