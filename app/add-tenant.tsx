import React from "react";
import { Stack } from "expo-router";
import AddResidentFormScreen from "./components/AddResidentFormScreen";

export default function AddTenantScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AddResidentFormScreen variant="tenant" />
    </>
  );
}
