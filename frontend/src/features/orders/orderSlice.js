import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import orderService from "./orderService.js";

const initialState = {
  orders: [],
  latestOrder: null,
  isLoading: false,
  isPlacing: false,
  isUpdating: false,
  error: null,
  message: null,
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export const placeOrder = createAsyncThunk(
  "orders/place",
  async (checkoutData, thunkAPI) => {
    try {
      return await orderService.checkout(checkoutData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchMyOrders = createAsyncThunk("orders/fetchMine", async (_, thunkAPI) => {
  try {
    return await orderService.getMyOrders();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAdminOrders = createAsyncThunk("orders/fetchAdmin", async (_, thunkAPI) => {
  try {
    return await orderService.getAdminOrders();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateAdminOrderStatus = createAsyncThunk(
  "orders/updateAdminStatus",
  async ({ orderId, status }, thunkAPI) => {
    try {
      return await orderService.updateOrderStatus(orderId, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.isPlacing = true;
        state.error = null;
        state.message = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isPlacing = false;
        state.latestOrder = action.payload.order;
        state.orders = [action.payload.order, ...state.orders];
        state.message = action.payload.message;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isPlacing = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload.order._id ? action.payload.order : order
        );
        state.message = action.payload.message;
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;
