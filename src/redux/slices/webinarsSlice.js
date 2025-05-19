import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const subscribeToWebinarsAndSessions = createAsyncThunk(
  'webinars/subscribeToWebinarsAndSessions',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribeFunctions = {};

      const webinarsQuery = query(collection(db, 'webinars'), orderBy('date', 'desc'));
      unsubscribeFunctions.webinars = onSnapshot(
        webinarsQuery,
        (snapshot) => {
          const webinars = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'webinar'
          }));

          const sessionsQuery = query(collection(db, 'sessions'), orderBy('date', 'desc'));
          unsubscribeFunctions.sessions = onSnapshot(
            sessionsQuery,
            (sessionsSnapshot) => {
              const sessions = sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'session',
                mentorName: doc.data().mentor?.name || 'Unknown Mentor',
                mentorExpertise: doc.data().mentor?.expertise || ''
              }));

              const combined = [...webinars, ...sessions];
              dispatch(setItems(combined));
            },
            (error) => {
              dispatch(setError(error.message || 'Failed to subscribe to sessions'));
            }
          );
        },
        (error) => {
          dispatch(setError(error.message || 'Failed to subscribe to webinars'));
        }
      );

      // Return nothing (undefined) instead of the unsubscribe function
      return undefined;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to subscribe to data');
    }
  }
);

// Rest of the thunks (addWebinar, updateWebinar, deleteWebinar) remain unchanged
export const addWebinar = createAsyncThunk(
  'webinars/addWebinar',
  async (webinarData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'webinars'), {
        ...webinarData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...webinarData, type: 'webinar' };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add webinar');
    }
  }
);

export const updateWebinar = createAsyncThunk(
  'webinars/updateWebinar',
  async ({ id, ...webinarData }, { rejectWithValue }) => {
    try {
      const webinarRef = doc(db, 'webinars', id);
      const updatedData = {
        ...webinarData,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(webinarRef, updatedData);
      return { id, ...updatedData, type: 'webinar' };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update webinar');
    }
  }
);

export const deleteWebinar = createAsyncThunk(
  'webinars/deleteWebinar',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'webinars', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete webinar');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  // Remove unsubscribe from state since we won't store it here
};

const webinarsSlice = createSlice({
  name: 'webinars',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearWebinarsError: (state) => {
      state.error = null;
    },
    clearWebinars: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      // Remove unsubscribe cleanup from here
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToWebinarsAndSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToWebinarsAndSessions.fulfilled, (state) => {
        state.loading = false;
        // No need to store unsubscribe in state
      })
      .addCase(subscribeToWebinarsAndSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addWebinar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWebinar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addWebinar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateWebinar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWebinar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateWebinar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteWebinar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWebinar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteWebinar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setItems, setError, clearWebinarsError, clearWebinars } = webinarsSlice.actions;
export default webinarsSlice.reducer;