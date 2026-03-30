import api from "./api";

export const createProfile = async (
  name: string,
  phone: string,
  pin: string,
  role: "ADMIN" | "USER" | "SYSTEM_ADMIN" | "OWNER",
  buildingId: string,
  floor?: string,
  flatNo?: string
) => {
  const body = {
    userId: null,
    name,
    email: null,
    phone,
    pin,
    role,
    buildingId,
    floor: floor ?? null,
    flatNo: flatNo ?? null,
  };

  const res = await api.post("/profile/create", body);
  return res.data;
};

export const updateProfile = async (phone: string, pin: string) => {
  const body = {
    phone,
    pin,
  };

  const res = await api.patch("/profile/update", body);
  return res.data;
};

export const updatePin = async (phone: string, pin: string) => {
  const body = {
    phone,
    pin
  };

  const res = await api.patch("/profile/update", body);
  return res.data;
};

export const getProfile = async (phone: string) => {
  const res = await api.get(`/profile/${phone}`);
  return res.data;
};
