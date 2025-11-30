import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

export default function MaintenanceScreen() {
  const router = useRouter();

  // Dropdown lists
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear - i}`);

  const months = [
    "Select",
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

  const [selectedYear, setSelectedYear] = useState(`${currentYear}`);
  const [selectedMonth, setSelectedMonth] = useState("Select");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Popup state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Mock maintenance data
  type MaintenanceItem = {
    id: number;
    title: string;
    amount: number;
    dueDate?: string;
    paidDate?: string;
    month: string;
    status: "PAID" | "UNPAID";
    date: string;
  };

  const mockMaintenance: MaintenanceItem[] = [
    {
      id: 1,
      title: "April Maintenance",
      amount: 2000,
      dueDate: "05-04-2025",
      month: "April",
      status: "UNPAID",
      date: "1 Apr 2025",
    },
    {
      id: 2,
      title: "March Maintenance",
      amount: 2000,
      paidDate: "02-03-2025",
      month: "March",
      status: "PAID",
      date: "2 Mar 2025",
    },
    {
      id: 3,
      title: "February Maintenance",
      amount: 2000,
      paidDate: "02-02-2025",
      month: "February",
      status: "PAID",
      date: "2 Feb 2025",
    },
  ];

  const [maintenance, setMaintenance] =
    useState<MaintenanceItem[]>(mockMaintenance);

  const filteredMaintenance =
    selectedMonth === "Select"
      ? maintenance
      : maintenance.filter((m) => m.month === selectedMonth);

  // Show confirmation popup
  const markAsPaid = (id: number) => {
    setActiveId(id);
    setConfirmVisible(true);
  };

  // Confirm & update UI
  const confirmPayment = () => {
    if (!activeId) return;

    const today = new Date();
    const paidDate = today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const updated = maintenance.map((m) =>
      m.id === activeId ? { ...m, status: "PAID", paidDate } : m
    );

    setMaintenance(updated);
    setConfirmVisible(false);
    setActiveId(null);
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

          <View style={{ flexDirection: "row", marginLeft: "auto" }}>
            <Feather
              name="search"
              size={22}
              color="#fff"
              style={{ marginRight: 20 }}
            />
            <Feather name="bell" size={22} color="#fff" />
          </View>
        </View>

        {/* WHITE CONTENT AREA */}
        <View style={styles.container}>
          {/* DROPDOWNS */}
          <View style={styles.dropdownRow}>
            {/* YEAR */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedYear}</Text>
                <Feather name="chevron-down" size={18} color="#1C98ED" />
              </TouchableOpacity>

              {showYearDropdown && (
                <View style={styles.dropdownList}>
                  {years.map((year, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedYear(year);
                        setShowYearDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* MONTH */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedMonth}</Text>
                <Feather name="chevron-down" size={18} color="#1C98ED" />
              </TouchableOpacity>

              {showMonthDropdown && (
                <View style={styles.dropdownList}>
                  {months.map((month, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedMonth(month);
                        setShowMonthDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{month}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* LIST OF MAINTENANCE ITEMS */}
          <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
            {filteredMaintenance.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.card,
                  m.status === "UNPAID" ? styles.unpaidCard : styles.paidCard,
                ]}
              >
                {/* TOP ROW */}
                <View style={styles.cardTop}>
                  <Feather
                    name="alert-circle"
                    size={20}
                    color={m.status === "UNPAID" ? "#C1282D" : "#08401E"}
                  />

                  <Text
                    style={[
                      styles.cardTitle,
                      { color: m.status === "UNPAID" ? "#C1282D" : "#08401E" },
                    ]}
                  >
                    {m.title}
                  </Text>

                  <Text style={styles.cardDate}>{m.date}</Text>
                </View>

                <Text style={styles.amount}>₹ {m.amount}</Text>

                {/* DUE DATE OR PAID DATE */}
                {m.status === "UNPAID" ? (
                  <Text style={styles.subText}>Due Date {m.dueDate}</Text>
                ) : (
                  <Text style={styles.subText}>Paid on {m.paidDate}</Text>
                )}

                {/* LINE */}
                <View style={styles.line} />

                {/* ACTIONS */}
                {m.status === "UNPAID" ? (
                  <View style={styles.rowBetween}>
                    <TouchableOpacity onPress={() => markAsPaid(m.id)}>
                      <Text style={styles.unpaidAction}>I Already Paid</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/payments",
                          params: { amount: m.amount, month: m.month },
                        })
                      }
                    >
                      <Text style={styles.unpaidAction}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity>
                    <Text style={styles.download}>Download Invoice</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* POPUP OVERLAY */}
        {confirmVisible && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupBox}>
              <Text style={styles.popupTitle}>Confirm Payment</Text>
              <Text style={styles.popupMsg}>
                Mark this maintenance as paid?
              </Text>

              <View style={styles.popupActions}>
                <TouchableOpacity
                  onPress={() => setConfirmVisible(false)}
                  style={[styles.popupBtn, { backgroundColor: "#ccc" }]}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmPayment}
                  style={[styles.popupBtn, { backgroundColor: "#1C98ED" }]}
                >
                  <Text style={{ color: "#fff" }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

/* ==========================================
   STYLES
========================================== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#73A8FF" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
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

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dropdownWrapper: { width: "48%" },

  dropdown: {
    borderWidth: 1,
    borderColor: "#1C98ED",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  dropdownText: {
    color: "#1C98ED",
    fontWeight: "700",
    fontSize: 16,
  },

  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1C98ED",
    marginTop: 6,
    borderRadius: 10,
    maxHeight: 180,
  },

  dropdownItem: {
    padding: 10,
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
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },

  cardDate: {
    fontSize: 10,
    color: "#333",
  },

  amount: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },

  subText: {
    marginTop: 6,
    fontSize: 12,
    color: "#666",
  },

  line: {
    height: 1,
    backgroundColor: "#999",
    marginVertical: 10,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  unpaidAction: {
    color: "#FF0606",
    fontWeight: "700",
    fontSize: 12,
  },

  download: {
    color: "#08401E",
    fontWeight: "700",
    fontSize: 12,
  },

  /* POPUP */
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  popupBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },

  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  popupMsg: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
  },

  popupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  popupBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
