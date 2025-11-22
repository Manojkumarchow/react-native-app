import { create } from "zustand";

interface AuthState {
  username: string | null;
  setUsername: (phone: string) => void;
  reset: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  username: "9666499643",      // static for now, replace after login
  setUsername: (phone) => set({ username: phone }),
  reset: () => set({ username: null })
}));

export default useAuthStore;
