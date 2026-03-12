export type ServiceKey =
  | "plumber"
  | "carpenter"
  | "electrician"
  | "cleaner"
  | "painter"
  | "beautician";

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type IssueStatus = "OPEN" | "CLOSED" | "RESOLVED";

export type ServiceOption = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
};

export type ServiceCategory = {
  key: ServiceKey;
  label: string;
  subtitle: string;
  icon: string;
  options: ServiceOption[];
};

export type BookingRecord = {
  id: string;
  serviceKey: ServiceKey;
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

const PLUMBER_IMAGE = "https://www.figma.com/api/mcp/asset/08568cf2-6c30-4075-81d1-1e85331fbae5";
const CARPENTER_IMAGE = "https://www.figma.com/api/mcp/asset/140e6db9-853b-4958-b418-60c032864392";
const ELECTRICIAN_IMAGE = "https://www.figma.com/api/mcp/asset/907f0100-35a4-4a7f-a5d4-85f955b50dc6";
const CLEANER_IMAGE = "https://www.figma.com/api/mcp/asset/22adede8-0bb2-4ab2-84aa-c5e897071059";
const PAINTER_IMAGE = "https://www.figma.com/api/mcp/asset/9a40b5cd-c120-41de-87b4-cc2d6f4c4f35";
const BEAUTICIAN_IMAGE = "https://www.figma.com/api/mcp/asset/3cd21a70-cf16-4393-a66a-0100c4fa76ef";
const DETAIL_IMAGE = "https://www.figma.com/api/mcp/asset/29e30cee-803b-4133-ae1c-d66cbe0a8256";

export const serviceCatalog: ServiceCategory[] = [
  {
    key: "plumber",
    label: "Plumber",
    subtitle: "Professional plumbing services at your doorstep.",
    icon: "tools",
    options: [
      {
        id: "tap-repair",
        title: "Tap / Faucet Repair",
        description: "Fix leaky or broken taps and faucets quickly. Includes minor washers and sealing.",
        price: 299,
        image: PLUMBER_IMAGE,
        popular: true,
      },
      {
        id: "drain-unclogging",
        title: "Drain Unclogging",
        description: "Kitchen and bathroom drainage blockage removal with complete flow check.",
        price: 399,
        image: PLUMBER_IMAGE,
      },
    ],
  },
  {
    key: "carpenter",
    label: "Carpentry",
    subtitle: "Professional carpentry services at your doorstep.",
    icon: "hammer",
    options: [
      {
        id: "door-hinge",
        title: "Door Hinge Repair",
        description: "Professional repair for squeaky, misaligned, or damaged doors and hinges.",
        price: 99,
        image: CARPENTER_IMAGE,
        popular: true,
      },
      {
        id: "drawer-fix",
        title: "Drawer & Cabinet Fix",
        description: "Smooth slide correction, alignment and minor fitting replacement.",
        price: 249,
        image: CARPENTER_IMAGE,
      },
    ],
  },
  {
    key: "electrician",
    label: "Electrician",
    subtitle: "Professional electric services at your doorstep.",
    icon: "flash",
    options: [
      {
        id: "fan-installer",
        title: "Fan Installer",
        description: "Installation of ceiling fans or repair of motor/regulator issues.",
        price: 99,
        image: ELECTRICIAN_IMAGE,
        popular: true,
      },
      {
        id: "switch-board",
        title: "Switch Board Repair",
        description: "Fix faulty switches, sockets and wiring points with safety checks.",
        price: 149,
        image: ELECTRICIAN_IMAGE,
      },
    ],
  },
  {
    key: "cleaner",
    label: "Cleaner",
    subtitle: "Professional home cleaning services at your doorstep.",
    icon: "broom",
    options: [
      {
        id: "bedroom-deep-clean",
        title: "Bedroom Deep Clean",
        description: "Complete sanitization and deep scrubbing focused on bedroom surfaces.",
        price: 599,
        image: CLEANER_IMAGE,
        popular: true,
      },
      {
        id: "full-home-deep-clean",
        title: "Full Home Deep Clean",
        description: "Includes living room, bedrooms, kitchen and bathrooms.",
        price: 1499,
        image: DETAIL_IMAGE,
      },
    ],
  },
  {
    key: "painter",
    label: "Painter",
    subtitle: "Professional fresh coats to rooms or even flats.",
    icon: "roller",
    options: [
      {
        id: "full-flat-painting",
        title: "Full Flat Painting",
        description: "Complete room prep, primer and two-coat finish with cleanup.",
        price: 3599,
        image: PAINTER_IMAGE,
        popular: true,
      },
      {
        id: "accent-wall",
        title: "Accent Wall Painting",
        description: "Single wall highlight with premium finish options.",
        price: 999,
        image: PAINTER_IMAGE,
      },
    ],
  },
  {
    key: "beautician",
    label: "Beautician",
    subtitle: "Professional relaxation just for you.",
    icon: "face-woman",
    options: [
      {
        id: "basic-facial",
        title: "Basic Facial",
        description: "At-home skin cleanup and glow facial by verified professionals.",
        price: 899,
        image: BEAUTICIAN_IMAGE,
        popular: true,
      },
      {
        id: "spa-package",
        title: "Home Spa Package",
        description: "Relaxing massage and skincare package tailored for your needs.",
        price: 1599,
        image: BEAUTICIAN_IMAGE,
      },
    ],
  },
];

let bookingsState: BookingRecord[] = [
  {
    id: "SVC-004",
    serviceKey: "plumber",
    optionId: "tap-repair",
    optionTitle: "Tap / Faucet Repair",
    providerName: "Ramesh K.",
    providerRating: "4.8",
    dateLabel: "Apr 12",
    timeLabel: "10:00 AM",
    amount: 299,
    status: "COMPLETED",
    issueStatus: "OPEN",
    issueText: "Drain still partially clogged after service.",
    issueRaisedAt: "1 day ago",
  },
  {
    id: "SVC-005",
    serviceKey: "plumber",
    optionId: "drain-unclogging",
    optionTitle: "Drain Unclogging",
    providerName: "Ramesh K.",
    providerRating: "4.8",
    dateLabel: "Apr 14",
    timeLabel: "03:00 PM",
    amount: 399,
    status: "CONFIRMED",
  },
  {
    id: "SVC-006",
    serviceKey: "carpenter",
    optionId: "door-hinge",
    optionTitle: "Door Hinge Repair",
    providerName: "Vikram S.",
    providerRating: "4.7",
    dateLabel: "Apr 10",
    timeLabel: "01:00 PM",
    amount: 99,
    status: "CANCELLED",
    issueStatus: "OPEN",
    issueText: "Carpenter did not arrive on time.",
    issueRaisedAt: "2 days ago",
  },
];

export function getServiceByKey(key?: string) {
  return serviceCatalog.find((service) => service.key === key) ?? serviceCatalog[0];
}

export function getOptionById(serviceKey: ServiceKey, optionId?: string) {
  const service = getServiceByKey(serviceKey);
  return service.options.find((opt) => opt.id === optionId) ?? service.options[0];
}

export function getBookings() {
  return [...bookingsState];
}

export function createBooking(input: {
  serviceKey: ServiceKey;
  optionId: string;
  optionTitle: string;
  dateLabel: string;
  timeLabel: string;
  amount: number;
}) {
  const id = `SVC-${String(100 + bookingsState.length + 1).padStart(3, "0")}`;
  const booking: BookingRecord = {
    id,
    serviceKey: input.serviceKey,
    optionId: input.optionId,
    optionTitle: input.optionTitle,
    providerName: "Ramesh K.",
    providerRating: "4.8",
    dateLabel: input.dateLabel,
    timeLabel: input.timeLabel,
    amount: input.amount,
    status: "CONFIRMED",
  };
  bookingsState = [booking, ...bookingsState];
  return booking;
}

export function raiseIssue(bookingId: string, issueText: string) {
  bookingsState = bookingsState.map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          issueStatus: "OPEN",
          issueText,
          issueRaisedAt: "Just now",
        }
      : booking
  );
}
