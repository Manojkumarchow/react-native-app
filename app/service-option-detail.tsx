import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { rms, rs, rvs } from "@/constants/responsive";
import { BASE_URL } from "./config";
import useBuildingStore from "./store/buildingStore";
import {
  buildBookingTitle,
  normalizeServiceOptionFromApi,
  type ServiceCatalogLine,
  type ServiceOption,
} from "./data/homeServicesData";
import { getGlobalServiceImageFallback, getSubcategoryImageUri } from "./data/homeServiceSubcategoryImages";

function firstStr(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default function ServiceOptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceKey?: string;
    serviceLabel?: string;
    optionId?: string;
    pricedOptionId?: string;
    optionTitle?: string;
    optionDescription?: string;
    optionPrice?: string;
    needsVariantPick?: string;
  }>();
  const buildingAddress = useBuildingStore((state: any) => state.address);
  const serviceKey = firstStr(params.serviceKey);
  const optionId = firstStr(params.optionId);
  const pricedOptionIdParam = firstStr(params.pricedOptionId);
  const optionTitleParam = firstStr(params.optionTitle) || "Service";
  const optionDescription = firstStr(params.optionDescription) || "Professional service";
  const optionPriceParam = Number(firstStr(params.optionPrice) || 0);
  const needsVariantPick = firstStr(params.needsVariantPick) === "1";

  const staticHeroUri = React.useMemo(
    () => getSubcategoryImageUri(optionId, serviceKey),
    [optionId, serviceKey],
  );
  const [heroImageFailed, setHeroImageFailed] = React.useState(false);
  const heroUri = heroImageFailed ? getGlobalServiceImageFallback() : staticHeroUri;

  React.useEffect(() => {
    setHeroImageFailed(false);
  }, [optionId, serviceKey, staticHeroUri]);

  const [loadingCatalog, setLoadingCatalog] = React.useState(needsVariantPick);
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [catalogOption, setCatalogOption] = React.useState<ServiceOption | null>(null);
  const [selectedPricedId, setSelectedPricedId] = React.useState<string | null>(
    pricedOptionIdParam || null,
  );

  React.useEffect(() => {
    if (!needsVariantPick || !serviceKey || !optionId) {
      setLoadingCatalog(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingCatalog(true);
      setCatalogError(null);
      try {
        const res = await axios.get(`${BASE_URL}/service/catalog/all`);
        const list = Array.isArray(res.data) ? res.data : [];
        const cat = list.find((c: any) => c.key === serviceKey) as any;
        const rawOpt = cat?.options?.find((o: any) => o.id === optionId) ?? null;
        if (cancelled) return;
        if (!rawOpt) {
          setCatalogError("This service is no longer available.");
          setCatalogOption(null);
        } else {
          setCatalogOption(
            normalizeServiceOptionFromApi(rawOpt, {
              categoryKey: serviceKey,
              optionIndex: 0,
            }),
          );
        }
      } catch {
        if (!cancelled) setCatalogError("Could not load pricing options.");
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [needsVariantPick, serviceKey, optionId]);

  const selectedPair = React.useMemo(() => {
    if (!catalogOption?.serviceLines?.length) return null;
    for (const line of catalogOption.serviceLines) {
      for (const priced of line.pricedOptions ?? []) {
        if (priced.id === selectedPricedId) {
          return { line, priced };
        }
      }
    }
    return null;
  }, [catalogOption, selectedPricedId]);

  const displayTitle = React.useMemo(() => {
    if (needsVariantPick && selectedPair) {
      return buildBookingTitle(catalogOption!.title, selectedPair.line, selectedPair.priced);
    }
    return optionTitleParam;
  }, [needsVariantPick, selectedPair, catalogOption, optionTitleParam]);

  const displayPrice = React.useMemo(() => {
    if (needsVariantPick && selectedPair) return selectedPair.priced.price;
    return optionPriceParam;
  }, [needsVariantPick, selectedPair, optionPriceParam]);

  const scheduleOptionId = selectedPricedId || pricedOptionIdParam || optionId;

  const canSchedule = !needsVariantPick || Boolean(selectedPricedId);

  const scheduleDate = new Date();
  const scheduleDateLabel = scheduleDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const onSelectPriced = (_line: ServiceCatalogLine, pricedId: string) => {
    setSelectedPricedId(pricedId);
  };

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
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setHeroImageFailed(true)}
            />
            <View style={styles.detailBody}>
              <View style={styles.titleRow}>
                <Text style={styles.serviceName}>{displayTitle}</Text>
                <Text style={styles.price}>
                  {needsVariantPick && !selectedPair ? "—" : `₹${displayPrice}`}
                </Text>
              </View>
              <Text style={styles.includesLine}>{optionDescription}</Text>
              {needsVariantPick ? (
                <View style={styles.variantSection}>
                  {loadingCatalog ? (
                    <ActivityIndicator color="#1C98ED" style={{ marginVertical: 12 }} />
                  ) : catalogError ? (
                    <Text style={styles.errorText}>{catalogError}</Text>
                  ) : catalogOption?.serviceLines?.length ? (
                    catalogOption.serviceLines.map((line) => (
                      <View key={line.id} style={styles.lineBlock}>
                        {/* <Text style={styles.lineHeading}>
                          {line.serviceName}
                          {line.variantLabel ? ` · ${line.variantLabel}` : ""}
                        </Text> */}
                        <View style={styles.chipRow}>
                          {(line.pricedOptions ?? []).map((po) => {
                            const active = selectedPricedId === po.id;
                            return (
                              <Pressable
                                key={po.id}
                                onPress={() => onSelectPriced(line, po.id)}
                                style={[styles.chip, active && styles.chipActive]}
                              >
                                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                                  {po.label}
                                </Text>
                                <Text style={[styles.chipPrice, active && styles.chipPriceActive]}>
                                  ₹{po.price}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    ))
                  ) : null}
                </View>
              ) : null}
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
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.infoPrimary}>{scheduleDateLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeading}>Service Address</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.infoPrimary}>
                  {buildingAddress.streetName ? `${buildingAddress.streetName}, ` : ""}
                  {buildingAddress.landmark ? `${buildingAddress.landmark}` : ""}
                </Text>
                <Text style={styles.infoSecondary}>
                  {buildingAddress.city ? `${buildingAddress.city}, ` : ""}
                  {buildingAddress.state ? `${buildingAddress.state}, ` : ""}
                  {buildingAddress.pincode ? `${buildingAddress.pincode}` : ""}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.primaryBtn, !canSchedule && styles.primaryBtnDisabled]}
            disabled={!canSchedule}
            onPress={() =>
              router.push({
                pathname: "/service-schedule",
                params: {
                  serviceKey,
                  optionId: scheduleOptionId,
                  optionTitle: displayTitle,
                  optionDescription,
                  optionPrice: String(displayPrice),
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
  serviceName: { fontSize: 21, color: "#0F172A", fontWeight: "500", flex: 1, marginRight: 8 },
  price: { fontSize: 22, color: "#2799CE", fontWeight: "600" },
  includesLine: { marginTop: 8, fontSize: 14, color: "#64748B", lineHeight: 20 },
  variantSection: { marginTop: 12 },
  lineBlock: { marginBottom: 14 },
  lineHeading: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
  },
  chipActive: { borderColor: "#1C98ED", backgroundColor: "rgba(28,152,237,0.08)" },
  chipLabel: { fontSize: 13, color: "#334155", fontWeight: "500" },
  chipLabelActive: { color: "#0F172A" },
  chipPrice: { fontSize: 12, color: "#64748B", marginTop: 2 },
  chipPriceActive: { color: "#1C98ED", fontWeight: "600" },
  errorText: { color: "#B91C1C", fontSize: 14, marginTop: 8 },
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
  primaryBtnDisabled: { opacity: 0.45 },
  primaryText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
