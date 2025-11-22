import { create } from "zustand";

interface ProfileState {
  userId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  flat: string | null;
  building: string | null;
  address: string | null;
  avatarUri: string | null;
  role: string | null

  setProfile: (data: Partial<ProfileState>) => void;
}

const useProfileStore = create<ProfileState>((set) => ({
  userId: null,
  name: null,
  email: null,
  phone: null,
  flat: null,
  building: null,
  address: null,
  avatarUri: null,
  role: null,

  setProfile: (data) => set((state) => ({ ...state, ...data }))
}));

export default useProfileStore;
