import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";
import useBuildingStore from "./store/buildingStore";

export default function ServiceOptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceKey?: string;
    serviceLabel?: string;
    optionId?: string;
    optionTitle?: string;
    optionDescription?: string;
    optionPrice?: string;
    optionImage?: string;
  }>();
  const buildingAddress = useBuildingStore((state: any) => state.address);
  const serviceKey = Array.isArray(params.serviceKey) ? params.serviceKey[0] : params.serviceKey ?? "";
  const optionId = Array.isArray(params.optionId) ? params.optionId[0] : params.optionId ?? "";
  const optionTitle = Array.isArray(params.optionTitle) ? params.optionTitle[0] : params.optionTitle ?? "Service";
  const optionDescription = Array.isArray(params.optionDescription)
    ? params.optionDescription[0]
    : params.optionDescription ?? "Professional service";
  const optionPrice = Number(Array.isArray(params.optionPrice) ? params.optionPrice[0] : params.optionPrice ?? 0);
  const optionImage = Array.isArray(params.optionImage) ? params.optionImage[0] : params.optionImage ?? "";
  const scheduleDate = new Date();
  const scheduleDateLabel = scheduleDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Booking Summary</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.detailCard}>
            <Image source={{ uri: optionImage }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.detailBody}>
              <View style={styles.titleRow}>
                <Text style={styles.serviceName}>{optionTitle}</Text>
                <Text style={styles.price}>₹{optionPrice}</Text>
              </View>
              <Text style={styles.includesLine}>{optionDescription}</Text>
              <View style={styles.providerRow}>
                <View style={styles.providerIcon}>
                  <MaterialCommunityIcons name="shield-check-outline" size={18} color="#1C98ED" />
                </View>
                <Text style={styles.providerText}>Provider: Nestiti Verified Professional</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeading}>Schedule</Text>
              {/* <Text style={styles.link}>Change</Text> */}
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#475569" />
              </View>
              <View>
                  <Text style={styles.infoPrimary}>{scheduleDateLabel}</Text>
                {/* <Text style={styles.infoSecondary}>10:00 AM - 2:00 PM</Text> */}
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeading}>Service Address</Text>
              {/* <Text style={styles.link}>Edit</Text> */}
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.infoPrimary}>{buildingAddress.streetName ? `${buildingAddress.streetName}, ` : ""}{buildingAddress.landmark ? `${buildingAddress.landmark}` : ""}</Text>
                <Text style={styles.infoSecondary}>{buildingAddress.city ? `${buildingAddress.city}, ` : ""}{buildingAddress.state ? `${buildingAddress.state}, ` : ""}{buildingAddress.pincode ? `${buildingAddress.pincode}` : ""}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              router.push({
                pathname: "/service-schedule",
                params: {
                  serviceKey,
                  optionId,
                  optionTitle,
                  optionDescription,
                  optionPrice: String(optionPrice),
                  optionImage,
                },
              } as never)
            }
          >
            <Text style={styles.primaryText}>Schedule</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
    paddingBottom: rvs(14),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  iconBtn: { padding: rs(2) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000" },
  content: { padding: 14, gap: 14, paddingBottom: 30 },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  heroImage: { width: "100%", height: 190 },
  detailBody: { padding: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceName: { fontSize: 21, color: "#0F172A", fontWeight: "500", flex: 1 },
  price: { fontSize: 22, color: "#2799CE", fontWeight: "600" },
  includesLine: { marginTop: 8, fontSize: 14, color: "#64748B", lineHeight: 20 },
  providerRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  providerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(39,153,206,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  providerText: { fontSize: 14, color: "#0F172A", fontWeight: "500" },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 10,
  },
  infoHeader: { flexDirection: "row", justifyContent: "space-between" },
  infoHeading: { fontSize: 15, color: "#0F172A", fontWeight: "500" },
  link: { fontSize: 12, color: "#2799CE" },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  infoPrimary: { fontSize: 14, color: "#0F172A", fontWeight: "500" },
  infoSecondary: { fontSize: 12, color: "#64748B", marginTop: 2 },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  primaryText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
