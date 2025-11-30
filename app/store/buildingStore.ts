import { create } from "zustand";

interface BuildingState {
  buildingId: number;
  buildingName: string;
  setBuilding: (id: number, name: string) => void;
}

const useBuildingStore = create<BuildingState>((set) => ({
  buildingId: 4, // default for now
  buildingName: "Block A",
  setBuilding: (buildingId, buildingName) => set({ buildingId, buildingName }),
}));

export default useBuildingStore;
