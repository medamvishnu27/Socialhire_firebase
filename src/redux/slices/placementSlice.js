// src/features/placement/placementSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { storage, db } from '../../firebase/config';

export const fetchResources = createAsyncThunk('placement/fetchResources', async () => {
  const querySnapshot = await getDocs(collection(db, 'resources'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const addResource = createAsyncThunk('placement/addResource', async ({ file, title, description, type }) => {
  const storageRef = ref(storage, `pdfs/${file.name}`);
  await uploadBytes(storageRef, file);
  const link = await getDownloadURL(storageRef);
  const docRef = await addDoc(collection(db, 'resources'), { title, description, type, link });
  return { id: docRef.id, title, description, type, link };
});

export const deleteResource = createAsyncThunk('placement/deleteResource', async ({ id, link }) => {
  await deleteDoc(doc(db, 'resources', id));
  const storageRef = ref(storage, link);
  await deleteObject(storageRef);
  return id;
});

export const fetchTips = createAsyncThunk('placement/fetchTips', async () => {
  const querySnapshot = await getDocs(collection(db, 'tips'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const addTip = createAsyncThunk('placement/addTip', async ({ title, description }) => {
  const docRef = await addDoc(collection(db, 'tips'), { title, description });
  return { id: docRef.id, title, description };
});

export const updateTip = createAsyncThunk('placement/updateTip', async ({ id, title, description }) => {
  const tipRef = doc(db, 'tips', id);
  await updateDoc(tipRef, { title, description });
  return { id, title, description };
});

export const deleteTip = createAsyncThunk('placement/deleteTip', async (id) => {
  await deleteDoc(doc(db, 'tips', id));
  return id;
});

export const fetchFaqs = createAsyncThunk('placement/fetchFaqs', async () => {
  const querySnapshot = await getDocs(collection(db, 'faqs'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const addFaq = createAsyncThunk('placement/addFaq', async ({ question, answer }) => {
  const docRef = await addDoc(collection(db, 'faqs'), { question, answer });
  return { id: docRef.id, question, answer };
});

export const updateFaq = createAsyncThunk('placement/updateFaq', async ({ id, question, answer }) => {
  const faqRef = doc(db, 'faqs', id);
  await updateDoc(faqRef, { question, answer });
  return { id, question, answer };
});

export const deleteFaq = createAsyncThunk('placement/deleteFaq', async (id) => {
  await deleteDoc(doc(db, 'faqs', id));
  return id;
});

const placementSlice = createSlice({
  name: 'placement',
  initialState: {
    resources: [],
    tips: [],
    faqs: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchResources.fulfilled, (state, action) => { state.status = 'succeeded'; state.resources = action.payload; })
      .addCase(fetchResources.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; })
      .addCase(addResource.fulfilled, (state, action) => { state.resources.push(action.payload); })
      .addCase(deleteResource.fulfilled, (state, action) => { state.resources = state.resources.filter(r => r.id !== action.payload); })
      .addCase(fetchTips.fulfilled, (state, action) => { state.tips = action.payload; })
      .addCase(addTip.fulfilled, (state, action) => { state.tips.push(action.payload); })
      .addCase(updateTip.fulfilled, (state, action) => {
        const index = state.tips.findIndex(t => t.id === action.payload.id);
        state.tips[index] = action.payload;
      })
      .addCase(deleteTip.fulfilled, (state, action) => { state.tips = state.tips.filter(t => t.id !== action.payload); })
      .addCase(fetchFaqs.fulfilled, (state, action) => { state.faqs = action.payload; })
      .addCase(addFaq.fulfilled, (state, action) => { state.faqs.push(action.payload); })
      .addCase(updateFaq.fulfilled, (state, action) => {
        const index = state.faqs.findIndex(f => f.id === action.payload.id);
        state.faqs[index] = action.payload;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => { state.faqs = state.faqs.filter(f => f.id !== action.payload); });
  },
});

export default placementSlice.reducer;