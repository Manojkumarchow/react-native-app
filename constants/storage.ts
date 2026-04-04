export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "app.onboardingComplete",
  SELECTED_ROLE: "app.selectedRole",
  LAST_LOGIN_PHONE: "app.lastLoginPhone",
  /** Last visitor check-in name on this device (pre-fill next visit). */
  VISITOR_LAST_DISPLAY_NAME: "app.visitorLastDisplayName",
  /** Last visitor check-in phone (10 digits). */
  VISITOR_LAST_PHONE: "app.visitorLastPhone",
} as const;

/** Persisted per phone: last building an admin selected on this device. */
export function adminSelectedBuildingStorageKey(phone: string): string {
  return `app.adminSelectedBuilding.${phone.trim()}`;
}
