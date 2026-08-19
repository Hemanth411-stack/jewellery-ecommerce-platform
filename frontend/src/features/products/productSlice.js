import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import productService from "./productService.js";

const initialState = {
  products: [],
  selectedProduct: null,
  relatedProducts: [],
  isLoading: false,
  isSaving: false,
  error: null,
  message: null,
};

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params, thunkAPI) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (productId, thunkAPI) => {
    try {
      return await productService.getProductById(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelated",
  async (productId, thunkAPI) => {
    try {
      return await productService.getRelatedProducts(productId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData, thunkAPI) => {
    try {
      return await productService.createProduct(productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ productId, productData }, thunkAPI) => {
    try {
      return await productService.updateProduct(productId, productData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (productId, thunkAPI) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductStatus: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload.product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload.products;
      })
      .addCase(createProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.products = [action.payload.product, ...state.products];
        state.message = action.payload.message;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.products = state.products.map((product) =>
          product._id === action.payload.product._id ? action.payload.product : product
        );
        state.message = action.payload.message;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.products = state.products.filter((product) => product._id !== action.payload);
        state.message = "Product deleted successfully";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductStatus } = productSlice.actions;
export default productSlice.reducer;
