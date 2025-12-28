import api from "./api";

export const sendOTP = async (phoneNumber: string) => {
  const body = { phoneNumber };
  const res = await api.post(`${process.env.EXPO_PUBLIC_BASE_URL}/api/otp/send`, body);
  return res.data; // OTPResponse
};

export const verifyOTP = async (phoneNumber: string, otp: string) => {
  const body = { phoneNumber, otp };
  const res = await api.post(`${process.env.EXPO_PUBLIC_BASE_URL}/api/otp/verify`, body);
  return res.data; // VerificationResponse
};
