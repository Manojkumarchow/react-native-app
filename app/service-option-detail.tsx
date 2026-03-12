import React from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getOptionById, getServiceByKey, type ServiceKey } from "./data/homeServicesData";

export default function ServiceOptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceKey?: string; optionId?: string }>();
  const service = getServiceByKey(params.serviceKey);
  const option = getOptionById(service.key as ServiceKey, params.optionId);

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
            <Image source={{ uri: option.image }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.detailBody}>
              <View style={styles.titleRow}>
                <Text style={styles.serviceName}>{option.title}</Text>
                <Text style={styles.price}>₹{option.price}</Text>
              </View>
              <Text style={styles.includesLine}>{option.description}</Text>
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
              <Text style={styles.link}>Change</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.infoPrimary}>Sunday, March 15, 2026</Text>
                <Text style={styles.infoSecondary}>10:00 AM - 2:00 PM</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeading}>Service Address</Text>
              <Text style={styles.link}>Edit</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.infoPrimary}>Flat A-101, Sunrise Residency</Text>
                <Text style={styles.infoSecondary}>Kondapur, Hyderabad</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.primaryBtn}
            onPress={() =>
              router.push({
                pathname: "/service-schedule",
                params: { serviceKey: service.key, optionId: option.id },
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { padding: 2 },
  headerTitle: { fontSize: 18, fontWeight: "500", color: "#000" },
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
