import { useLocalSearchParams } from "expo-router";

export default function ApartmentDetails() {
  const { location, apartment, floor, flat } = useLocalSearchParams();

  return (
    <h2>ApartmentDetails</h2>
  );
}
