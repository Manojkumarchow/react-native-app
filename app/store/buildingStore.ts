import { create } from "zustand";

interface ServiceInfo {
  name: string;
  phone: string;
}

interface BuildingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface BuildingState {
  buildingId: number;
  buildingName: string;
  address: BuildingAddress | null;
  floors: number;

  plumbingService: ServiceInfo | null;
  electricService: ServiceInfo | null;
  cleaningService: ServiceInfo | null;
  carpenterService: ServiceInfo | null;
  watchmen: ServiceInfo | null;

  setBuilding: (id: number, name: string) => void;
  setBuildingData: (data: any) => void;
}

const useBuildingStore = create<BuildingState>((set) => ({
  // Default values (in case API not loaded yet)
  buildingId: 4,
  buildingName: "Block A",
  address: null,
  floors: 0,

  plumbingService: null,
  electricService: null,
  cleaningService: null,
  carpenterService: null,
  watchmen: null,

  setBuilding: (buildingId, buildingName) => set({ buildingId, buildingName }),

  setBuildingData: (data) =>
    set({
      buildingId: data.buildingId,
      buildingName: data.buildingName,
      address: data.buildingAddress ?? null,
      floors: data.floors ?? 0,

      plumbingService: data.plumbingService ?? null,
      electricService: data.electricService ?? null,
      cleaningService: data.cleaningService ?? null,
      carpenterService: data.carpenterService ?? null,
      watchmen: data.watchmen ?? null,
    }),
}));

export default useBuildingStore;
