import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import Svg, { Circle } from "react-native-svg";

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

const BASE_EXPENSES = [
  { label: "Watchman Salary", amount: 12000, icon: "shield-home-outline" as const },
  { label: "Garbage Collection", amount: 2000, icon: "trash-can-outline" as const },
  { label: "Lift Maintenance", amount: 5000, icon: "elevator-passenger" as const },
  { label: "Common Area Electricity", amount: 4000, icon: "lightning-bolt-outline" as const },
  { label: "Motor Maintenance", amount: 2000, icon: "cog-outline" as const },
  { label: "Miscellaneous", amount: 996, icon: "clipboard-text-outline" as const },
];

const SAMPLE_MONTHS: MonthData[] = [
  {
    key: "2024-03",
    monthYearLabel: "Mar 2024",
    collectionTitle: "March Collection",
    collected: 18000,
    spent: 0,
    balance: 2000,
    flatsPaid: 6,
    flatsTotal: 10,
    status: "IN_PROGRESS",
    expenses: BASE_EXPENSES,
    pie: [
      { label: "Watchman", value: 27, color: "#8B5CF6" },
      { label: "Water", value: 23, color: "#F59E0B" },
      { label: "Lift", value: 18, color: "#3B82F6" },
      { label: "Electricity", value: 14, color: "#F97316" },
      { label: "Garbage", value: 12, color: "#10B981" },
      { label: "Miscellaneous", value: 2, color: "#94A3B8" },
    ],
  },
  {
    key: "2025-04",
    monthYearLabel: "Apr 2025",
    collectionTitle: "April Collection",
    collected: 28800,
    spent: 28000,
    balance: 800,
    flatsPaid: 10,
    flatsTotal: 10,
    status: "COMPLETED",
    expenses: BASE_EXPENSES,
    pie: [
      { label: "Watchman", value: 30, color: "#8B5CF6" },
      { label: "Water", value: 21, color: "#F59E0B" },
      { label: "Lift", value: 17, color: "#3B82F6" },
      { label: "Electricity", value: 14, color: "#F97316" },
      { label: "Garbage", value: 13, color: "#10B981" },
      { label: "Miscellaneous", value: 5, color: "#94A3B8" },
    ],
  },
];

const getCurrentDefaultData = (): MonthData => {
  const defaultLabel = `${CURRENT_MONTH} ${CURRENT_YEAR}`;
  return {
    key: `${CURRENT_YEAR}-${String(CURRENT_DATE.getMonth() + 1).padStart(2, "0")}`,
    monthYearLabel: defaultLabel,
    collectionTitle: `${CURRENT_DATE.toLocaleString("en-US", { month: "long" })} Collection`,
    collected: 18000,
    spent: 0,
    balance: 2000,
    flatsPaid: 6,
    flatsTotal: 10,
    status: "IN_PROGRESS",
    expenses: BASE_EXPENSES,
    pie: SAMPLE_MONTHS[0].pie,
  };
};

const INITIAL_DATA = (() => {
  const currentLabel = `${CURRENT_MONTH} ${CURRENT_YEAR}`;
  const found = SAMPLE_MONTHS.find((m) => m.monthYearLabel === currentLabel);
  if (found) return SAMPLE_MONTHS;
  return [getCurrentDefaultData(), ...SAMPLE_MONTHS];
})();

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 9 }, (_, i) => String(2022 + i)).reverse();

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

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
  const [selectedLabel, setSelectedLabel] = useState(`${CURRENT_MONTH} ${CURRENT_YEAR}`);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempMonth, setTempMonth] = useState(CURRENT_MONTH);
  const [tempYear, setTempYear] = useState(CURRENT_YEAR);

  const activeData = useMemo(() => {
    const found = INITIAL_DATA.find((m) => m.monthYearLabel === selectedLabel);
    return found ?? INITIAL_DATA[0];
  }, [selectedLabel]);

  const progressPct = Math.round((activeData.flatsPaid / activeData.flatsTotal) * 100);
  const statusUi =
    activeData.status === "COMPLETED"
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

  const pieTotal = activeData.pie.reduce((sum, s) => sum + s.value, 0);
  const sharePerFlat = Math.round(
    activeData.expenses.reduce((sum, row) => sum + row.amount, 0) / activeData.flatsTotal,
  );

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
            <Text style={styles.collectionTitle}>{activeData.collectionTitle}</Text>
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
                {formatCurrency(activeData.collected)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Spent</Text>
              <Text style={[styles.metricValue, { color: "#EF4444" }]}>
                {formatCurrency(activeData.spent)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Balance</Text>
              <Text style={[styles.metricValue, { color: "#38BDF8" }]}>
                {formatCurrency(activeData.balance)}
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
                {activeData.flatsPaid} of {activeData.flatsTotal} flats paid
              </Text>
              <Text style={styles.statusMeta}>{progressPct}%</Text>
            </View>
          </View>

          <View style={styles.expenseSection}>
            <Text style={styles.expenseTitle}>Expense Breakdown</Text>
            <View style={styles.expenseCard}>
              {activeData.expenses.map((row, idx) => (
                <View key={`${row.label}-${idx}`} style={[styles.expenseRow, idx > 0 && styles.expenseRowBorder]}>
                  <View style={styles.expenseLeft}>
                    <MaterialCommunityIcons name={row.icon} size={19} color="#94A3B8" />
                    <Text style={styles.expenseLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>{formatCurrency(row.amount)}</Text>
                </View>
              ))}
              <View style={styles.expenseTotalRow}>
                <Text style={styles.expenseTotalLabel}>Total Shared Expenses</Text>
                <Text style={styles.expenseTotalAmount}>
                  {formatCurrency(activeData.expenses.reduce((sum, i) => sum + i.amount, 0))}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pieCard}>
            <Text style={styles.pieTitle}>Where Your Money Goes</Text>
            <View style={styles.pieContent}>
              <View style={styles.pieWrap}>
                <PieDonut data={activeData.pie} />
                <View style={styles.pieCenterLabel}>
                  <Text style={styles.pieCenterTop}>Total</Text>
                  <Text style={styles.pieCenterBottom}>₹{pieTotal}K</Text>
                </View>
              </View>
              <View style={styles.legend}>
                {activeData.pie.map((segment) => (
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
              {activeData.flatsTotal} flats in the apartment.
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  backTap: { marginRight: 8, padding: 4 },
  headerTitle: { color: "#1A1A1A", fontSize: 18, fontWeight: "500" },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  titleRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collectionTitle: { color: "#000000", fontSize: 32, fontWeight: "500" },
  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderColor: "#1C98ED",
    borderWidth: 1,
    backgroundColor: "#DEF4FF",
    borderRadius: 8,
    height: 28,
    paddingHorizontal: 7,
  },
  calendarText: { color: "#334155", fontSize: 10 },
  metricsGrid: { flexDirection: "row", gap: 8 },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 80,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  metricLabel: { color: "#64748B", fontSize: 14, marginBottom: 4 },
  metricValue: { fontSize: 31, fontWeight: "500" },
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
  expenseTotalAmount: { color: "#2799CE", fontSize: 31, fontWeight: "600" },
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
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },
  sheetLists: { flexDirection: "row", gap: 12, maxHeight: 240, marginBottom: 16 },
  sheetList: { flex: 1 },
  sheetItem: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 2,
  },
  sheetItemActive: { backgroundColor: "#DEF4FF" },
  sheetItemText: { color: "#7A7A7A", fontSize: 29 },
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
