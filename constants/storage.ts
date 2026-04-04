export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "app.onboardingComplete",
  SELECTED_ROLE: "app.selectedRole",
  LAST_LOGIN_PHONE: "app.lastLoginPhone",
} as const;

/** Persisted per phone: last building an admin selected on this device. */
export function adminSelectedBuildingStorageKey(phone: string): string {
  return `app.adminSelectedBuilding.${phone.trim()}`;
}
