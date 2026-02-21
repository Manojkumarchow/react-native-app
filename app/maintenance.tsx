import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import useAuthStore from "./store/authStore";
import useProfileStore from "./store/profileStore";

type MaintenanceItem = {
  id: number;
  monthLabel: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: "PAID" | "UNPAID";
  invoiceAvailable: boolean;
};

export default function MaintenanceScreen() {
  const router = useRouter();
  const username = useProfileStore((s) => s.phone);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => `${currentYear - i}`);

  const [selectedYear, setSelectedYear] = useState(`${currentYear}`);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);

  /* ---------------- FETCH DATA ---------------- */
  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/maintenance/${username}`,
      );
      setMaintenance(res.data);
    } catch (e) {
      console.error("Failed to fetch maintenance", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  /* ---------------- FILTER BY YEAR ---------------- */
  const filteredMaintenance = maintenance.filter((m) =>
    (m.paidDate || m.dueDate || "").startsWith(selectedYear),
  );

  /* ---------------- ACTIONS ---------------- */
  const markAsPaid = async (id: number) => {
    await axios.patch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/maintenance/${id}/pay`,
    );
    fetchMaintenance();
  };

  const downloadInvoice = async (id: number) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BASE_URL}/maintenance/${id}/invoice`,
        {
          responseType: "arraybuffer", // 🔑 VERY IMPORTANT
        },
      );

      // Convert arraybuffer → base64
      const base64 = Buffer.from(response.data, "binary").toString("base64");

      const fileUri = `${FileSystem.documentDirectory}invoice_${id}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Open share / download dialog
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Downloaded", "Invoice saved to device.");
      }
    } catch (err) {
      console.error("Invoice download failed", err);
      Alert.alert("Error", "Unable to download invoice");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance</Text>
        </View>

        {/* CONTENT */}
        <View style={styles.container}>
          {/* YEAR DROPDOWN */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowYearDropdown(!showYearDropdown)}
            >
              <Text style={styles.dropdownText}>{selectedYear}</Text>
              <Feather name="chevron-down" size={18} color="#1C98ED" />
            </TouchableOpacity>

            {showYearDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* LIST */}
          {loading ? (
            <ActivityIndicator size="large" color="#1C98ED" />
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              {filteredMaintenance.map((m) => {
                const isPaid = m.status === "PAID";

                return (
                  <View
                    key={m.id}
                    style={[
                      styles.card,
                      isPaid ? styles.paidCard : styles.unpaidCard,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <Feather
                        name="alert-circle"
                        size={20}
                        color={isPaid ? "#08401E" : "#C1282D"}
                      />
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: isPaid ? "#08401E" : "#C1282D" },
                        ]}
                      >
                        {m.monthLabel}
                      </Text>
                    </View>

                    <Text style={styles.amount}>₹ {m.amount}</Text>

                    {isPaid ? (
                      <Text style={styles.subText}>Paid on {m.paidDate}</Text>
                    ) : (
                      <Text style={styles.subText}>Due Date {m.dueDate}</Text>
                    )}

                    <View style={styles.line} />

                    {isPaid ? (
                      m.invoiceAvailable && (
                        <TouchableOpacity onPress={() => downloadInvoice(m.id)}>
                          <Text style={styles.download}>Download Invoice</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      <TouchableOpacity onPress={() => markAsPaid(m.id)}>
                        <Text style={styles.unpaidAction}>I Already Paid</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#1C98ED" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    height: 60,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 10,
  },

  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  dropdownWrapper: { marginBottom: 10 },

  dropdown: {
    borderWidth: 2,
    borderColor: "#F0A23A",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  dropdownText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1C98ED",
  },

  dropdownList: {
    maxHeight: 220,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#1C98ED",
    borderRadius: 12,
    backgroundColor: "#fff",
  },

  dropdownItem: {
    padding: 14,
    fontSize: 16,
  },

  card: {
    padding: 18,
    borderRadius: 20,
    marginTop: 18,
    borderWidth: 1,
  },

  unpaidCard: {
    backgroundColor: "#FFEBEB",
    borderColor: "rgba(0,0,0,0.2)",
  },

  paidCard: {
    backgroundColor: "#EBFFF3",
    borderColor: "rgba(0,0,0,0.2)",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },

  amount: {
    fontSize: 14,
    color: "#555",
  },

  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  line: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: 10,
  },

  unpaidAction: {
    color: "#FF0606",
    fontWeight: "700",
    fontSize: 13,
  },

  download: {
    color: "#08401E",
    fontWeight: "700",
    fontSize: 13,
  },
});
