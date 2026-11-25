import { createBrowserRouter, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import SellerLayout from '../layouts/SellerLayout';
import BuyerLayout from '../layouts/BuyerLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Storefront & Policy Pages
import Home from '../features/public/pages/Home';
import Shop from '../features/public/pages/Shop';
import Categories from '../features/public/pages/Categories';
import Collections from '../features/public/pages/Collections';
import Brands from '../features/public/pages/Brands';
import BrandDetails from '../features/public/pages/BrandDetails';
import ProductDetails from '../features/public/pages/ProductDetails';
import About from '../features/public/pages/About';
import Contact from '../features/public/pages/Contact';
import ShippingPolicy from '../features/public/pages/ShippingPolicy';
import ReturnPolicy from '../features/public/pages/ReturnPolicy';
import FAQ from '../features/public/pages/FAQ';
import PrivacyPolicy from '../features/public/pages/PrivacyPolicy';
import TermsOfService from '../features/public/pages/TermsOfService';

// Separate Buyer & Seller Auth Pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import SellLanding from '../features/auth/SellLanding';
import SellerLogin from '../features/auth/SellerLogin';
import SellerApply from '../features/auth/SellerApply';

// Seller Studio Pages
import SellerDashboard from '../features/seller/pages/SellerDashboard';
import SellerOrders from '../features/seller/pages/SellerOrders';
import SellerBrandProfile from '../features/seller/pages/SellerBrandProfile';
import AddProduct from '../features/seller/pages/AddProduct';
import ManageProducts from '../features/seller/pages/ManageProducts';
import EditProduct from '../features/seller/pages/EditProduct';
import SellerEnquiries from '../features/seller/pages/SellerEnquiries';
import EnquiryDetails from '../features/seller/pages/EnquiryDetails';
import SellerProfile from '../features/seller/pages/SellerProfile';

// Buyer Account & E-Commerce Pages
import BuyerDashboard from '../features/buyer/pages/BuyerDashboard';
import Wishlist from '../features/buyer/pages/Wishlist';
import Cart from '../features/buyer/pages/Cart';
import SavedAddresses from '../features/buyer/pages/SavedAddresses';
import Checkout from '../features/buyer/pages/Checkout';
import BuyerOrders from '../features/buyer/pages/BuyerOrders';
import OrderDetails from '../features/buyer/pages/OrderDetails';
import BuyerEnquiries from '../features/buyer/pages/BuyerEnquiries';
import BuyerProfile from '../features/buyer/pages/BuyerProfile';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/marketplace', element: <Navigate to="/shop" replace /> },
      { path: '/categories', element: <Categories /> },
      { path: '/collections', element: <Collections /> },
      { path: '/brands', element: <Brands /> },
      { path: '/brands/:id', element: <BrandDetails /> },
      { path: '/products/:id', element: <ProductDetails /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/shipping-policy', element: <ShippingPolicy /> },
      { path: '/return-policy', element: <ReturnPolicy /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/privacy', element: <PrivacyPolicy /> },
      { path: '/terms', element: <TermsOfService /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/sell', element: <SellLanding /> },
      { path: '/seller/login', element: <SellerLogin /> },
      { path: '/seller/apply', element: <SellerApply /> },
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
      { path: 'orders', element: <SellerOrders /> },
      { path: 'brand', element: <SellerBrandProfile /> },
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
      { path: 'wishlist', element: <Wishlist /> },
      { path: 'cart', element: <Cart /> },
      { path: 'addresses', element: <SavedAddresses /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'orders', element: <BuyerOrders /> },
      { path: 'orders/:orderNumber', element: <OrderDetails /> },
      { path: 'enquiries', element: <BuyerEnquiries /> },
      { path: 'profile', element: <BuyerProfile /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);