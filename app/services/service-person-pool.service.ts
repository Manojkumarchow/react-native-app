import api from "./api";
type ServiceOrderType = string;

export type ServiceOrderPoolItem = {
  orderId: number;
  orderType: ServiceOrderType;
  category: string;
  subcategory: string;
  description: string;
  location: string;
  date: string;
  timeSlot: string;
  buildingName: string | null;
  bookingPersonName: string | null;
  bookingPersonPhone: string | null;
  optionId: string | null;
  amount: number | null;
};

export async function getOpenServiceOrders(servicePersonPhone: string) {
  const res = await api.get<ServiceOrderPoolItem[]>("/service/order/pool/open", {
    params: { phone: servicePersonPhone },
  });
  return res.data ?? [];
}

export async function acceptServiceOrder(servicePersonPhone: string, orderId: string) {
  await api.post(`/service/order/pool/${orderId}/accept`, {}, { params: { phone: servicePersonPhone } });
}

export async function rejectServiceOrder(servicePersonPhone: string, orderId: string) {
  await api.post(
    `/service/order/pool/${orderId}/reject`,
    {},
    { params: { phone: servicePersonPhone } },
  );
}

