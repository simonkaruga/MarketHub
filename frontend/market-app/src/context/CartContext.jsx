import { createContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isCustomer } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, isCustomer]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const data = await cartService.addItem(productId, quantity);
      setCart(data);
      toast.success('Item added to your cart!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Unable to add item to cart. Please try again.');
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const data = await cartService.updateItem(itemId, quantity);
      setCart(data);
      toast.success('Your cart has been updated!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Unable to update cart. Please try again.');
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await cartService.removeItem(itemId);
      setCart(data);
      toast.success('Item removed from your cart!');
      return data;
    } catch (error) {
      toast.error('Unable to remove item from cart. Please try again.');
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
    itemCount: cart?.items?.length || 0,
    total: cart?.total || 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
