import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { orderApi } from '../api/orderApi';
import { useAuth } from './AuthContext';
import { extractApiError } from '../utils/formatters';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { isAuthenticated, isBuyer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    subtotal: '0.00',
    total_savings: '0.00',
    shipping_charge: '0.00',
    total_amount: '0.00',
  });
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshStore = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) {
      setCart({
        items: [],
        total_items: 0,
        subtotal: '0.00',
        total_savings: '0.00',
        shipping_charge: '0.00',
        total_amount: '0.00',
      });
      setWishlist([]);
      return;
    }

    try {
      const [cartRes, wishRes] = await Promise.all([
        orderApi.getCart(),
        orderApi.getWishlist(),
      ]);
      setCart(cartRes.data);
      setWishlist(wishRes.data);
    } catch {
      // Silent fail on background refresh
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const isWishlisted = useCallback(
    (productId) => wishlist.some((item) => item.product === productId),
    [wishlist]
  );

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated || !isBuyer) {
      showToast('Please sign in as a buyer to save items to your wishlist.', 'error');
      return { requiresAuth: true };
    }
    try {
      const res = await orderApi.toggleWishlist(productId);
      await refreshStore();
      showToast(
        res.data.wishlisted ? 'Saved to your wishlist.' : 'Removed from your wishlist.',
        'success'
      );
      return res.data;
    } catch (err) {
      showToast(extractApiError(err, 'Could not update wishlist.').message, 'error');
      return null;
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated || !isBuyer) {
      showToast('Please sign in as a buyer to add items to your cart.', 'error');
      return { requiresAuth: true };
    }
    try {
      const res = await orderApi.addToCart(productId, quantity);
      setCart(res.data);
      showToast('Added to shopping cart.', 'success');
      return res.data;
    } catch (err) {
      showToast(extractApiError(err, 'Could not add item to cart.').message, 'error');
      return null;
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    try {
      const res = await orderApi.updateCartItem(itemId, quantity);
      setCart(res.data);
      return res.data;
    } catch (err) {
      showToast(extractApiError(err, 'Could not update cart quantity.').message, 'error');
      return null;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await orderApi.removeCartItem(itemId);
      setCart(res.data);
      showToast('Removed item from cart.', 'success');
      return res.data;
    } catch (err) {
      showToast(extractApiError(err, 'Could not remove item.').message, 'error');
      return null;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount: cart.total_items || 0,
        wishlistCount: wishlist.length,
        isWishlisted,
        toggleWishlist,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        refreshStore,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed right-5 bottom-5 z-50 max-w-sm rounded-md border border-ivory-border bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'
              }`}
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}