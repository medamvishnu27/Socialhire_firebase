import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { setUser } from './redux/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            dispatch(setUser(userDoc.data()));
          } else {
            dispatch(setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: 'student',
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If there's an error, still set basic user data
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'student',
          }));
        }
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen "  >
      <Navbar />
      <main className="flex-grow" >
        <AppRoutes />
      </main>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;