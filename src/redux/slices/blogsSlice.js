import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const fetchBlogs = createAsyncThunk('blogs/fetchBlogs', async (_, { rejectWithValue }) => {
  try {
    const blogsRef = collection(db, 'blogs');
    const querySnapshot = await getDocs(blogsRef);
    const blogs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        title: data.title || '',
        author: data.author || '',
        image: data.image || '',
        content: Array.isArray(data.content) ? data.content : [],
        conclusion: data.conclusion || '',
        faqs: Array.isArray(data.faqs) ? data.faqs : [],
        date: data.date ? data.date.toDate().toISOString() : null, // Convert to ISO string
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null, // Convert to ISO string
      });
    });
    return blogs.sort((a, b) => {
      const aDate = a.date ? new Date(a.date) : new Date();
      const bDate = b.date ? new Date(b.date) : new Date();
      return bDate - aDate;
    });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchBlogById = createAsyncThunk('blogs/fetchBlogById', async (id, { rejectWithValue }) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    const blogSnap = await getDoc(blogRef);
    if (!blogSnap.exists()) {
      return rejectWithValue('Blog not found');
    }
    const data = blogSnap.data();
    return {
      id: blogSnap.id,
      title: data.title || '',
      author: data.author || '',
      image: data.image || '',
      content: Array.isArray(data.content) ? data.content : [],
      conclusion: data.conclusion || '',
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      date: data.date ? data.date.toDate().toISOString() : null, // Convert to ISO string
      created_at: data.created_at ? data.created_at.toDate().toISOString() : null, // Convert to ISO string
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchRelatedBlogs = createAsyncThunk('blogs/fetchRelatedBlogs', async (id, { rejectWithValue }) => {
  try {
    const blogsRef = collection(db, 'blogs');
    const querySnapshot = await getDocs(blogsRef);
    const blogs = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== id) {
        const data = doc.data();
        blogs.push({
          id: doc.id,
          title: data.title || '',
          author: data.author || '',
          image: data.image || '',
          content: Array.isArray(data.content) ? data.content : [],
          conclusion: data.conclusion || '',
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
          date: data.date ? data.date.toDate().toISOString() : null, // Convert to ISO string
          created_at: data.created_at ? data.created_at.toDate().toISOString() : null, // Convert to ISO string
        });
      }
    });
    return blogs.sort((a, b) => {
      const aDate = a.date ? new Date(a.date) : new Date();
      const bDate = b.date ? new Date(b.date) : new Date();
      return bDate - aDate;
    }).slice(0, 4);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createBlog = createAsyncThunk('blogs/createBlog', async (blog, { rejectWithValue }) => {
  try {
    const blogsRef = collection(db, 'blogs');
    const newBlog = {
      ...blog,
      date: blog.date ? new Date(blog.date) : new Date(), // Store as Date in Firestore
      created_at: new Date(), // Set client-side
    };
    const docRef = await addDoc(blogsRef, newBlog);
    return {
      id: docRef.id,
      ...newBlog,
      date: newBlog.date ? newBlog.date.toISOString() : null, // Return ISO string
      created_at: newBlog.created_at ? newBlog.created_at.toISOString() : null, // Return ISO string
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateBlog = createAsyncThunk('blogs/updateBlog', async (blog, { rejectWithValue }) => {
  try {
    const blogRef = doc(db, 'blogs', blog.id);
    const updatedBlog = {
      ...blog,
      date: blog.date ? new Date(blog.date) : new Date(), // Store as Date in Firestore
      created_at: blog.created_at ? new Date(blog.created_at) : new Date(),
    };
    await updateDoc(blogRef, updatedBlog);
    return {
      ...updatedBlog,
      date: updatedBlog.date ? updatedBlog.date.toISOString() : null, // Return ISO string
      created_at: updatedBlog.created_at ? updatedBlog.created_at.toISOString() : null, // Return ISO string
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteBlog = createAsyncThunk('blogs/deleteBlog', async (id, { rejectWithValue }) => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await deleteDoc(blogRef);
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: {
    blogs: [],
    currentBlog: null,
    relatedBlogs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRelatedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedBlogs = action.payload;
      })
      .addCase(fetchRelatedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog && state.currentBlog.id === action.payload.id) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b.id !== action.payload);
        if (state.currentBlog && state.currentBlog.id === action.payload) {
          state.currentBlog = null;
        }
      });
  },
});

export default blogsSlice.reducer;