export type BookingStatus =
  | "CREATED"
  | "ASSIGNING_SERVICE_PERSON"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type IssueStatus = "OPEN" | "CLOSED" | "RESOLVED" | "";

export type PricedOption = {
  id: string;
  label: string;
  price: number;
};

export type ServiceCatalogLine = {
  id: string;
  serviceName: string;
  variantLabel?: string;
  description?: string;
  pricedOptions: PricedOption[];
};

export type ServiceOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  serviceLines?: ServiceCatalogLine[];
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
  "pest-control" : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
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


export function countPricedOptions(opt: ServiceOption): number {
  if (!opt.serviceLines?.length) return 1;
  const n = opt.serviceLines.reduce((acc, line) => acc + (line.pricedOptions?.length ?? 0), 0);
  return n > 0 ? n : 1;
}

export function minPriceForOption(opt: ServiceOption): number {
  if (!opt.serviceLines?.length) return opt.price ?? 0;
  const prices = opt.serviceLines.flatMap((l) => l.pricedOptions?.map((p) => p.price) ?? []);
  if (!prices.length) return opt.price ?? 0;
  return Math.min(...prices);
}

export function findSinglePricedOption(opt: ServiceOption): {
  line: ServiceCatalogLine;
  priced: PricedOption;
} | null {
  const lines = opt.serviceLines ?? [];
  const all: { line: ServiceCatalogLine; priced: PricedOption }[] = [];
  for (const line of lines) {
    for (const priced of line.pricedOptions ?? []) {
      all.push({ line, priced });
    }
  }
  if (all.length !== 1) return null;
  return all[0]!;
}

export function buildBookingTitle(subTitle: string, line: ServiceCatalogLine, priced: PricedOption): string {
  const parts = [subTitle, line.serviceName];
  if (line.variantLabel) parts.push(line.variantLabel);
  parts.push(priced.label);
  return parts.join(" · ");
}

/** Map one API /catalog option into app types (same shape as home-services list). */
export function normalizeServiceOptionFromApi(
  opt: any,
  context: {
    categoryKey: string;
    optionIndex: number;
    fallbackOption?: ServiceOption;
    fallbackImage?: string;
  },
): ServiceOption {
  const { categoryKey, optionIndex, fallbackOption, fallbackImage } = context;
  const pick = (...values: (string | undefined | null)[]) => {
    for (const value of values) {
      const normalized = String(value ?? "").trim();
      if (normalized.length > 0) return normalized;
    }
    return "";
  };
  const rawLines = Array.isArray(opt?.serviceLines) ? opt.serviceLines : [];
  const serviceLines = rawLines.map((line: any) => ({
    id: String(line.id ?? ""),
    serviceName: String(line.serviceName ?? ""),
    variantLabel: line.variantLabel ? String(line.variantLabel) : undefined,
    description: line.description ? String(line.description) : undefined,
    pricedOptions: Array.isArray(line.pricedOptions)
      ? line.pricedOptions.map((po: any) => ({
          id: String(po.id ?? ""),
          label: String(po.label ?? "Option"),
          price: Number(po.price ?? 0),
        }))
      : [],
  }));
  const merged: ServiceOption = {
    id: String(opt?.id ?? fallbackOption?.id ?? `${categoryKey}-opt-${optionIndex}`),
    title: String(opt?.title ?? fallbackOption?.title ?? "Service"),
    description: String(
      opt?.description ?? fallbackOption?.description ?? "Professional service",
    ),
    price: Number(opt?.price ?? fallbackOption?.price ?? 0),
    image: pick(opt?.image, fallbackOption?.image, fallbackImage ?? ""),
    popular: Boolean(opt?.popular ?? fallbackOption?.popular ?? false),
    serviceLines:
      serviceLines.length > 0 ? serviceLines : fallbackOption?.serviceLines,
  };
  merged.price = minPriceForOption(merged);
  return merged;
}

/** Full API `/service/catalog/all` payload → app catalog (same shape as home-services). */
export function normalizeCatalogFromApi(data: unknown): ServiceCategory[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const fallbackMap = new Map(serviceCatalog.map((s) => [s.key, s]));
  return data.map((item: any) => {
    const fallback = fallbackMap.get(String(item.key ?? "") as any);
    const incomingOptions = Array.isArray(item.options) ? item.options : [];
    const options =
      incomingOptions.length > 0
        ? incomingOptions.map((opt: any, idx: number) => {
            const fallbackOption = fallback?.options[idx];
            const catKey = String(item.key ?? "");
            return normalizeServiceOptionFromApi(opt, {
              categoryKey: catKey,
              optionIndex: idx,
              fallbackOption,
            });
          })
        : fallback?.options ?? [];
    return {
      key: String(item.key ?? fallback?.key ?? "service"),
      label: String(item.label ?? fallback?.label ?? "Service"),
      subtitle: String(item.subtitle ?? fallback?.subtitle ?? ""),
      icon: String(item.icon ?? fallback?.icon ?? "tools"),
      options,
    };
  });
}

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
