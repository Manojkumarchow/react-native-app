import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND_BLUE = "#1c98ed";

export default function ServicePersonHome() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Orders</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Pressable style={styles.ordersCard} onPress={() => router.push("/service-person-orders")}>
            <View style={styles.left}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={BRAND_BLUE} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.ordersTitle}>Orders</Text>
                <Text style={styles.ordersSubtitle}>Open requests you can accept or reject.</Text>
              </View>
            </View>

            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: rms(20),
    fontWeight: "700",
    color: "#0F172A",
  },
  content: { flex: 1, padding: rs(16) },
  ordersCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  left: { flexDirection: "row", alignItems: "center", gap: rs(12) },
  iconCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(39,153,206,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  ordersTitle: {
    fontSize: rms(18),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: rvs(4),
  },
  ordersSubtitle: { fontSize: rms(13), color: "#64748B" },
});

