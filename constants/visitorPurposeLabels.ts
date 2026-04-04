/**
 * Labels for VisitorPurpose enum names from the backend
 * (com.whistleup.backend.constants.VisitorPurpose). Keep in sync with Java.
 */
export const VISITOR_PURPOSE_LABELS: Record<string, string> = {
  FOOD_DELIVERY: "Food delivery",
  PACKAGE_DELIVERY: "Package delivery",
  RELATIVES_FRIENDS: "Relatives / friends",
  OTHER: "Other",
};

export const VISITOR_PURPOSE_OPTIONS = (
  Object.keys(VISITOR_PURPOSE_LABELS) as (keyof typeof VISITOR_PURPOSE_LABELS)[]
).map((value) => ({
  value,
  label: VISITOR_PURPOSE_LABELS[value],
}));
