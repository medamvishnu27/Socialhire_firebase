import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchMentors = createAsyncThunk(
  'mentors/fetchMentors',
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'mentors'));
      const mentors = [];
      querySnapshot.forEach((doc) => {
        mentors.push({ id: doc.id, ...doc.data() });
      });
      return mentors;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMentor = createAsyncThunk(
  'mentors/addMentor',
  async (mentorData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'mentors'), {
        ...mentorData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...mentorData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMentor = createAsyncThunk(
  'mentors/updateMentor',
  async ({ id, ...mentorData }, { rejectWithValue }) => {
    try {
      const mentorRef = doc(db, 'mentors', id);
      await updateDoc(mentorRef, mentorData);
      return { id, ...mentorData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMentor = createAsyncThunk(
  'mentors/deleteMentor',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'mentors', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  mentors: [],
  loading: false,
  error: null,
};

const mentorsSlice = createSlice({
  name: 'mentors',
  initialState,
  reducers: {
    clearMentorsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Mentors
      .addCase(fetchMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.loading = false;
        state.mentors = action.payload;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Mentor
      .addCase(addMentor.fulfilled, (state, action) => {
        state.mentors.push(action.payload);
      })
      // Update Mentor
      .addCase(updateMentor.fulfilled, (state, action) => {
        const index = state.mentors.findIndex(mentor => mentor.id === action.payload.id);
        if (index !== -1) {
          state.mentors[index] = action.payload;
        }
      })
      // Delete Mentor
      .addCase(deleteMentor.fulfilled, (state, action) => {
        state.mentors = state.mentors.filter(mentor => mentor.id !== action.payload);
      });
  },
});

export const { clearMentorsError } = mentorsSlice.actions;
export default mentorsSlice.reducer;