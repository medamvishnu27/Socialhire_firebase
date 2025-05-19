import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const initAuthListener = (store) => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            store.dispatch({ 
              type: 'auth/setUser', 
              payload: userDoc.data() 
            });
          } else {
            store.dispatch({ 
              type: 'auth/setUser', 
              payload: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'student',
              }
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          store.dispatch({ type: 'auth/setUser', payload: null });
        }
      } else {
        store.dispatch({ type: 'auth/setUser', payload: null });
      }
      resolve();
    });

    // Clean up subscription
    return unsubscribe;
  });
};