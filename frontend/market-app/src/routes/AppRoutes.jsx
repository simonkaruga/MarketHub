import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Public Pages
import Home from '../pages/public/Home';
import Products from '../pages/public/Products';
import ProductDetail from '../pages/public/ProductDetail';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';

// Customer Pages
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/CheckOut';
import Orders from '../pages/customer/Orders';
import OrderDetail from '../pages/customer/OrderDetail';
import Profile from '../pages/customer/Profile';
import ApplyMerchant from '../pages/customer/ApplyMerchant';

// Merchant Pages
import MerchantDashboard from '../pages/merchant/MerchantDashboard';
import MerchantProducts from '../pages/merchant/MerchantProducts';
import MerchantOrders from '../pages/merchant/MerchantOrders';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import MerchantApplications from '../pages/admin/MerchantApplications';
import MerchantApplicationDetail from '../pages/admin/MerchantApplicationDetail';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminOrderDetail from '../pages/admin/AdminOrderDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Customer Routes */}
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/apply-merchant"
        element={
          <PrivateRoute>
            <ApplyMerchant />
          </PrivateRoute>
        }
      />

      {/* Merchant Routes */}
      <Route
        path="/merchant/dashboard"
        element={
          <RoleRoute allowedRoles={['merchant']}>
            <MerchantDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/merchant/products"
        element={
          <RoleRoute allowedRoles={['merchant']}>
            <MerchantProducts />
          </RoleRoute>
        }
      />
      <Route
        path="/merchant/orders"
        element={
          <RoleRoute allowedRoles={['merchant']}>
            <MerchantOrders />
          </RoleRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/merchant-applications"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <MerchantApplications />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/merchant-applications/:id"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <MerchantApplicationDetail />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminOrders />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminOrderDetail />
          </RoleRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
    </Routes>
  );
};

export default AppRoutes;