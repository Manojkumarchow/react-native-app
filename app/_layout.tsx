import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";
import { Stack } from "expo-router";
import api from "./services/api";

export default function RootLayout() {
  const username = useAuthStore((state: { username: any }) => state.username);
  const setProfile = useProfileStore(
    (state: { setProfile: any }) => state.setProfile
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(
          `${process.env.EXPO_PUBLIC_BASE_URL}/profile/${username}`
        );
        if (res.status === 200) {
          setProfile(res.data);
        }
      } catch (error) {
        console.log("Profile fetch failed", error);
      }
    };

    fetchProfile();
  }, []);

  return <Stack />;
}
