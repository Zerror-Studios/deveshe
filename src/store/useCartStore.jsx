import { create } from "zustand";

const useCartStore = create((set, get) => ({
  cart: [],
  addToCart: (product) =>
    set((state) => ({
      cart: [...state.cart, product],
    })),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;
