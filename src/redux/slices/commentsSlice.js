import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (blogId, { rejectWithValue }) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('blog_id', '==', blogId), orderBy('created_at', 'asc'));
      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          blog_id: data.blog_id || '',
          comment: data.comment || '',
          name: data.name || '',
          email: data.email || '',
          user_id: data.user_id || '',
          created_at: data.created_at ? data.created_at.toDate() : null, // Convert to Date
        };
      });
      return comments;
    } catch (error) {
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        return rejectWithValue(
          'The query requires a composite index on blog_id and created_at. Create it in the Firebase Console: https://console.firebase.google.com/project/socialhire-a08cf/firestore/indexes'
        );
      }
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ blogId, comment, name, email, userId = '' }, { rejectWithValue }) => {
    try {
      const commentsRef = collection(db, 'comments');
      const newComment = {
        blog_id: blogId,
        comment: comment.trim(),
        name: name.trim(),
        email: email.trim(),
        user_id: userId,
        created_at: serverTimestamp(),
      };
      const docRef = await addDoc(commentsRef, newComment);
      return {
        id: docRef.id,
        ...newComment,
        created_at: new Date(), // Client-side approximation
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commentsSlice.reducer;