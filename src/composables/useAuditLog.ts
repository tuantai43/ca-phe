import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'

export function useAuditLog() {
  const { currentUser } = useAuth()

  async function logAction(action: 'UPDATE' | 'DELETE', collectionName: string, docId: string, oldData?: any, newData?: any) {
    if (!currentUser.value) return
    const cleanOld = oldData ? JSON.parse(JSON.stringify(oldData)) : null
    const cleanNew = newData ? JSON.parse(JSON.stringify(newData)) : null

    try {
      await addDoc(collection(db, 'audit_logs'), {
        action,
        collection: collectionName,
        docId,
        oldData: cleanOld,
        newData: cleanNew,
        userEmail: currentUser.value.email,
        userId: currentUser.value.uid,
        timestamp: serverTimestamp()
      })
    } catch (e) {
      console.error('Lỗi khi ghi Audit Log:', e)
    }
  }

  return { logAction }
}
