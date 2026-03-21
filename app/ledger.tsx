import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "./config";
import useBuildingStore from "./store/buildingStore";
import { rms, rs, rvs } from "@/constants/responsive";

type MonthData = {
  key: string;
  monthYearLabel: string;
  collectionTitle: string;
  collected: number;
  spent: number;
  balance: number;
  flatsPaid: number;
  flatsTotal: number;
  status: "IN_PROGRESS" | "COMPLETED";
  expenses: { label: string; amount: number; icon: keyof typeof MaterialCommunityIcons.glyphMap }[];
  pie: { label: string; value: number; color: string }[];
};

const CURRENT_DATE = new Date();
const CURRENT_MONTH = CURRENT_DATE.toLocaleString("en-US", { month: "short" });
const CURRENT_YEAR = String(CURRENT_DATE.getFullYear());

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 1 }, (_, i) => String(2026 + i)).reverse();

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const PIE_COLORS = ["#8B5CF6", "#F59E0B", "#3B82F6", "#F97316", "#10B981", "#94A3B8", "#06B6D4", "#F43F5E"];

function mapExpenseIcon(label: string): keyof typeof MaterialCommunityIcons.glyphMap {
  const text = label.toLowerCase();
  if (text.includes("watchman")) return "shield-home-outline";
  if (text.includes("garbage")) return "trash-can-outline";
  if (text.includes("lift")) return "elevator-passenger";
  if (text.includes("electric")) return "lightning-bolt-outline";
  if (text.includes("motor")) return "cog-outline";
  if (text.includes("water")) return "water-outline";
  return "clipboard-text-outline";
}

function buildPieSegments(expenses: { label: string; amount: number }[]) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) return [];
  return expenses.map((item, idx) => ({
    label: item.label,
    value: Math.round((item.amount / total) * 100),
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }));
}

