import { ref, watch } from 'vue';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  roles: string[];
}

const currentUser = ref<UserProfile | null>(null);
const isLoadingAuth = ref(true);

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      let userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          roles: [] // Mặc định là mảng rỗng tương đương guest
        };
        await setDoc(userRef, newProfile);
        currentUser.value = newProfile;
      } else {
        currentUser.value = userDoc.data() as UserProfile;
      }
    } catch (e) {
      console.error('Lỗi khi lấy dữ liệu user', e);
      // Fallback
      currentUser.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        roles: []
      };
    }
  } else {
    currentUser.value = null;
  }
  isLoadingAuth.value = false;
});

export function useAuth() {
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error logging in with Google', error);
      alert('Đăng nhập thất bại!');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = () => {
    return (currentUser.value?.roles || []).includes('admin');
  };

  const hasRole = (role: string) => {
    return isAdmin() || (currentUser.value?.roles || []).includes(role);
  };

  const isGuest = () => {
    return !isAdmin() && (currentUser.value?.roles || []).length === 0;
  };

  return {
    currentUser,
    isLoadingAuth,
    loginWithGoogle,
    logout,
    isAdmin,
    hasRole,
    isGuest
  };
}

export function waitForAuthInit(): Promise<void> {
  return new Promise((resolve) => {
    if (!isLoadingAuth.value) {
      resolve();
    } else {
      const stop = watch(isLoadingAuth, (loading) => {
        if (!loading) {
          stop();
          resolve();
        }
      });
    }
  });
}
