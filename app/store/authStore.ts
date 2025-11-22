import { create } from "zustand";

interface AuthState {
  username: string | null;
  token: string | null;
  role: string | null;
  setAuth: (token: string, username: string) => void;
  resetAuth: () => void;
  setUsername: (phone: string) => void;
  reset: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: "9666499643",
  role: null,
  setAuth: (token, username) => set({ token, username }),
  resetAuth: () => set({ token: null, username: null }),     // static for now, replace after login
  setUsername: (phone) => set({ username: phone }),
  reset: () => set({ username: null })
}));

export default useAuthStore;
