import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import OrderManagement from "../pages/Admin/OrderManagement.jsx";
import ProductManagement from "../pages/Admin/ProductManagement.jsx";
import Cart from "../pages/Cart/Cart.jsx";
import Checkout from "../pages/Checkout/Checkout.jsx";
import Home from "../pages/Home/Home.jsx";
import Login from "../pages/Login/Login.jsx";
import Orders from "../pages/Orders/Orders.jsx";
import ProductDetails from "../pages/ProductDetails/ProductDetails.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import Wishlist from "../pages/Wishlist/Wishlist.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
