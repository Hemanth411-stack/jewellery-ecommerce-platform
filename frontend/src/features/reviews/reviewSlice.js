import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reviewService from "./reviewService.js";

const initialState = {
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  isLoading: false,
  isSaving: false,
  error: null,
  message: null,
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchByProduct",
  async (productId, thunkAPI) => {
    try {
      return await reviewService.getProductReviews(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const submitReview = createAsyncThunk(
  "reviews/create",
  async ({ productId, reviewData }, thunkAPI) => {
    try {
      return await reviewService.createReview(productId, reviewData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.averageRating = action.payload.averageRating;
        state.totalReviews = action.payload.totalReviews;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(submitReview.pending, (state) => {
        state.isSaving = true;
        state.error = null;
        state.message = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isSaving = false;
        state.reviews = [action.payload.review, ...state.reviews];
        state.totalReviews += 1;
        state.averageRating = Number(
          (
            state.reviews.reduce((total, review) => total + review.rating, 0) /
            state.reviews.length
          ).toFixed(1)
        );
        state.message = action.payload.message;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewStatus } = reviewSlice.actions;
export default reviewSlice.reducer;
