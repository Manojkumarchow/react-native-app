import React from "react";
import { Stack } from "expo-router";
import AddResidentFormScreen from "./components/AddResidentFormScreen";

export default function AddAdminScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AddResidentFormScreen variant="admin" />
    </>
  );
}
