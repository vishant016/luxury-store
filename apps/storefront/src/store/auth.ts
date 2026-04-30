import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginCustomer,
  registerCustomer,
  getCustomer,
  type Customer,
} from "@/lib/auth";

interface AuthState {
  token: string | null;
  customer: Customer | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshCustomer: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { token } = await loginCustomer({ email, password });
          const customer = await getCustomer(token);
          set({ token, customer, loading: false });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : "Login failed",
          });
          throw e;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const { token } = await registerCustomer(data);
          const customer = await getCustomer(token);
          set({ token, customer, loading: false });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof Error ? e.message : "Registration failed",
          });
          throw e;
        }
      },

      logout: () => set({ token: null, customer: null, error: null }),

      refreshCustomer: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const customer = await getCustomer(token);
          set({ customer });
        } catch {
          set({ token: null, customer: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "luxury-store-auth",
      partialize: (state) => ({ token: state.token, customer: state.customer }),
    }
  )
);
