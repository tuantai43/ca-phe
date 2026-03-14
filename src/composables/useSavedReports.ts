import { ref, onMounted } from "vue";
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

const reports = ref<SavedReport[]>([]);
let unsubscribe: (() => void) | null = null;

function startListening() {
  if (unsubscribe) return;
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
  });
}

export function useSavedReports() {
  onMounted(startListening);

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
