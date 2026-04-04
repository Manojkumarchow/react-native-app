import AsyncStorage from "@react-native-async-storage/async-storage";
import { adminSelectedBuildingStorageKey } from "@/constants/storage";
import type { AdminBuildingSummary } from "../store/profileStore";

export function normalizeAdminBuildingsFromApi(raw: unknown): AdminBuildingSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b: { buildingId?: unknown; buildingName?: unknown }) => ({
      buildingId: String(b?.buildingId ?? ""),
      buildingName: String(b?.buildingName ?? ""),
    }))
    .filter((b) => b.buildingId.length > 0);
}

export async function resolveActiveAdminBuilding(
  phone: string,
  profileBuildingId: string | null | undefined,
  adminBuildings: AdminBuildingSummary[],
): Promise<AdminBuildingSummary | null> {
  if (adminBuildings.length === 0) return null;
  try {
    const stored = await AsyncStorage.getItem(adminSelectedBuildingStorageKey(phone));
    if (stored) {
      const match = adminBuildings.find((b) => b.buildingId === stored);
      if (match) return match;
    }
  } catch {
    // ignore storage errors
  }
  const pb = profileBuildingId != null ? String(profileBuildingId).trim() : "";
  if (pb) {
    const match = adminBuildings.find((b) => b.buildingId === pb);
    if (match) return match;
  }
  return adminBuildings[0] ?? null;
}
