import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";
import { BASE_URL } from "./config";
import useProfileStore from "./store/profileStore";
import { getErrorMessage } from "./services/error";

const SLOT_CHOICES = [
  { key: "09", label: "9:00 AM", vhsSlot: "9am-10am", startHour: 9, endHour: 10 },
  { key: "10", label: "10:00 AM", vhsSlot: "10am-11am", startHour: 10, endHour: 11 },
  { key: "11", label: "11:00 AM", vhsSlot: "11am-12pm", startHour: 11, endHour: 12 },
  { key: "13", label: "01:00 PM", vhsSlot: "1pm-2pm", startHour: 13, endHour: 14 },
  { key: "15", label: "03:00 PM", vhsSlot: "3pm-4pm", startHour: 15, endHour: 16 },
  { key: "19", label: "07:00 PM", vhsSlot: "7pm-8pm", startHour: 19, endHour: 20 },
];

export default function ServiceScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    serviceKey?: string;
    optionId?: string;
    optionTitle?: string;
    optionPrice?: string;
  }>();
  const profileId = useProfileStore((s) => s.phone);
  const buildingId = useProfileStore((s) => s.buildingId);
  const optionTitle = Array.isArray(params.optionTitle) ? params.optionTitle[0] : params.optionTitle ?? "Service";
  const optionId = Array.isArray(params.optionId) ? params.optionId[0] : params.optionId ?? "";
  const serviceKey = Array.isArray(params.serviceKey) ? params.serviceKey[0] : params.serviceKey ?? "";
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId ?? "";
  const isEdit = Boolean(bookingId);
  const optionPrice = Number(Array.isArray(params.optionPrice) ? params.optionPrice[0] : params.optionPrice ?? 0);

  const resolveOrderType = (key: string) => {
    const normalized = key.trim().toLowerCase();
    if (normalized.includes("clean")) return "CLEANER";
    if (normalized.includes("paint")) return "PAINTER";
    if (normalized.includes("carpenter")) return "CARPENTER";
    if (normalized.includes("electric")) return "ELECTRICIAN";
    if (normalized.includes("plumb")) return "PLUMBER";
    if (normalized.includes("beaut")) return "BEAUTICIAN";
    if (normalized.includes("water-tanker")) return "WATER_TANKER";
    if (normalized.includes("water-can")) return "WATER_CAN";
    return "CLEANER";
  };

  const DATE_CHOICES = useMemo(() => {
    const base = new Date();
    const labels = ["Today", "Tomorrow", "", "", "", "", ""];
    return Array.from({ length: 7 }, (_, offset) => {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const dayLabel =
        labels[offset] ||
        d.toLocaleDateString("en-US", {
          weekday: "short",
        });
      return {
        key: `d-${offset}`,
        label: dayLabel,
        day: d.toLocaleDateString("en-US", { day: "2-digit" }),
        month: d.toLocaleDateString("en-US", { month: "short" }),
        full: d.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        iso: d.toISOString().slice(0, 10),
      };
    });
  }, []);

  const now = new Date();

  const [selectedDate, setSelectedDate] = useState(DATE_CHOICES[0].key);
  const [selectedSlot, setSelectedSlot] = useState("09");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const selectedDateData = useMemo(
    () => DATE_CHOICES.find((item) => item.key === selectedDate) ?? DATE_CHOICES[0],
    [selectedDate]
  );
  const todayIso = now.toISOString().slice(0, 10);
  const slotChoicesForSelectedDate = useMemo(() => {
    const isToday = selectedDateData.iso === todayIso;
    return SLOT_CHOICES.map((slot) => ({
      ...slot,
      disabled: isToday
        ? new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            slot.startHour,
            0,
            0,
            0,
          ).getTime() < now.getTime()
        : false,
    }));
  }, [selectedDateData.iso, todayIso, now]);

  const selectedSlotData = useMemo(
    () => slotChoicesForSelectedDate.find((item) => item.key === selectedSlot) ?? slotChoicesForSelectedDate[0],
    [selectedSlot, slotChoicesForSelectedDate]
  );

  useEffect(() => {
    const hasAvailableInSelectedDate = slotChoicesForSelectedDate.some((slot) => !slot.disabled);
    if (!hasAvailableInSelectedDate) {
      const nextDate = DATE_CHOICES.find((date) => {
        if (date.iso === todayIso) {
          return SLOT_CHOICES.some((slot) => {
            const startTime = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              slot.startHour,
              0,
              0,
              0,
            ).getTime();
            return startTime >= now.getTime();
          });
        }
        return true;
      });
      if (nextDate && nextDate.key !== selectedDate) {
        setSelectedDate(nextDate.key);
      }
      return;
    }
    const selected = slotChoicesForSelectedDate.find((slot) => slot.key === selectedSlot);
    if (!selected || selected.disabled) {
      const firstAvailable = slotChoicesForSelectedDate.find((slot) => !slot.disabled);
      if (firstAvailable) {
        setSelectedSlot(firstAvailable.key);
      }
    }
  }, [DATE_CHOICES, now, selectedDate, selectedSlot, slotChoicesForSelectedDate, todayIso]);

  const onSubmit = async () => {
    if (!profileId || !buildingId) {
      setErrorText("Profile/building info missing. Please login again.");
      return;
    }
    setSubmitting(true);
    setErrorText(null);
    try {
      if (!selectedSlotData || selectedSlotData.disabled) {
        setErrorText("Please choose a valid future time slot.");
        return;
      }
      if (isEdit) {
        await axios.patch(`${BASE_URL}/service/order/${profileId}/${bookingId}/reschedule`, {
          date: selectedDateData.iso,
          timeSlot: selectedSlotData.vhsSlot,
        });
        router.replace({ pathname: "/booking-detail", params: { bookingId } } as never);
      } else {
        const res = await axios.post(`${BASE_URL}/service/order/create`, {
          orderType: resolveOrderType(serviceKey),
          profileId,
          buildingId: String(buildingId),
          date: selectedDateData.iso,
          timeSlot: selectedSlotData.vhsSlot,
          optionId,
          optionTitle,
          notes,
          amount: optionPrice,
        });
        const createdId = String(res?.data?.orderId ?? "");
        router.push({
          pathname: "/service-booking-success",
          params: {
            bookingId: createdId,
            optionTitle,
            dateLabel: selectedDateData.full,
            timeLabel: selectedSlotData.label,
          },
        } as never);
      }
    } catch (error) {
      setErrorText(getErrorMessage(error, "Unable to save booking changes."));
    } finally {
      setSubmitting(false);
    }
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
            {slotChoicesForSelectedDate.map((slot) => {
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
          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <Pressable
            style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
            disabled={submitting}
            onPress={onSubmit}
          >
            <Text style={styles.confirmText}>{isEdit ? "Save Changes" : "Confirm Booking"}</Text>
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
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 6 },
});
