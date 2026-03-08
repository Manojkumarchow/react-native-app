import { useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth");
  }, [router]);

  return null;
}
