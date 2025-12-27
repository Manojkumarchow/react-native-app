// MyFlatLedger.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";
import useBuildingStore from "./store/buildingStore";

/* ---------------------------------
   Backend Config (DO NOT TOUCH)
---------------------------------- */
const API_BASE_URL = "http://localhost:8080";

/* ---------------------------------
   Types
---------------------------------- */
type LedgerItem = {
  id?: number;
  name: string;
  amount: number;
};

type LedgerResponse = {
  id: number;
  year: number;
  month: string;
  totalAmount: number;
  totalFlats: number;
  perFlatAmount: number;
  items: LedgerItem[];
};

type LedgerMap = Record<string, LedgerResponse | null | undefined>;

/* ---------------------------------
   Constants
---------------------------------- */
const PRIMARY = "#1C98ED";
const YEARS = [2026];
const MONTHS = [
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

/* ---------------------------------
   Helpers
---------------------------------- */
const currency = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;
const ledgerKey = (year: number, month: string) => `${year}-${month}`;

/* ---------------------------------
   Component
---------------------------------- */
export default function MyFlatLedger() {
  const navigation = useNavigation();

  /** ✅ BUILDING CONTEXT */
  const buildingId = useBuildingStore((s) => s.buildingId);

  const [activeYear, setActiveYear] = useState(2026);
  const [expandedMonth, setExpandedMonth] = useState<string | null>("January");

  const [ledgerMap, setLedgerMap] = useState<LedgerMap>({});
  const [isEditing, setIsEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(false);

  const activeKey = expandedMonth ? ledgerKey(activeYear, expandedMonth) : null;

  const activeLedger =
    activeKey && ledgerMap[activeKey] !== undefined
      ? ledgerMap[activeKey] ?? null
      : null;

  /* ---------------------------------
     Fetch Ledger (BUILDING-SCOPED)
  ---------------------------------- */
  useEffect(() => {
    if (!expandedMonth || !buildingId) return;

    const key = ledgerKey(activeYear, expandedMonth);

    setIsEditing(false);
    setDraftItems([]);

    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await axios.get<LedgerResponse>(
          `${API_BASE_URL}/whistleup/ledgers`,
          {
            params: {
              year: activeYear,
              month: expandedMonth,
              buildingId, // ✅ IMPORTANT
            },
          }
        );
        setLedgerMap((prev) => ({ ...prev, [key]: res.data }));
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setLedgerMap((prev) => ({ ...prev, [key]: null }));
        } else {
          Alert.alert("Error", "Unable to load ledger");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [activeYear, expandedMonth, buildingId]);

  /* ---------------------------------
     Derived State
  ---------------------------------- */
  const visibleItems = isEditing ? draftItems : activeLedger?.items ?? [];

  const totalAmount = useMemo(
    () => visibleItems.reduce((s, i) => s + (i.amount || 0), 0),
    [visibleItems]
  );

  const perFlatAmount = useMemo(() => {
    if (!activeLedger) return 0;
    return Math.ceil(totalAmount / activeLedger.totalFlats);
  }, [totalAmount, activeLedger]);

  /* ---------------------------------
     Actions
  ---------------------------------- */
  const addItem = () => {
    setIsEditing(true);
    setDraftItems([...(activeLedger?.items ?? []), { name: "", amount: 0 }]);
  };

  const updateDraftItem = (
    index: number,
    field: "name" | "amount",
    value: string
  ) => {
    setDraftItems((prev) =>
      prev.map((i, idx) =>
        idx === index
          ? {
              ...i,
              [field]:
                field === "amount"
                  ? Number(value.replace(/[^0-9]/g, ""))
                  : value,
            }
          : i
      )
    );
  };

  const onCancel = () => {
    setIsEditing(false);
    setDraftItems([]);
  };

  const onSave = async () => {
    if (!expandedMonth || !activeKey || !buildingId) return;

    try {
      setLoading(true);

      let saved: LedgerResponse;

      if (activeLedger) {
        const res = await axios.put<LedgerResponse>(
          `${API_BASE_URL}/whistleup/ledgers/${activeLedger.id}`,
          {
            buildingId, // ✅ IMPORTANT
            items: draftItems,
          }
        );
        saved = res.data;
      } else {
        const res = await axios.post<LedgerResponse>(
          `${API_BASE_URL}/whistleup/ledgers`,
          {
            buildingId, // ✅ IMPORTANT
            year: activeYear,
            month: expandedMonth,
            totalFlats: 20,
            items: draftItems,
          }
        );
        saved = res.data;
      }

      setLedgerMap((prev) => ({ ...prev, [activeKey]: saved }));
      setIsEditing(false);
      setDraftItems([]);
    } catch {
      Alert.alert("Error", "Unable to save ledger");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------
     PDF Download (UNCHANGED)
  ---------------------------------- */
  const downloadPdf = async () => {
    if (!activeLedger) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/whistleup/ledgers/${activeLedger.id}/pdf`,
        { responseType: "arraybuffer" }
      );

      const base64 = Buffer.from(res.data).toString("base64");
      const fileName = `Ledger_${activeLedger.month}_${activeLedger.year}.pdf`;

      if (Platform.OS === "ios") {
        const uri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await shareAsync(uri);
        return;
      }

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert("Permission required", "Cannot save file");
        return;
      }

      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        "application/pdf"
      );

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert("Success", "PDF downloaded to Downloads");
    } catch {
      Alert.alert("Error", "Failed to download PDF");
    }
  };

  /* ---------------------------------
     Render (UNCHANGED)
  ---------------------------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Flat Ledger</Text>
        </View>

        {/* Year Selector */}
        <View style={styles.yearRow}>
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => setActiveYear(y)}
              style={[styles.yearBtn, activeYear === y && styles.yearBtnActive]}
            >
              <Text
                style={[
                  styles.yearText,
                  activeYear === y && { color: PRIMARY },
                ]}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {MONTHS.map((m) => {
            const open = expandedMonth === m;
            return (
              <View key={m} style={styles.monthWrapper}>
                <TouchableOpacity
                  style={styles.monthHeader}
                  onPress={() => setExpandedMonth(open ? null : m)}
                >
                  <Text style={styles.monthTitle}>
                    {m} {activeYear}
                  </Text>
                  <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={PRIMARY}
                  />
                </TouchableOpacity>

                {open && (
                  <View style={styles.card}>
                    {visibleItems.map((i, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <TextInput
                          placeholder="Item name"
                          value={i.name}
                          editable={isEditing}
                          onChangeText={(t) => updateDraftItem(idx, "name", t)}
                          style={styles.itemInput}
                        />
                        <TextInput
                          placeholder="0"
                          keyboardType="numeric"
                          editable={isEditing}
                          value={i.amount ? String(i.amount) : ""}
                          onChangeText={(t) =>
                            updateDraftItem(idx, "amount", t)
                          }
                          style={styles.amountInput}
                        />
                      </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                      <Ionicons name="add-circle-outline" size={20} />
                      <Text style={{ marginLeft: 6 }}>Add Item</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Row label="Total" value={currency(totalAmount)} />
                    <Row label="Total Flats in Apartment" value="20" />
                    <Row
                      label="Each Flat Payable Amount"
                      value={currency(perFlatAmount)}
                    />

                    <View style={styles.actionRow}>
                      {isEditing ? (
                        <>
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.saveBtn]}
                            onPress={onSave}
                            disabled={loading}
                          >
                            <Text style={styles.actionText}>Save</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={onCancel}
                          >
                            <Text style={styles.actionText}>Cancel</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.pdfBtn}
                          onPress={downloadPdf}
                        >
                          <Text style={styles.pdfText}>Download PDF</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------------------------
   Row Component
---------------------------------- */
const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* ---------------------------------
   Styles (UNCHANGED)
---------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  yearRow: { flexDirection: "row", padding: 16, gap: 12 },
  yearBtn: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  yearBtnActive: { backgroundColor: "#EAF5FD" },
  yearText: { fontWeight: "600" },
  monthWrapper: { marginHorizontal: 16, marginBottom: 12 },
  monthHeader: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthTitle: { fontWeight: "600", color: PRIMARY },
  card: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  itemRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  itemInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
  },
  amountInput: {
    width: 90,
    textAlign: "right",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 6,
  },
  addBtn: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  rowLabel: { fontWeight: "500" },
  rowValue: { fontWeight: "600" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  saveBtn: { backgroundColor: PRIMARY },
  cancelBtn: { backgroundColor: "#999" },
  actionText: { color: "#fff", fontWeight: "600" },
  pdfBtn: {
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  pdfText: { color: PRIMARY, fontWeight: "600" },
});
