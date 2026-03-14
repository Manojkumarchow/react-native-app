import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { rms, rs, rvs } from "@/constants/responsive";

export default function ApartmentDetails() {
  const { location, apartment, floor, flat } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.title}>Apartment Details</Text>
        <Text style={styles.item}>Location: {String(location ?? "-")}</Text>
        <Text style={styles.item}>Apartment: {String(apartment ?? "-")}</Text>
        <Text style={styles.item}>Floor: {String(floor ?? "-")}</Text>
        <Text style={styles.item}>Flat: {String(flat ?? "-")}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    padding: rs(16),
    gap: rvs(8),
  },
  title: {
    fontSize: rms(20),
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: rvs(8),
  },
  item: {
    fontSize: rms(14),
    color: "#334155",
  },
});
