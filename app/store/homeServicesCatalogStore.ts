import { create } from "zustand";
import type { ServiceCategory } from "../data/homeServicesData";

interface HomeServicesCatalogState {
  catalog: ServiceCategory[];
  setCatalog: (catalog: ServiceCategory[]) => void;
}

const useHomeServicesCatalogStore = create<HomeServicesCatalogState>((set) => ({
  catalog: [],
  setCatalog: (catalog) => set({ catalog }),
}));

export default useHomeServicesCatalogStore;
