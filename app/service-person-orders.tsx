import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";
import { getOpenServiceOrders, type ServiceOrderPoolItem } from "./services/service-person-pool.service";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND_BLUE = "#1c98ed";

export default function ServicePersonOrdersScreen() {
  const router = useRouter();
  const phone = useProfileStore((s) => s.phone);

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [orders, setOrders] = useState<ServiceOrderPoolItem[]>([]);

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceOrderPoolItem[]>();
    for (const o of orders) {
      const key = o.category || "Service";
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [orders]);

  useEffect(() => {
    const run = async () => {
      if (!phone) return;
      try {
        setLoading(true);
        setErrorText(null);
        const rows = await getOpenServiceOrders(phone);
        setOrders(rows);
      } catch (e) {
        setErrorText(getErrorMessage(e, "Unable to fetch orders."));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [phone]);

  const dateTimeLabel = (dateStr: string | undefined, timeSlot: string | undefined) => {
    if (!dateStr) return `-- · ${timeSlot ?? "--"}`;
    const d = new Date(dateStr);
    const dateLabel = Number.isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    return `${dateLabel} · ${timeSlot ?? "--"}`;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Orders</Text>
            <View style={styles.spacer} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={BRAND_BLUE} />
              <Text style={styles.loadingText}>Loading open requests...</Text>
            </View>
          ) : errorText ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{errorText}</Text>
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No open orders found.</Text>
            </View>
          ) : (
            grouped.map(({ category, items }) => (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionTitle}>{category}</Text>
                {items.map((item) => (
                  <Pressable
                    key={item.orderId}
                    style={styles.orderCard}
                    onPress={() =>
                      router.push({
                        pathname: "/service-person-order-detail",
                        params: {
                          orderId: String(item.orderId),
                          category: item.category,
                          subcategory: item.subcategory,
                          description: item.description,
                          location: item.location,
                          date: item.date,
                          timeSlot: item.timeSlot,
                          buildingName: item.buildingName ?? "",
                          bookingPersonName: item.bookingPersonName ?? "",
                          bookingPersonPhone: item.bookingPersonPhone ?? "",
                          optionId: item.optionId ?? "",
                          amount: String(item.amount ?? 0),
                        },
                      } as never)
                    }
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="tools" size={18} color={BRAND_BLUE} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.subcategory}</Text>
                        <Text style={styles.cardSub}>{item.location}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBottom}>
                      <Text style={styles.dateText}>{dateTimeLabel(item.date, item.timeSlot)}</Text>
                      {item.buildingName ? <Text style={styles.buildingText}>{item.buildingName}</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </ScrollView>
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
  headerRow: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: rs(4) },
  headerTitle: { flex: 1, fontSize: rms(20), fontWeight: "700", color: "#0F172A" },
  spacer: { width: rs(24) },
  content: { padding: rs(16), paddingBottom: rvs(24) },
  center: { alignItems: "center", marginTop: rvs(24), gap: rvs(10) },
  loadingText: { color: "#64748B", fontSize: rms(14) },
  emptyWrap: { marginTop: rvs(24) },
  emptyText: { textAlign: "center", color: "#64748B", fontSize: rms(15) },
  section: { marginBottom: rvs(18) },
  sectionTitle: { fontSize: rms(14), fontWeight: "700", color: "#475569", marginBottom: rvs(10) },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: rs(16),
    padding: rs(14),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: rvs(12),
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: rs(12) },
  iconCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: "rgba(39,153,206,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: rms(16), fontWeight: "700", color: "#0F172A", marginBottom: rvs(3) },
  cardSub: { color: "#64748B", fontSize: rms(13) },
  cardBottom: { marginTop: rvs(10) },
  dateText: { color: "#475569", fontSize: rms(13) },
  buildingText: { marginTop: rvs(6), color: "#64748B", fontSize: rms(13) },
});