function PieDonut({
  data,
  size = 116,
  strokeWidth = 15,
}: {
  data: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, i) => sum + i.value, 0);

  let offsetAccumulator = 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E2E8F0"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {data.map((segment, idx) => {
        const segmentLength = (segment.value / total) * circumference;
        const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
        const strokeDashoffset = -offsetAccumulator;
        offsetAccumulator += segmentLength;
        return (
          <Circle
            key={`${segment.color}-${idx}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}

export default function LedgerScreen() {
  const buildingId = useBuildingStore((s) => s.buildingId);
  const [selectedLabel, setSelectedLabel] = useState(`${CURRENT_MONTH} ${CURRENT_YEAR}`);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempMonth, setTempMonth] = useState(CURRENT_MONTH);
  const [tempYear, setTempYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [backendLedger, setBackendLedger] = useState<{
    totalAmount: number;
    perFlatAmount: number;
    totalFlats: number;
    flatsPaid: number;
    items: { name: string; amount: number }[];
    month: string;
    year: number;
  } | null>(null);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!buildingId) return;
      try {
        setLoading(true);
        setErrorText(null);
        const [month, year] = selectedLabel.split(" ");
        const res = await axios.get(`${BASE_URL}/ledgers`, {
          params: {
            year: Number(year),
            month,
            buildingId: String(buildingId),
          },
        });
        if (res.data) {
          setBackendLedger({
            totalAmount: Number(res.data.totalAmount ?? 0),
            perFlatAmount: Number(res.data.perFlatAmount ?? 0),
            totalFlats: Number(res.data.totalFlats ?? 0),
            flatsPaid: Number(res.data.flatsPaid ?? 0),
            items: Array.isArray(res.data.items)
              ? res.data.items.map((item: any) => ({
                  name: String(item.name ?? "Unknown"),
                  amount: Number(item.amount ?? 0),
                }))
              : [],
            month: String(res.data.month ?? month),
            year: Number(res.data.year ?? year),
          });
        }
      } catch {
        setBackendLedger(null);
        setErrorText("No ledger data found for this month.");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [selectedLabel, buildingId]);

  const uiData = useMemo<MonthData>(() => {
    const monthFromSelection = selectedLabel.split(" ")[0];
    const yearFromSelection = selectedLabel.split(" ")[1];
    const monthYearLabel = `${monthFromSelection} ${yearFromSelection}`;
    const collectionTitle = `${monthFromSelection} Collection`;
    const expenses = (backendLedger?.items ?? []).map((item) => ({
      label: item.name,
      amount: item.amount,
      icon: mapExpenseIcon(item.name),
    }));
    const totalSpent = expenses.reduce((sum, i) => sum + i.amount, 0);
    const collected = backendLedger?.totalAmount ?? 0;
    const flatsTotal = backendLedger?.totalFlats ?? 0;
    const flatsPaid = backendLedger?.flatsPaid ?? 0;
    return {
      key: `${yearFromSelection}-${monthFromSelection}`,
      monthYearLabel,
      collectionTitle,
      collected,
      spent: totalSpent,
      balance: Math.max(0, collected - totalSpent),
      flatsPaid,
      flatsTotal,
      status: flatsTotal > 0 && flatsPaid >= flatsTotal ? "COMPLETED" : "IN_PROGRESS",
      expenses,
      pie: buildPieSegments(expenses),
    };
  }, [selectedLabel, backendLedger]);

  const progressPct = uiData.flatsTotal > 0 ? Math.round((uiData.flatsPaid / uiData.flatsTotal) * 100) : 0;
  const statusUi =
    uiData.status === "COMPLETED"
      ? {
          label: "Completed",
          badgeBg: "rgba(5,150,105,0.12)",
          badgeText: "#36A033",
          progressColor: "#059669",
        }
      : {
          label: "In Progress",
          badgeBg: "rgba(234,179,8,0.12)",
          badgeText: "#A16207",
          progressColor: "#F59E0B",
        };

  const applyPicker = () => {
    setSelectedLabel(`${tempMonth} ${tempYear}`);
    setPickerVisible(false);
  };

  const pieTotal = uiData.pie.reduce((sum, s) => sum + s.value, 0);
  const sharePerFlat = uiData.flatsTotal > 0
    ? Math.round(uiData.expenses.reduce((sum, row) => sum + row.amount, 0) / uiData.flatsTotal)
    : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backTap}>
            <Feather name="arrow-left" size={22} color="#181818" />
          </Pressable>
          <Text style={styles.headerTitle}>Apartment Ledger</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Text style={styles.collectionTitle}>{uiData.collectionTitle}</Text>
            <Pressable
              style={styles.calendarBtn}
              onPress={() => {
                const [m, y] = selectedLabel.split(" ");
                setTempMonth(m);
                setTempYear(y);
                setPickerVisible(true);
              }}
            >
              <Ionicons name="calendar-outline" size={14} color="#1C98ED" />
              <Text style={styles.calendarText}>{selectedLabel}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </Pressable>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Collected</Text>
              <Text style={[styles.metricValue, { color: "#10B981" }]}>
                {formatCurrency(uiData.collected)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Spent</Text>
              <Text style={[styles.metricValue, { color: "#EF4444" }]}>
                {formatCurrency(uiData.spent)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Balance</Text>
              <Text style={[styles.metricValue, { color: "#38BDF8" }]}>
                {formatCurrency(uiData.balance)}
              </Text>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusTop}>
              <Text style={styles.statusTitle}>Collection Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusUi.badgeBg }]}>
                <Text style={[styles.statusBadgeText, { color: statusUi.badgeText }]}>
                  {statusUi.label}
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct}%`, backgroundColor: statusUi.progressColor },
                ]}
              />
            </View>
            <View style={styles.statusBottom}>
              <Text style={styles.statusMeta}>
                {uiData.flatsPaid} of {uiData.flatsTotal} flats paid
              </Text>
              <Text style={styles.statusMeta}>{progressPct}%</Text>
            </View>
          </View>
          {loading ? <ActivityIndicator size="small" color="#1C98ED" /> : null}
          {!loading && errorText ? <Text style={styles.shareText}>{errorText}</Text> : null}

          <View style={styles.expenseSection}>
            <Text style={styles.expenseTitle}>Expense Breakdown</Text>
            <View style={styles.expenseCard}>
              {uiData.expenses.map((row, idx) => (
                <View key={`${row.label}-${idx}`} style={[styles.expenseRow, idx > 0 && styles.expenseRowBorder]}>
                  <View style={styles.expenseLeft}>
                    <MaterialCommunityIcons name={row.icon} size={19} color="#94A3B8" />
                    <Text style={styles.expenseLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>{formatCurrency(row.amount)}</Text>
                </View>
              ))}
              {uiData.expenses.length > 0 ? (
                <View style={styles.expenseTotalRow}>
                  <Text style={styles.expenseTotalLabel}>Total Shared Expenses</Text>
                  <Text style={styles.expenseTotalAmount}>
                    {formatCurrency(uiData.expenses.reduce((sum, i) => sum + i.amount, 0))}
                  </Text>
                </View>
              ) : (
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>No expense breakdown available.</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.pieCard}>
            <Text style={styles.pieTitle}>Where Your Money Goes</Text>
            <View style={styles.pieContent}>
              <View style={styles.pieWrap}>
                <PieDonut data={uiData.pie} />
                <View style={styles.pieCenterLabel}>
                  <Text style={styles.pieCenterTop}>Total</Text>
                  <Text style={styles.pieCenterBottom}>100%</Text>
                </View>
              </View>
              <View style={styles.legend}>
                {uiData.pie.map((segment) => (
                  <View key={segment.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                    <Text style={styles.legendName}>{segment.label}</Text>
                    <Text style={styles.legendValue}>{String(segment.value).padStart(2, "0")}%</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.shareText}>
              Your share of expenses{" "}
              <Text style={styles.shareHighlight}>{formatCurrency(sharePerFlat)}/flat</Text> based on{" "}
              {uiData.flatsTotal} flats in the apartment.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Pick a Date</Text>
            <View style={styles.sheetLists}>
              <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
                {MONTHS.map((month) => (
                  <Pressable
                    key={month}
                    onPress={() => setTempMonth(month)}
                    style={[styles.sheetItem, tempMonth === month && styles.sheetItemActive]}
                  >
                    <Text
                      style={[styles.sheetItemText, tempMonth === month && styles.sheetItemTextActive]}
                    >
                      {month}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
                {YEARS.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setTempYear(year)}
                    style={[styles.sheetItem, tempYear === year && styles.sheetItemActive]}
                  >
                    <Text
                      style={[styles.sheetItemText, tempYear === year && styles.sheetItemTextActive]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Pressable style={styles.viewLedgerBtn} onPress={applyPicker}>
              <Text style={styles.viewLedgerText}>View Ledger</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: rs(16),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
    flexDirection: "row",
    alignItems: "center",
  },
  backTap: { marginRight: rs(8), padding: rs(4) },
  headerTitle: { color: "#1A1A1A", fontSize: rms(18), fontWeight: "500" },
  content: { padding: rs(16), paddingBottom: rvs(30), gap: rs(12) },
  titleRow: {
    marginTop: rvs(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionTitle: { color: "#000000", fontSize: rms(32), fontWeight: "500" },
  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    borderColor: "#1C98ED",
    borderWidth: 1,
    backgroundColor: "#DEF4FF",
    borderRadius: rs(8),
    minHeight: rvs(28),
    paddingHorizontal: rs(7),
  },
  calendarText: { color: "#334155", fontSize: rms(10) },
  metricsGrid: { flexDirection: "row", gap: rs(8) },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: rvs(80),
    paddingHorizontal: rs(12),
    justifyContent: "center",
  },
  metricLabel: { color: "#64748B", fontSize: rms(14), marginBottom: rvs(4) },
  metricValue: { fontSize: rms(16), fontWeight: "500", lineHeight: rms(28) },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  statusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statusTitle: { color: "#09090B", fontSize: 14, fontWeight: "600" },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeText: { fontSize: 14, fontWeight: "500" },
  progressTrack: { height: 9, borderRadius: 999, backgroundColor: "#E2E8F0", overflow: "hidden" },
  progressFill: { height: 9, borderRadius: 999 },
  statusBottom: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
  statusMeta: { color: "#777777", fontSize: 14, fontWeight: "500" },
  expenseSection: { marginTop: 2, gap: 10 },
  expenseTitle: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  expenseRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expenseRowBorder: { borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  expenseLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  expenseLabel: { color: "#111827", fontSize: 16, fontWeight: "500" },
  expenseAmount: { color: "#111827", fontSize: 16, fontWeight: "500" },
  expenseTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#D5E8F5",
    backgroundColor: "rgba(39,153,206,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseTotalLabel: { color: "#2799CE", fontSize: 15, fontWeight: "500" },
  expenseTotalAmount: { color: "#2799CE", fontSize: 16, fontWeight: "600", lineHeight: rms(28) },
  pieCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginTop: 2,
  },
  pieTitle: { color: "#1A1A1A", fontSize: 14, fontWeight: "600", marginBottom: 10 },
  pieContent: { flexDirection: "row", alignItems: "center" },
  pieWrap: { width: 148, height: 148, justifyContent: "center", alignItems: "center" },
  pieCenterLabel: { position: "absolute", alignItems: "center", justifyContent: "center" },
  pieCenterTop: { color: "#6B7280", fontSize: 12 },
  pieCenterBottom: { color: "#1F2937", fontSize: 24, fontWeight: "700" },
  legend: { flex: 1, paddingLeft: 6, gap: 8 },
  legendRow: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendName: { flex: 1, color: "#64748B", fontSize: 11 },
  legendValue: { color: "#374151", fontSize: 11, fontWeight: "500" },
  shareText: { marginTop: 8, color: "#737373", fontSize: 10 },
  shareHighlight: { color: "#1C98ED", fontWeight: "500" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.28)" },
  pickerSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: 430,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#C5CBD3",
    marginBottom: 14,
  },
  sheetTitle: {
    textAlign: "center",
    color: "#111827",
    fontSize: 18,
    lineHeight: rms(28),
    fontWeight: "700",
    marginBottom: 8,
  },
  sheetLists: { flexDirection: "row", gap: 12, maxHeight: 240, marginBottom: 16 },
  sheetList: { flex: 1 },
  sheetItem: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 2,
  },
  sheetItemActive: { backgroundColor: "#DEF4FF" },
  sheetItemText: { color: "#7A7A7A", fontSize: 14, lineHeight: rms(28) },
  sheetItemTextActive: { color: "#1C98ED", fontWeight: "500" },
  viewLedgerBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  viewLedgerText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
