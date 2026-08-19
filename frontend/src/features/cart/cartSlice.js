import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import cartService from "./cartService.js";

const initialState = {
  items: [],
  isLoading: false,
  isSaving: false,
  error: null,
  message: null,
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      return await cartService.addToCart(productId, quantity);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      return await cartService.updateCartItem(productId, quantity);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, thunkAPI) => {
    try {
      return await cartService.removeFromCart(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  try {
    return await cartService.clearCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.items = [];
      state.error = null;
      state.message = null;
    },
    clearCartStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.items = action.payload.cart.items || [];
      state.message = action.payload.message;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        setCart(state, action);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isSaving = false;
        setCart(state, action);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, setCart);
  },
});

export const { clearCartState, clearCartStatus } = cartSlice.actions;
export default cartSlice.reducer;
