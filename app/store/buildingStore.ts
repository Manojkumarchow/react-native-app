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
  buildingId: number | null;
  buildingName: string | null;
  address: BuildingAddress | null;
  floors: number;
  totalResidents: number;
  plumbingService: ServiceInfo | null;
  electricService: ServiceInfo | null;
  cleaningService: ServiceInfo | null;
  carpenterService: ServiceInfo | null;
  watchmen: ServiceInfo | null;

  setBuilding: (id: number, name: string) => void;
  setBuildingData: (data: any) => void;
  resetBuilding: () => void;
}

const useBuildingStore = create<BuildingState>((set) => ({
  buildingId: null,
  buildingName: null,
  address: null,
  floors: 0,
  totalResidents: 0,
  plumbingService: null,
  electricService: null,
  cleaningService: null,
  carpenterService: null,
  watchmen: null,

  setBuilding: (buildingId, buildingName) =>
    set({
      buildingId,
      buildingName,
    }),

  setBuildingData: (data) =>
    set({
      buildingId: data?.buildingId ?? null,
      buildingName: data?.buildingName ?? null,
      address: data?.buildingAddress ?? null,
      floors: data?.floors ?? 0,
      totalResidents: data?.totalResidents ?? 0,
      plumbingService: data?.plumbingService ?? null,
      electricService: data?.electricService ?? null,
      cleaningService: data?.cleaningService ?? null,
      carpenterService: data?.carpenterService ?? null,
      watchmen: data?.watchmen ?? null,
    }),
  resetBuilding: () =>
    set({
      buildingId: null,
      buildingName: null,
      address: null,
      floors: 0,
      totalResidents: 0,
      plumbingService: null,
      electricService: null,
      cleaningService: null,
      carpenterService: null,
      watchmen: null,
    }),
}));

export default useBuildingStore;
