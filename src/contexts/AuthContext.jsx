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

          if (!userDocSnap.exists()) {
            const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
            const isFirstUser = usersSnap.empty;

            const newProfile = {
              email: currentUser.email,
              role: isFirstUser ? 'super_admin' : 'member',
              status: 'active',
              createdAt: new Date().toISOString(),
              favorites: []
            };
            
            await setDoc(userDocRef, newProfile);
          }

          profileUnsub = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setProfile(doc.data());
            }
          });
        } catch (err) {
          console.error("Error fetching user profile:", err);
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
