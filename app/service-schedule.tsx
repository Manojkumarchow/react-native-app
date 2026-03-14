import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBooking, getOptionById, getServiceByKey, type ServiceKey } from "./data/homeServicesData";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

const DATE_CHOICES = [
  { key: "today", label: "Today", day: "10", month: "Apr", full: "Sunday, March 15, 2026" },
  { key: "tmrw", label: "Tmrw", day: "11", month: "Apr", full: "Monday, March 16, 2026" },
  { key: "fri", label: "Fri", day: "12", month: "Apr", full: "Tuesday, March 17, 2026" },
  { key: "sat", label: "Sat", day: "13", month: "Apr", full: "Wednesday, March 18, 2026" },
];

const SLOT_CHOICES = [
  { key: "09", label: "9:00 AM", disabled: false },
  { key: "10", label: "10:00 AM", disabled: false },
  { key: "11", label: "11:00 AM", disabled: true },
  { key: "13", label: "01:00 PM", disabled: false },
  { key: "15", label: "03:00 PM", disabled: false },
  { key: "19", label: "07:00 PM", disabled: true },
];

export default function ServiceScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceKey?: string; optionId?: string }>();
  const service = getServiceByKey(params.serviceKey);
  const option = getOptionById(service.key as ServiceKey, params.optionId);

  const [selectedDate, setSelectedDate] = useState(DATE_CHOICES[0].key);
  const [selectedSlot, setSelectedSlot] = useState("09");
  const [notes, setNotes] = useState("");

  const selectedDateData = useMemo(
    () => DATE_CHOICES.find((item) => item.key === selectedDate) ?? DATE_CHOICES[0],
    [selectedDate]
  );
  const selectedSlotData = useMemo(
    () => SLOT_CHOICES.find((item) => item.key === selectedSlot) ?? SLOT_CHOICES[0],
    [selectedSlot]
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Choose Date & Time</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {DATE_CHOICES.map((item) => {
              const active = selectedDate === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                  onPress={() => setSelectedDate(item.key)}
                >
                  <Text style={[styles.dateLabel, active && styles.dateTextActive]}>{item.label}</Text>
                  <Text style={[styles.dateNumber, active && styles.dateTextActive]}>{item.day}</Text>
                  <Text style={[styles.dateMonth, active && styles.dateTextActive]}>{item.month}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.timeHeader}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <Text style={styles.zoneText}>GMT +05:30</Text>
          </View>
          <View style={styles.slotGrid}>
            {SLOT_CHOICES.map((slot) => {
              const selected = selectedSlot === slot.key;
              return (
                <Pressable
                  key={slot.key}
                  disabled={slot.disabled}
                  style={[
                    styles.slotBtn,
                    selected && !slot.disabled && styles.slotBtnActive,
                    slot.disabled && styles.slotBtnDisabled,
                  ]}
                  onPress={() => setSelectedSlot(slot.key)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selected && !slot.disabled && styles.slotTextActive,
                      slot.disabled && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="e.g. Ring bell twice or please park in visitor spot..."
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
          />

          <Pressable
            style={styles.confirmBtn}
            onPress={() => {
              const created = createBooking({
                serviceKey: service.key as ServiceKey,
                optionId: option.id,
                optionTitle: option.title,
                dateLabel: selectedDateData.day + " " + selectedDateData.month,
                timeLabel: selectedSlotData.label,
                amount: option.price,
              });
              router.push({
                pathname: "/service-booking-success",
                params: {
                  bookingId: created.id,
                  optionTitle: created.optionTitle,
                  dateLabel: selectedDateData.full,
                  timeLabel: selectedSlotData.label,
                },
              } as never);
            }}
          >
            <Text style={styles.confirmText}>Confirm Booking</Text>
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
  content: { padding: rs(16), gap: rs(16), paddingBottom: rvs(30) },
  sectionTitle: { fontSize: rms(14), fontWeight: "500", color: "#0F172A" },
  dateRow: { gap: 10, paddingBottom: 2 },
  dateChip: {
    width: 84,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(39,153,206,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateChipActive: { backgroundColor: "#2799CE", borderColor: "#2799CE" },
  dateLabel: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  dateNumber: { color: "#0F172A", fontSize: 30, fontWeight: "700", marginTop: 2 },
  dateMonth: { color: "#64748B", fontSize: 12, fontWeight: "500" },
  dateTextActive: { color: "#FFFFFF" },
  timeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  zoneText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  slotBtn: {
    width: "47%",
    borderRadius: 24,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  slotBtnActive: { backgroundColor: "rgba(39,153,206,0.05)", borderColor: "#2799CE" },
  slotBtnDisabled: { backgroundColor: "#D9D9D9", borderColor: "#D9D9D9" },
  slotText: { fontSize: 16, color: "#0F172A", fontWeight: "500" },
  slotTextActive: { color: "#2799CE" },
  slotTextDisabled: { color: "#A1A1AA", textDecorationLine: "line-through" },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    minHeight: 96,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#181818",
  },
  confirmBtn: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  confirmText: { color: "#FAFAFA", fontSize: 14, fontWeight: "500" },
});
