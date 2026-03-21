import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Dimensions } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { serviceCatalog } from "./data/homeServicesData";
import axios from "axios";
import { BASE_URL } from "./config";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

const DEFAULT_CATEGORY_IMAGES: Record<string, string[]> = {
  "appliance-service": [
    "https://images.unsplash.com/photo-1581578731548-52f8d69d89f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1631646103285-3d1f95f8f6f0?auto=format&fit=crop&w=1200&q=80",
  ],
  cleaning: ["https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80"],
  painting: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80"],
  "pest-control": ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"],
  "floor-polishing": ["https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1200&q=80"],
  "home-repair-services": ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"],
  "packers-movers": ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80"],
  "facility-management": ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"],
};

const getCategoryFallbackImage = (categoryKey: string, index: number) => {
  const list = DEFAULT_CATEGORY_IMAGES[categoryKey];
  if (!list || list.length === 0) return "";
  return list[index % list.length];
};

const pickNonEmptyImage = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized.length > 0) {
      return normalized;
    }
  }
  return "";
};

export default function HomeServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const [catalog, setCatalog] = React.useState(serviceCatalog);
  const [failedImageIds, setFailedImageIds] = React.useState<Record<string, boolean>>({});
  const tabScrollRef = React.useRef<ScrollView>(null);
  const [chipLayouts, setChipLayouts] = React.useState<Record<string, { x: number; width: number }>>({});
  const screenWidth = Dimensions.get("window").width;
  const selectedService =
    catalog.find((service) => service.key === String(params.service ?? "")) ?? catalog[0];

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
                      image: pickNonEmptyImage(
                        opt.image,
                        fallbackOption?.image,
                        getCategoryFallbackImage(String(item.key ?? ""), idx),
                      ),
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

  React.useEffect(() => {
    const selectedKey = selectedService?.key;
    if (!selectedKey) return;
    const layout = chipLayouts[selectedKey];
    if (!layout) return;
    const targetX = Math.max(0, layout.x + layout.width / 2 - screenWidth / 2);
    tabScrollRef.current?.scrollTo({ x: targetX, animated: true });
  }, [selectedService?.key, chipLayouts, screenWidth]);

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
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {catalog.map((item) => {
              const active = item.key === selectedService.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.tabChip, active && styles.tabChipActive]}
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    setChipLayouts((prev) => {
                      const prevItem = prev[item.key];
                      if (prevItem && prevItem.x === x && prevItem.width === width) {
                        return prev;
                      }
                      return { ...prev, [item.key]: { x, width } };
                    });
                  }}
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

          {selectedService.options.map((option, idx) => {
            const fallbackImage = getCategoryFallbackImage(selectedService.key, idx);
            const shouldUseFallback = failedImageIds[option.id] || !String(option.image ?? "").trim();
            const resolvedImage = shouldUseFallback ? fallbackImage : option.image;
            return (
            <View key={option.id} style={styles.card}>
              {resolvedImage ? (
                <Image
                  source={{ uri: resolvedImage }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  onError={() => {
                    setFailedImageIds((prev) => ({ ...prev, [option.id]: true }));
                  }}
                />
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
                          serviceLabel: selectedService.label,
                          optionId: option.id,
                          optionTitle: option.title,
                          optionDescription: option.description,
                          optionPrice: String(option.price),
                          optionImage: option.image,
                        },
                      } as never)
                    }
                  >
                    <Text style={styles.bookText}>Book</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )})}
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
