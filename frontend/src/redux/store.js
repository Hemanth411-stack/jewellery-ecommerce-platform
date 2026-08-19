import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import cartReducer from "../features/cart/cartSlice.js";
import orderReducer from "../features/orders/orderSlice.js";
import productReducer from "../features/products/productSlice.js";
import reviewReducer from "../features/reviews/reviewSlice.js";
import wishlistReducer from "../features/wishlist/wishlistSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
    products: productReducer,
    reviews: reviewReducer,
    wishlist: wishlistReducer,
  },
});
