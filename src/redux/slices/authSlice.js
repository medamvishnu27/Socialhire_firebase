import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { setupStudentCollections } from '../../utils/setupCollections';

const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { email, displayName } = user;
    const createdAt = new Date().toISOString();

    const userData = {
      uid: user.uid,
      email,
      displayName: displayName || additionalData.displayName || email.split('@')[0],
      role: 'student',
      createdAt,
      ...additionalData
    };

    try {
      await setDoc(userRef, userData);
      // Removed setupStudentCollections for new users
      // No need to check collections here; handle on first login or profile load if needed
      return userData;
    } catch (error) {
      console.error('Error in createUserDocument:', error.message);
      throw error;
    }
  } else {
    // For existing users (e.g., login), optionally check collections
    const userData = snapshot.data();
    if (userData.role === 'student') {
      await setupStudentCollections(user.uid); // Keep for login if needed
    }
    return userData;
  }
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      const userData = await createUserDocument(userCredential.user, { displayName });
      return userData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, isAdmin }, { rejectWithValue }) => {
    try {
      if (isAdmin && email === 'admin@studentportal.com' && password === 'admin123') {
        const adminData = {
          uid: 'admin-uid',
          email: 'admin@studentportal.com',
          displayName: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        return adminData;
      }

      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserDocument(userCredential.user);
      if (isAdmin && userData.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return userData;
    } catch (error) {
      let message = error.message;
      if (message.includes('auth/invalid-credential')) {
        message = 'Invalid email or password';
      }
      return rejectWithValue(message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      auth.settings.appVerificationDisabledForTesting = true;
      const userCredential = await signInWithPopup(auth, provider);
      const userData = await createUserDocument(userCredential.user);
      return userData;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return rejectWithValue('Sign in cancelled');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;