import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getServiceByKey, serviceCatalog, type ServiceKey } from "./data/homeServicesData";
import axios from "axios";
import { BASE_URL } from "./config";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

export default function HomeServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const [catalog, setCatalog] = React.useState(serviceCatalog);
  const selectedService =
    catalog.find((service) => service.key === (params.service as ServiceKey)) ?? catalog[0];

  React.useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/service/catalog/all`);
        if (Array.isArray(res.data) && res.data.length) {
          const fallbackMap = new Map(serviceCatalog.map((s) => [s.key, s]));
          const normalized = res.data.map((item: any) => {
            const fallback = fallbackMap.get(String(item.key ?? "") as any);
            const incomingOptions = Array.isArray(item.options) ? item.options : [];
            const options =
              incomingOptions.length > 0
                ? incomingOptions.map((opt: any, idx: number) => {
                    const fallbackOption = fallback?.options[idx];
                    return {
                      id: String(opt.id ?? fallbackOption?.id ?? `${item.key}-opt-${idx}`),
                      title: String(opt.title ?? fallbackOption?.title ?? "Service"),
                      description: String(
                        opt.description ?? fallbackOption?.description ?? "Professional service",
                      ),
                      price: Number(opt.price ?? fallbackOption?.price ?? 0),
                      image: String(opt.image ?? fallbackOption?.image ?? ""),
                      popular: Boolean(opt.popular ?? fallbackOption?.popular ?? false),
                    };
                  })
                : fallback?.options ?? [];
            return {
              key: String(item.key ?? fallback?.key ?? "service"),
              label: String(item.label ?? fallback?.label ?? "Service"),
              subtitle: String(item.subtitle ?? fallback?.subtitle ?? ""),
              icon: String(item.icon ?? fallback?.icon ?? "tools"),
              options,
            };
          });
          setCatalog(normalized);
        }
      } catch {
        setCatalog(serviceCatalog);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>{selectedService.label}</Text>
          </View>
          <Text style={styles.subtitle}>{selectedService.subtitle}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {catalog.map((item) => {
              const active = item.key === selectedService.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onPress={() => router.replace({ pathname: "/home-services", params: { service: item.key } } as never)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={16}
                    color={active ? "#FAFAFA" : "#1C98ED"}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedService.options.map((option) => (
            <View key={option.id} style={styles.card}>
              {option.image ? (
                <Image source={{ uri: option.image }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, styles.cardImageFallback]}>
                  <MaterialCommunityIcons name="image-off-outline" size={rs(28)} color="#94A3B8" />
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  {option.popular ? <Text style={styles.popularBadge}>POPULAR</Text> : null}
                  <Text style={styles.verifiedBadge}>Nestiti Verified</Text>
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>₹{option.price}</Text>
                  <Pressable
                    style={styles.bookBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/service-option-detail",
                        params: {
                          serviceKey: selectedService.key,
                          optionId: option.id,
                        },
                      } as never)
                    }
                  >
                    <Text style={styles.bookText}>Book</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
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
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
    paddingBottom: rvs(14),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: rs(8) },
  iconBtn: { padding: rs(2) },
  headerTitle: { fontSize: rms(18), fontWeight: "500", color: "#000000" },
  subtitle: { marginTop: rvs(10), fontSize: rms(14), color: "#777777", fontWeight: "500" },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 36, gap: 16 },
  tabRow: { gap: 8, paddingBottom: 4 },
  tabChip: {
    minWidth: 110,
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabChipActive: { backgroundColor: "#1C98ED" },
  tabText: { color: "#1C98ED", fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: "#FAFAFA" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(40,153,207,0.08)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: { width: "100%", height: 240 },
  cardImageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  cardContent: { padding: 14 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    color: "#2899CF",
    backgroundColor: "rgba(40,153,207,0.1)",
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    color: "#059669",
    backgroundColor: "#ECFDF5",
  },
  optionTitle: { fontSize: 20, fontWeight: "500", color: "#181818", marginBottom: 4 },
  optionDescription: { fontSize: 12, color: "#777777", lineHeight: 17, marginBottom: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceText: { fontSize: 24, fontWeight: "500", color: "#0F161A" },
  bookBtn: {
    backgroundColor: "#1C98ED",
    borderRadius: 999,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
  },
  bookText: { fontSize: 14, fontWeight: "500", color: "#FAFAFA" },
});
