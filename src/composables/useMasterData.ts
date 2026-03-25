import { ref } from 'vue'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { menuItems as defaultMenuItems } from '../data/menu'

export interface MasterData {
  menuPrice: Record<string, number>
  menuHammockPrice: Record<string, number>
  expensePrice: Record<string, number>
}

const masterData = ref<MasterData>({
  menuPrice: {},
  menuHammockPrice: {},
  expensePrice: {}
})
let unsubscribe: (() => void) | null = null

function initializeDefaultData() {
  if (Object.keys(masterData.value.menuPrice).length === 0) {
    for (const item of defaultMenuItems) {
      masterData.value.menuPrice[item.id] = item.priceTakeaway
      masterData.value.menuHammockPrice[item.id] = item.priceHammock
    }
  }
}

export function useMasterData() {
  function startListening() {
    if (unsubscribe) return
    unsubscribe = onSnapshot(doc(db, 'settings', 'master_data'), (snap) => {
      if (snap.exists()) {
        masterData.value = snap.data() as MasterData
      } else {
        initializeDefaultData()
      }
    }, () => {
      unsubscribe = null
    })
  }

  function stopListening() {
    if (unsubscribe) {
      // Intentionally leaving this commented out so global state remains synced across components
      // unsubscribe()
      // unsubscribe = null
    }
  }

  async function updateMasterData(newData: MasterData) {
    await setDoc(doc(db, 'settings', 'master_data'), newData)
  }

  // Start listening immediately when composable is used
  if (!unsubscribe) {
    startListening()
  }

  return {
    masterData,
    updateMasterData,
    stopListening
  }
}
