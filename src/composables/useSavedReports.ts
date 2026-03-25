import { ref, onMounted, onUnmounted } from "vue";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { SavedReport } from "../types";
import { useAuth } from "./useAuth";

const reports = ref<SavedReport[]>([]);
let unsubscribe: (() => void) | null = null;
let listenersCount = 0;

function startListening() {
  listenersCount++;
  if (unsubscribe) return;

  const { isAdmin, hasRole } = useAuth();
  if (!isAdmin() && !hasRole('view_reports')) {
    return;
  }

  const q = query(collection(db, "savedReports"), orderBy("createdAt", "desc"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    reports.value = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : (data.createdAt ?? Date.now()),
      } as SavedReport;
    });
  }, () => {
    unsubscribe = null;
  });
}

function stopListening() {
  listenersCount--;
  if (listenersCount <= 0) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    listenersCount = 0;
  }
}

export function useSavedReports() {
  onMounted(startListening);
  onUnmounted(stopListening);

  async function addReport(report: Omit<SavedReport, "id" | "createdAt">) {
    await addDoc(collection(db, "savedReports"), {
      ...report,
      createdAt: serverTimestamp(),
    });
  }

  async function deleteReport(id: string) {
    await deleteDoc(doc(db, "savedReports", id));
  }

  return {
    reports,
    addReport,
    deleteReport,
  };
}
