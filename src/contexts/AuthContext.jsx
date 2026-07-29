import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, limit, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let isFirstUser = false; // Đã đóng cửa hậu (backdoor). Người mới mặc định là Member.
          if (!userDocSnap.exists()) {
            try {
              // This might fail if Firestore rules block reading the whole collection
              const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
              isFirstUser = usersSnap.empty;
            } catch (queryErr) {
              console.warn("Could not check if first user (likely due to security rules). Defaulting to member.", queryErr);
            }

            const newProfile = {
              email: currentUser.email,
              role: isFirstUser ? 'super_admin' : 'member',
              status: 'active',
              createdAt: new Date().toISOString(),
              favorites: []
            };
            
            try {
              await setDoc(userDocRef, newProfile);
            } catch (setErr) {
              console.error("Failed to create user profile. Firebase rules are likely blocking writes.", setErr);
              alert("Lỗi: Không thể lưu tài khoản vào cơ sở dữ liệu. Vui lòng kiểm tra lại Firestore Rules.");
            }
          }

          profileUnsub = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data());
            } else {
              setProfile({ role: 'guest', status: 'active', favorites: [] });
            }
          }, (err) => {
             console.error("Lỗi đọc dữ liệu người dùng:", err);
             alert("Lỗi: Không có quyền truy cập dữ liệu người dùng từ Firebase (Firestore Rules bị chặn).");
             setProfile({ role: 'guest', status: 'active', favorites: [] });
          });
        } catch (err) {
          console.error("Error fetching user profile:", err);
          alert("Lỗi kết nối hoặc không có quyền truy cập Firebase. Bạn đang ở chế độ Guest.");
          setProfile({ role: 'guest', status: 'active', favorites: [] });
        }
      } else {
        setProfile(null);
        if (profileUnsub) profileUnsub();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isLocked: profile?.status === 'locked'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
