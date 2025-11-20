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

  const res = await api.post(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/create`, body);
  return res.data; // ProfileResponseResource
};
