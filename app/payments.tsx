import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import useBuildingStore from "./store/buildingStore";
import useProfileStore from "./store/profileStore";
import { BASE_URL } from "./config";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";

type AdminTopTab = "PERSONAL" | "APARTMENT";
type TenantTopTab = "RENT" | "MAINTENANCE";

type ExpenseRow = {
  label: string;
  amount: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type PaymentCurrent = {
  id: number;
  title: string;
  amount: number;
  dueDate: string | null;
  status: "PENDING" | "PAID" | string;
  paidDate: string | null;
};

type PaymentProfileSummary = {
  profileId: string;
  buildingId: string;
  year: number;
  month: string;
  maintenanceCurrent: PaymentCurrent | null;
  maintenanceHistory: PaymentCurrent[];
  rentCurrent: PaymentCurrent | null;
  rentHistory: PaymentCurrent[];
};

type PaymentApartmentSummary = {
  buildingId: string;
  year: number;
  month: string;
  totalCollection: number;
  collected: number;
  pending: number;
  spent: number;
  flatsPaid: number;
  flatsTotal: number;
  perFlatAmount: number;
  dueDate: string | null;
  items: { id?: number; name: string; amount: number }[];
};

const PRIMARY = "#1C98ED";
const BG = "#FAFAFA";
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(date: string | null | undefined): string {
  if (!date) return "--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function iconForExpense(label: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const text = label.toLowerCase();
  if (text.includes("watchman")) return "shield-home-outline";
  if (text.includes("garbage")) return "trash-can-outline";
  if (text.includes("lift")) return "elevator-passenger";
  if (text.includes("electric")) return "lightning-bolt-outline";
  if (text.includes("motor")) return "cog-outline";
  if (text.includes("water")) return "water-outline";
  return "clipboard-text-outline";
}

export default function Payments() {
  const upiId = useBuildingStore((s) => s.upiId);
  const storeBuildingId = useBuildingStore((s) => s.buildingId);
  const role = useProfileStore((s) => s.role);
  const profilePhone = useProfileStore((s) => s.phone);
  const profileUserId = useProfileStore((s) => s.userId);
  const profileBuildingId = useProfileStore((s) => s.buildingId);
  const normalizedRole = (role ?? "").toUpperCase();
  const isOwner = normalizedRole === "OWNER";
  const isTenant = normalizedRole === "USER" || normalizedRole === "TENANT";
  const isAdminView = !isOwner && !isTenant;
  const profileId = profilePhone ?? profileUserId ?? "";
  const buildingId = String(storeBuildingId ?? profileBuildingId ?? "");
  const now = new Date();
  const currentMonth = MONTHS_FULL[now.getMonth()];
  const currentYear = String(now.getFullYear());

  const [adminTab, setAdminTab] = useState<AdminTopTab>("PERSONAL");
  const [tenantTab, setTenantTab] = useState<TenantTopTab>("RENT");
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [tempMonth, setTempMonth] = useState(currentMonth);
  const [tempYear, setTempYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [profileSummary, setProfileSummary] = useState<PaymentProfileSummary | null>(null);
  const [apartmentSummary, setApartmentSummary] = useState<PaymentApartmentSummary | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [apartmentLoading, setApartmentLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [apartmentError, setApartmentError] = useState<string | null>(null);

  const selectedMonthYear = `${selectedMonth} ${selectedYear}`;
  const activeCurrent = useMemo(() => {
    if (isTenant && tenantTab === "RENT") return profileSummary?.rentCurrent ?? null;
    return profileSummary?.maintenanceCurrent ?? null;
  }, [isTenant, tenantTab, profileSummary]);

  const activeHistory = useMemo(() => {
    if (isTenant && tenantTab === "RENT") return profileSummary?.rentHistory ?? [];
    return profileSummary?.maintenanceHistory ?? [];
  }, [isTenant, tenantTab, profileSummary]);

  const apartmentData = useMemo(() => {
    const expenses: ExpenseRow[] = (apartmentSummary?.items ?? []).map((item) => ({
      label: item.name,
      amount: item.amount,
      icon: iconForExpense(item.name),
    }));
    return {
      totalCollection: apartmentSummary?.totalCollection ?? 0,
      dueDateLabel: apartmentSummary?.dueDate
        ? `Due by ${formatDate(apartmentSummary.dueDate)}`
        : `Due by --`,
      collected: apartmentSummary?.collected ?? 0,
      pending: apartmentSummary?.pending ?? 0,
      spent: apartmentSummary?.spent ?? 0,
      flatsPaid: apartmentSummary?.flatsPaid ?? 0,
      flatsTotal: apartmentSummary?.flatsTotal ?? 0,
      expenses,
    };
  }, [apartmentSummary]);

  const apartmentStatus =
    apartmentData.pending > 0
      ? {
          label: "In Progress",
          badgeBg: "rgba(234,179,8,0.12)",
          badgeText: "#A16207",
          progressColor: "#F59E0B",
        }
      : {
          label: "Completed",
          badgeBg: "rgba(5,150,105,0.12)",
          badgeText: "#36A033",
          progressColor: "#059669",
        };

  const paidPercent =
    apartmentData.flatsTotal > 0
      ? Math.round((apartmentData.flatsPaid / apartmentData.flatsTotal) * 100)
      : 0;
  const years = useMemo(
    () => Array.from({ length: 8 }, (_, i) => String(2022 + i)).reverse(),
    [],
  );

  useEffect(() => {
    const run = async () => {
      if (!profileId) return;
      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await axios.get<PaymentProfileSummary>(
          `${BASE_URL}/payments/profile/${profileId}`,
          {
            params: {
              year: Number(selectedYear),
              month: selectedMonth,
            },
          },
        );
        setProfileSummary(response.data);
      } catch (error) {
        setProfileSummary(null);
        setProfileError(getErrorMessage(error, "Unable to fetch profile payments."));
      } finally {
        setProfileLoading(false);
      }
    };
    run();
  }, [profileId, selectedYear, selectedMonth]);

  useEffect(() => {
    const run = async () => {
      if (!isAdminView || adminTab !== "APARTMENT" || !buildingId) return;
      setApartmentLoading(true);
      setApartmentError(null);
      try {
        const response = await axios.get<PaymentApartmentSummary>(`${BASE_URL}/payments/apartment`, {
          params: {
            buildingId,
            year: Number(selectedYear),
            month: selectedMonth,
          },
        });
        setApartmentSummary(response.data);
      } catch (error) {
        setApartmentSummary(null);
        setApartmentError(getErrorMessage(error, "Unable to fetch apartment details."));
      } finally {
        setApartmentLoading(false);
      }
    };
    run();
  }, [isAdminView, adminTab, buildingId, selectedYear, selectedMonth]);

  const handleUpiPress = async () => {
    if (upiId == undefined || !upiId || upiId == null || upiId == "") {
      Toast.show({
        type: "error",
        text1: "Please add UPI ID in the profile",
      });
      return;
    }

    const paymentAmount = activeCurrent?.amount ?? 0;
    if (paymentAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "No amount due",
        text2: "No payable amount available for the selected month.",
      });
      return;
    }

    const paymentTitle = isTenant && tenantTab === "RENT" ? "Monthly Rent" : "Monthly Maintenance";
    const upiUrl = `upi://pay?pa=${upiId}&pn=Nestiti%20${encodeURIComponent(
      paymentTitle,
    )}&tn=${encodeURIComponent(paymentTitle)}&am=${paymentAmount}&cu=INR`;

    const supported = await Linking.canOpenURL(upiUrl);

    if (!supported) {
      Toast.show({
        type: "error",
        text1: "No UPI app found",
        text2: "Install PhonePe, GPay, Paytm, BHIM, CRED or BharatPe",
      });
      return;
    }

    await Linking.openURL(upiUrl);
  };

  const applyMonthYear = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setMonthPickerVisible(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backTap}>
              <Feather name="arrow-left" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payments</Text>
          </View>

          {isAdminView || isTenant ? (
            <View style={styles.tabsWrap}>
              {isAdminView ? (
                <>
                  <Pressable
                    style={[styles.topTab, adminTab === "PERSONAL" && styles.topTabActive]}
                    onPress={() => setAdminTab("PERSONAL")}
                  >
                    <Text
                      style={[
                        styles.topTabText,
                        adminTab === "PERSONAL" && styles.topTabTextActive,
                      ]}
                    >
                      Personal
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.topTab, adminTab === "APARTMENT" && styles.topTabActive]}
                    onPress={() => setAdminTab("APARTMENT")}
                  >
                    <Text
                      style={[
                        styles.topTabText,
                        adminTab === "APARTMENT" && styles.topTabTextActive,
                      ]}
                    >
                      Apartment
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[styles.topTab, tenantTab === "RENT" && styles.topTabActive]}
                    onPress={() => setTenantTab("RENT")}
                  >
                    <Text
                      style={[
                        styles.topTabText,
                        tenantTab === "RENT" && styles.topTabTextActive,
                      ]}
                    >
                      Rent
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.topTab, tenantTab === "MAINTENANCE" && styles.topTabActive]}
                    onPress={() => setTenantTab("MAINTENANCE")}
                  >
                    <Text
                      style={[
                        styles.topTabText,
                        tenantTab === "MAINTENANCE" && styles.topTabTextActive,
                      ]}
                    >
                      Maintenance
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isAdminView ? (
            adminTab === "PERSONAL" ? (
              <>
                <View style={styles.heroCard}>
                  <Text style={styles.heroLabel}>Total Due This Month</Text>
                  <View style={styles.heroAmountRow}>
                    <Text style={styles.heroAmount}>
                      ₹{(activeCurrent?.amount ?? 0).toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.heroDate}>Due by {formatDate(activeCurrent?.dueDate)}</Text>
                  </View>
                  <Pressable style={styles.heroPayBtn} onPress={handleUpiPress}>
                    <Text style={styles.heroPayText}>Pay Now</Text>
                  </Pressable>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Payment History</Text>
                  <Text style={styles.viewAll}>View All</Text>
                </View>

                {profileLoading ? (
                  <ActivityIndicator color={PRIMARY} style={{ marginTop: 16 }} />
                ) : profileError ? (
                  <Text style={styles.emptyText}>{profileError}</Text>
                ) : activeHistory.length === 0 ? (
                  <Text style={styles.emptyText}>No payment history available.</Text>
                ) : (
                  activeHistory.map((row) => (
                    <View style={styles.historyCard} key={`${row.id}-${row.title}`}>
                      <View style={styles.historyLeft}>
                        <View style={styles.historyIconWrap}>
                          <MaterialCommunityIcons
                            name="history"
                            size={18}
                            color="#64748B"
                          />
                        </View>
                        <View>
                          <Text style={styles.historyTitle}>{row.title}</Text>
                          <Text style={styles.historyDate}>{formatDate(row.paidDate ?? row.dueDate)}</Text>
                        </View>
                      </View>
                      <View style={styles.historyRight}>
                        <Text style={styles.historyAmount}>₹{row.amount.toLocaleString("en-IN")}</Text>
                        <View style={row.status === "PAID" ? styles.paidPill : styles.pendingPill}>
                          <Text style={row.status === "PAID" ? styles.paidPillText : styles.pendingPillText}>
                            {row.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              <>
                <View style={styles.apartmentTopRow}>
                  <Text style={styles.apartmentTitle}>{selectedMonth} Collection</Text>
                  <Pressable
                    style={styles.monthPickerBtn}
                    onPress={() => {
                      setTempMonth(selectedMonth);
                      setTempYear(selectedYear);
                      setMonthPickerVisible(true);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={14} color="#1C98ED" />
                    <Text style={styles.monthPickerText}>{selectedMonthYear}</Text>
                    <Ionicons name="chevron-down" size={14} color="#1C98ED" />
                  </Pressable>
                </View>

                {apartmentLoading ? (
                  <ActivityIndicator color={PRIMARY} style={{ marginTop: 16 }} />
                ) : apartmentError ? (
                  <Text style={styles.emptyText}>{apartmentError}</Text>
                ) : null}

                <View style={[styles.heroCard, styles.heroCardTall]}>
                  <Text style={styles.heroLabel}>{selectedMonthYear} · Total Collection</Text>
                  <View style={styles.heroAmountRow}>
                    <Text style={styles.heroAmount}>₹{apartmentData.totalCollection.toLocaleString("en-IN")}</Text>
                    <Text style={styles.heroDate}>{apartmentData.dueDateLabel}</Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Collected</Text>
                      <Text style={styles.metricValue}>₹{apartmentData.collected.toLocaleString("en-IN")}</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Pending</Text>
                      <Text style={styles.metricValue}>₹{apartmentData.pending.toLocaleString("en-IN")}</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Spent</Text>
                      <Text style={styles.metricValue}>₹{apartmentData.spent.toLocaleString("en-IN")}</Text>
                    </View>
                  </View>

                  <Pressable style={styles.heroPayBtnWide} onPress={handleUpiPress}>
                    <Text style={styles.heroPayText}>Pay Now</Text>
                  </Pressable>
                </View>

                <View style={styles.collectionCard}>
                  <View style={styles.collectionTop}>
                    <Text style={styles.collectionTitle}>Collection Status</Text>
                    <View style={[styles.collectionBadge, { backgroundColor: apartmentStatus.badgeBg }]}>
                      <Text style={[styles.collectionBadgeText, { color: apartmentStatus.badgeText }]}>
                        {apartmentStatus.label}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${paidPercent}%`, backgroundColor: apartmentStatus.progressColor },
                      ]}
                    />
                  </View>
                  <View style={styles.collectionBottom}>
                    <Text style={styles.collectionSub}>
                      {apartmentData.flatsPaid} of {apartmentData.flatsTotal} flats paid
                    </Text>
                    <Text style={styles.collectionSub}>{paidPercent}%</Text>
                  </View>
                </View>

                <View style={styles.expenseWrap}>
                  <Text style={styles.expenseHeading}>Expense Breakdown</Text>
                  <View style={styles.expenseCard}>
                    {apartmentData.expenses.length === 0 ? (
                      <View style={styles.expenseRow}>
                        <Text style={styles.emptyText}>No expense items available for this month.</Text>
                      </View>
                    ) : (
                      apartmentData.expenses.map((row, idx) => (
                        <View
                          key={`${row.label}-${idx}`}
                          style={[styles.expenseRow, idx > 0 && styles.expenseRowBorder]}
                        >
                          <View style={styles.expenseLeft}>
                            <MaterialCommunityIcons
                              name={row.icon}
                              size={18}
                              color="#94A3B8"
                            />
                            <Text style={styles.expenseLabel}>{row.label}</Text>
                          </View>
                          <Text style={styles.expenseAmount}>₹{row.amount.toLocaleString("en-IN")}</Text>
                        </View>
                      ))
                    )}
                    <View style={styles.expenseTotalRow}>
                      <Text style={styles.expenseTotalLabel}>Total Shared Expenses</Text>
                      <Text style={styles.expenseTotalAmount}>
                        ₹{apartmentData.totalCollection.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )
          ) : (
            <>
              <View style={[styles.heroCard, isTenant && tenantTab === "RENT" && styles.rentHeroCard]}>
                <Text style={styles.heroLabel}>
                  {isTenant && tenantTab === "RENT" ? "Total Rent Due This Month" : "Total Due This Month"}
                </Text>
                <View style={styles.heroAmountRow}>
                  <Text style={styles.heroAmount}>₹{(activeCurrent?.amount ?? 0).toLocaleString("en-IN")}</Text>
                  <Text style={styles.heroDate}>Due by {formatDate(activeCurrent?.dueDate)}</Text>
                </View>
                <Pressable style={styles.heroPayBtn} onPress={handleUpiPress}>
                  <Text style={styles.heroPayText}>Pay Now</Text>
                </Pressable>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment History</Text>
                <Text style={styles.viewAll}>View All</Text>
              </View>

              {profileLoading ? (
                <ActivityIndicator color={PRIMARY} style={{ marginTop: 16 }} />
              ) : profileError ? (
                <Text style={styles.emptyText}>{profileError}</Text>
              ) : activeHistory.length === 0 ? (
                <Text style={styles.emptyText}>No payment history available.</Text>
              ) : (
                activeHistory.map((row) => (
                  <View style={styles.historyCard} key={`${row.id}-${row.title}`}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyIconWrap}>
                        <MaterialCommunityIcons
                          name="history"
                          size={18}
                          color="#64748B"
                        />
                      </View>
                      <View>
                        <Text style={styles.historyTitle}>{row.title}</Text>
                        <Text style={styles.historyDate}>{formatDate(row.paidDate ?? row.dueDate)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyAmount}>₹{row.amount.toLocaleString("en-IN")}</Text>
                      <View style={row.status === "PAID" ? styles.paidPill : styles.pendingPill}>
                        <Text style={row.status === "PAID" ? styles.paidPillText : styles.pendingPillText}>
                          {row.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={monthPickerVisible && isAdminView && adminTab === "APARTMENT"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.monthModal}>
            <Text style={styles.monthModalTitle}>Select month & year</Text>
            <View style={styles.monthYearRow}>
              <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
                {MONTHS_FULL.map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.monthItem, tempMonth === m && styles.monthItemActive]}
                    onPress={() => setTempMonth(m)}
                  >
                    <Text
                      style={[styles.monthItemText, tempMonth === m && styles.monthItemTextActive]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={styles.monthList} showsVerticalScrollIndicator={false}>
                {years.map((y) => (
                  <Pressable
                    key={y}
                    style={[styles.monthItem, tempYear === y && styles.monthItemActive]}
                    onPress={() => setTempYear(y)}
                  >
                    <Text
                      style={[styles.monthItemText, tempYear === y && styles.monthItemTextActive]}
                    >
                      {y}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setMonthPickerVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalApply} onPress={applyMonthYear}>
                <Text style={styles.modalApplyText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(8),
    borderBottomRightRadius: rs(8),
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    paddingHorizontal: rs(20),
    paddingTop: rvs(8),
    paddingBottom: rvs(14),
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: rvs(12) },
  backTap: { marginRight: rs(8), padding: rs(4) },
  headerTitle: {
    color: "#1A1A1A",
    fontSize: rms(18),
    fontWeight: "500",
  },
  tabsWrap: {
    backgroundColor: "#F1F5F9",
    borderRadius: rs(24),
    padding: rs(4),
    flexDirection: "row",
  },
  topTab: {
    flex: 1,
    minHeight: rvs(36),
    borderRadius: rs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  topTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: rs(2),
    elevation: 1,
  },
  topTabText: {
    color: "#64748B",
    fontSize: rms(14),
    fontWeight: "500",
  },
  topTabTextActive: { color: "#2899CF" },
  scroll: { flex: 1 },
  content: { padding: rs(20), paddingBottom: rvs(28), gap: rs(20) },
  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: rs(20),
    paddingHorizontal: rs(24),
    paddingTop: rvs(23),
    paddingBottom: rvs(24),
    shadowColor: "#2899CF",
    shadowOpacity: 0.2,
    shadowRadius: rs(8),
    elevation: 3,
  },
  heroCardTall: { minHeight: 260 },
  rentHeroCard: {
    backgroundColor: "#8B5CF6",
  },
  heroLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "500", marginBottom: 6 },
  heroAmountRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  heroAmount: { color: "#FFFFFF", fontSize: 32, fontWeight: "700", letterSpacing: -0.8 },
  heroDate: { color: "#FFFFFF", fontSize: 10, marginBottom: 7 },
  heroPayBtn: {
    marginTop: 16,
    width: 118,
    height: 41,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPayBtnWide: {
    marginTop: 18,
    width: "100%",
    height: 41,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPayText: { color: "#1C98ED", fontSize: 14, fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: { color: "#1A1A1A", fontSize: 18, fontWeight: "500" },
  viewAll: { color: "#1C98ED", fontSize: 14, fontWeight: "500" },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F8FAFC",
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  historyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  historyTitle: { color: "#1A1A1A", fontSize: 14, fontWeight: "500" },
  historyDate: { color: "#64748B", fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: "flex-end", gap: 4 },
  historyAmount: { color: "#1A1A1A", fontSize: 14, fontWeight: "500" },
  paidPill: { backgroundColor: "#DCFCE7", borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  paidPillText: { color: "#16A34A", fontSize: 10, textTransform: "uppercase", fontWeight: "600" },
  pendingPill: { backgroundColor: "#FEF3C7", borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 },
  pendingPillText: { color: "#A16207", fontSize: 10, textTransform: "uppercase", fontWeight: "600" },
  emptyText: { color: "#64748B", fontSize: 13, marginTop: 8 },
  apartmentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  apartmentTitle: { color: "#000000", fontSize: 18, fontWeight: "500" },
  monthPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(222,244,255,0.34)",
    borderColor: "#1C98ED",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 30,
  },
  monthPickerText: { color: "#09090B", fontSize: 10 },
  metricsRow: { marginTop: 11, flexDirection: "row", alignItems: "flex-end", width: "100%", gap: 8 },
  metricCol: { flex: 1 },
  metricLabel: { color: "#FFFFFF", fontSize: 12 },
  metricValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginTop: 2 },
  metricDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" },
  collectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
  },
  collectionTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  collectionTitle: { color: "#09090B", fontSize: 14, fontWeight: "600" },
  collectionBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  collectionBadgeText: { fontSize: 14, fontWeight: "500" },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: "#F1F5F9", overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 999 },
  collectionBottom: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
  collectionSub: { color: "#777777", fontSize: 14, fontWeight: "500" },
  expenseWrap: { gap: 12, paddingTop: 8 },
  expenseHeading: { color: "#0F172A", fontSize: 14, fontWeight: "500", marginLeft: 4 },
  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 24,
    overflow: "hidden",
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  expenseRowBorder: { borderTopColor: "#F8FAFC", borderTopWidth: 1 },
  expenseLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  expenseLabel: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  expenseAmount: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  expenseTotalRow: {
    borderTopColor: "rgba(39,153,206,0.1)",
    borderTopWidth: 1,
    backgroundColor: "rgba(39,153,206,0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  expenseTotalLabel: { color: "#2799CE", fontSize: 14, fontWeight: "500" },
  expenseTotalAmount: { color: "#2799CE", fontSize: 28, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  monthModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  monthModalTitle: { color: "#111827", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  monthYearRow: { flexDirection: "row", gap: 10, maxHeight: 220 },
  monthList: { flex: 1 },
  monthItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  monthItemActive: { borderColor: "#1C98ED", backgroundColor: "rgba(222,244,255,0.34)" },
  monthItemText: { color: "#334155", fontSize: 14 },
  monthItemTextActive: { color: "#1C98ED", fontWeight: "600" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  modalCancel: {
    height: 40,
    minWidth: 92,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { color: "#64748B", fontWeight: "500" },
  modalApply: {
    height: 40,
    minWidth: 92,
    borderRadius: 10,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  modalApplyText: { color: "#FFFFFF", fontWeight: "600" },
});
