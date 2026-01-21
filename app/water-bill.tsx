import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Stack, router } from "expo-router";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import useBuildingStore from "./store/buildingStore";

export default function MaintenanceScreen() {
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("June");

  const buildingId = useBuildingStore((state) => state.buildingId);

  const [form, setForm] = useState({
    liftCurrentBill: "",
    commonCurrentBill: "",
    garbage: "",
    watchmanSalary: "",
    miscellaneousExpenses: "",
    liftMotorMaintenance: "",
    otherExpenses: "",
  });

  const [rows, setRows] = useState([
    { flatNumber: "", meterReading: "", amount: "" },
  ]);

  /* -----------------------------
     ADD / REMOVE ROWS
  ----------------------------- */
  const addRow = () => {
    setRows([...rows, { flatNumber: "", meterReading: "", amount: "" }]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, key: string, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: value };
    setRows(updated);
  };

  /* -----------------------------
     SUBMIT
  ----------------------------- */
  const submit = async () => {
    try {
      const payload = {
        buildingId,
        year: Number(year),
        month,
        liftCurrentBill: Number(form.liftCurrentBill || 0),
        commonCurrentBill: Number(form.commonCurrentBill || 0),
        garbage: Number(form.garbage || 0),
        watchmanSalary: Number(form.watchmanSalary || 0),
        miscellaneousExpenses: Number(form.miscellaneousExpenses || 0),
        liftMotorMaintenance: Number(form.liftMotorMaintenance || 0),
        otherExpenses: Number(form.otherExpenses || 0),
        waterReadings: rows.map((r) => ({
          flatNumber: r.flatNumber,
          meterReading: Number(r.meterReading || 0),
          amount: Number(r.amount || 0),
        })),
      };

      await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/water-bill`,
        payload
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Maintenance details saved",
      });

      router.replace("/home");
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Unable to save maintenance details",
      });
    }
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#0A1F44" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Enter Monthly Maintenance Details</Text>

          {/* YEAR & MONTH DROPDOWNS */}
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Select Year & Month</Text>

            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={year}
                  onValueChange={(v) => setYear(v)}
                >
                  <Picker.Item label="2026" value="2026" />
                </Picker>
              </View>

              <View style={styles.dropdown}>
                <Picker
                  selectedValue={month}
                  onValueChange={(v) => setMonth(v)}
                >
                  {[
                    "January","February","March","April","May","June",
                    "July","August","September","October","November","December",
                  ].map((m) => (
                    <Picker.Item key={m} label={m} value={m} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* BASIC FIELDS */}
          {[
            ["Lift Current Bill", "liftCurrentBill"],
            ["Current Bill Common", "commonCurrentBill"],
            ["Garbage", "garbage"],
            ["Watchman Salary", "watchmanSalary"],
          ].map(([label, key]) => (
            <TextInput
              key={key}
              placeholder={label}
              style={styles.input}
              keyboardType="number-pad"
              value={(form as any)[key]}
              onChangeText={(v) => setForm({ ...form, [key]: v })}
            />
          ))}

          {/* WATER TABLE */}
          <Text style={styles.subTitle}>
            Water Bill (Municipal Meter Reading)
          </Text>

          {rows.map((row, index) => (
            <View key={index} style={styles.row}>
              <TextInput
                style={styles.smallInput}
                placeholder="Flat No"
                value={row.flatNumber}
                onChangeText={(v) =>
                  updateRow(index, "flatNumber", v)
                }
              />
              <TextInput
                style={styles.smallInput}
                placeholder="Reading"
                keyboardType="number-pad"
                value={row.meterReading}
                onChangeText={(v) =>
                  updateRow(index, "meterReading", v)
                }
              />
              <TextInput
                style={styles.smallInput}
                placeholder="Amount"
                keyboardType="number-pad"
                value={row.amount}
                onChangeText={(v) =>
                  updateRow(index, "amount", v)
                }
              />

              {rows.length > 1 && (
                <TouchableOpacity onPress={() => removeRow(index)}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addRow}>
            <Text style={styles.addText}>+ Add Row</Text>
          </TouchableOpacity>

          {/* OTHER EXPENSES */}
          {[
            ["Miscellaneous Expenses", "miscellaneousExpenses"],
            ["Lift / Motor Maintenance", "liftMotorMaintenance"],
            ["Any Other Expenses", "otherExpenses"],
          ].map(([label, key]) => (
            <TextInput
              key={key}
              placeholder={label}
              style={styles.input}
              keyboardType="number-pad"
              value={(form as any)[key]}
              onChangeText={(v) => setForm({ ...form, [key]: v })}
            />
          ))}

          <TouchableOpacity style={styles.submit} onPress={submit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A1F44",
    marginLeft: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A1F44",
    marginBottom: 20,
  },

  dropdownRow: {
    marginBottom: 20,
  },

  dropdownLabel: {
    color: "#7A7A7A",
    marginBottom: 8,
  },

  dropdownContainer: {
    flexDirection: "row",
    gap: 12,
  },

  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3F51F7",
    borderRadius: 8,
    overflow: "hidden",
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#3F51F7",
    marginBottom: 16,
    paddingVertical: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  smallInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#3F51F7",
    marginRight: 10,
    paddingVertical: 8,
  },

  remove: {
    fontSize: 18,
    color: "red",
  },

  addBtn: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 20,
  },

  addText: {
    color: "#3F51F7",
    fontWeight: "600",
  },

  submit: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 30,
  },

  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
