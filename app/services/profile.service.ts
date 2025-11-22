import api from "./api";

export const createProfile = async (
  name: string,
  phone: string,
  password: string
) => {
  const body = {
    userId: null,
    name,
    email: null,
    phone,
    password,
    role: "ADMIN",
  };

  const res = await api.post(
    `${process.env.EXPO_PUBLIC_BASE_URL}/profile/create`,
    body
  );
  return res.data; // ProfileResponseResource
};

export const updateProfile = async (phone: string, password: string) => {
  const body = {
    phone,
    password,
  };

  const res = await api.patch(
    `${process.env.EXPO_PUBLIC_BASE_URL}/profile/update`,
    body
  );
  return res.data; // ProfileResponseResource
};

export const getProfile = async (phone: string) => {
  const res = await api.get(
    `${process.env.EXPO_PUBLIC_BASE_URL}/profile/${phone}`
  );
  return res.data;
};
