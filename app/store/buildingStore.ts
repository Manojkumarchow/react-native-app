import { create } from "zustand";

/* -------- TYPES -------- */

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

  // Services
  plumbingService: ServiceInfo | null;
  electricService: ServiceInfo | null;
  cleaningService: ServiceInfo | null;
  carpenterService: ServiceInfo | null;
  watchmen: ServiceInfo | null;

  // Admin info (FIXED)
  adminName: string | null;
  adminPhone: string | null;
  upiId: string | null;

  setBuilding: (id: number, name: string) => void;
  setBuildingData: (data: any) => void;
  resetBuilding: () => void;
}

/* -------- STORE -------- */

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

  adminName: null,
  adminPhone: null,
  upiId: null,

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

      // ✅ FIXED MAPPING
      adminName: data?.adminName ?? null,
      adminPhone: data?.adminPhone ?? null,
      upiId: data?.upiId ?? null,
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

      adminName: null,
      adminPhone: null,
      upiId: null,
    }),
}));

export default useBuildingStore;
