import React, { useEffect } from "react";
import { BackHandler } from "react-native";
import AuthScreen from "./auth";

export default function LoginScreen() {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return <AuthScreen />;
}
