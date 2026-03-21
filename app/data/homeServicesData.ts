export type BookingStatus =
  | "CREATED"
  | "ASSIGNING_SERVICE_PERSON"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type IssueStatus = "OPEN" | "CLOSED" | "RESOLVED" | "";

export type ServiceOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
};

export type ServiceCategory = {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  options: ServiceOption[];
};

export type BookingRecord = {
  id: string;
  serviceKey: string;
  optionId: string;
  optionTitle: string;
  providerName: string;
  providerRating: string;
  dateLabel: string;
  timeLabel: string;
  amount: number;
  status: BookingStatus;
  issueStatus?: IssueStatus;
  issueText?: string;
  issueRaisedAt?: string;
};

export const SERVICE_IMAGE_BY_CATEGORY: Record<string, string> = {
  cleaning: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80",
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
  "pest-control": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  "floor-polishing": "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80",
  "appliance-service": "https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?auto=format&fit=crop&w=1200&q=80",
  "home-repair-services": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  "packers-movers": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80",
  "facility-management": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
};

export const serviceCatalog: ServiceCategory[] = [
  {
    key: "cleaning",
    label: "Cleaning",
    subtitle: "Professional cleaning services at your doorstep.",
    icon: "broom",
    options: [
      {
        id: "bathroom-cleaning",
        title: "Bathroom Cleaning",
        description: "Professional bathroom deep cleaning service.",
        price: 0,
        image: SERVICE_IMAGE_BY_CATEGORY.cleaning,
        popular: true,
      },
    ],
  },
];

export function getServiceByKey(catalog: ServiceCategory[], key?: string) {
  return catalog.find((service) => service.key === key) ?? catalog[0];
}

export function getOptionById(catalog: ServiceCategory[], serviceKey: string, optionId?: string) {
  const service = getServiceByKey(catalog, serviceKey);
  return service?.options.find((opt) => opt.id === optionId) ?? service?.options?.[0];
}

export function toDateLabel(input?: string | Date) {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}
