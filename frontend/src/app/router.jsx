import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import SellerLayout from '../layouts/SellerLayout';
import BuyerLayout from '../layouts/BuyerLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../features/public/pages/Home';
import Marketplace from '../features/public/pages/Marketplace';
import ProductDetails from '../features/public/pages/ProductDetails';
import PrivacyPolicy from '../features/public/pages/PrivacyPolicy';
import TermsOfService from '../features/public/pages/TermsOfService';

import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

import SellerDashboard from '../features/seller/pages/SellerDashboard';
import AddProduct from '../features/seller/pages/AddProduct';
import ManageProducts from '../features/seller/pages/ManageProducts';
import EditProduct from '../features/seller/pages/EditProduct';
import SellerEnquiries from '../features/seller/pages/SellerEnquiries';
import EnquiryDetails from '../features/seller/pages/EnquiryDetails';
import SellerProfile from '../features/seller/pages/SellerProfile';

import BuyerDashboard from '../features/buyer/pages/BuyerDashboard';
import BuyerEnquiries from '../features/buyer/pages/BuyerEnquiries';
import BuyerProfile from '../features/buyer/pages/BuyerProfile';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/marketplace', element: <Marketplace /> },
      { path: '/products/:id', element: <ProductDetails /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/privacy', element: <PrivacyPolicy /> },
      { path: '/terms', element: <TermsOfService /> },
    ],
  },
  {
    path: '/seller',
    element: (
      <ProtectedRoute allowedRole="seller">
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/seller/dashboard" replace /> },
      { path: 'dashboard', element: <SellerDashboard /> },
      { path: 'products', element: <ManageProducts /> },
      { path: 'products/add', element: <AddProduct /> },
      { path: 'products/:id/edit', element: <EditProduct /> },
      { path: 'enquiries', element: <SellerEnquiries /> },
      { path: 'enquiries/:id', element: <EnquiryDetails /> },
      { path: 'profile', element: <SellerProfile /> },
    ],
  },
  {
    path: '/buyer',
    element: (
      <ProtectedRoute allowedRole="buyer">
        <BuyerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/buyer/dashboard" replace /> },
      { path: 'dashboard', element: <BuyerDashboard /> },
      { path: 'enquiries', element: <BuyerEnquiries /> },
      { path: 'profile', element: <BuyerProfile /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);