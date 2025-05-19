import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Async thunk for uploading resources
export const uploadResource = createAsyncThunk(
  'resources/uploadResource',
  async ({ file, type, title }, { rejectWithValue }) => {
    try {
      const storageRef = ref(storage, `resources/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save resource info to Firestore
      const docRef = await addDoc(collection(db, 'resources'), {
        title,
        type,
        url: downloadURL,
        createdAt: new Date(),
      });

      return { id: docRef.id, title, type, url: downloadURL };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching resources
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'resources'));
      const resources = [];
      querySnapshot.forEach((doc) => {
        resources.push({ id: doc.id, ...doc.data() });
      });
      return resources;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: {
    resources: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upload Resource
      .addCase(uploadResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.loading = false;
        state.resources.push(action.payload);
      })
      .addCase(uploadResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resourcesSlice.reducer;
