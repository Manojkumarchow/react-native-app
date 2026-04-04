import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

import { BASE_URL } from "./config";
import { getErrorMessage } from "./services/error";
import { STORAGE_KEYS } from "@/constants/storage";
import { VISITOR_CHECK_IN_BUILDING_ID } from "@/constants/visitorCheckIn";
import { VISITOR_PURPOSE_OPTIONS } from "@/constants/visitorPurposeLabels";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND = "#1C98ED";

function sortFlatLabels(a: string, b: string): number {
  const na = parseInt(a.replace(/\D/g, ""), 10);
  const nb = parseInt(b.replace(/\D/g, ""), 10);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
}

export default function VisitorRegistrationScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  const [fullName, setFullName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [flatOptions, setFlatOptions] = useState<string[]>([]);
  const [flatsLoading, setFlatsLoading] = useState(true);
  const [flatsError, setFlatsError] = useState("");
  const [selectedFlat, setSelectedFlat] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [flatModalOpen, setFlatModalOpen] = useState(false);
  const [purposeModalOpen, setPurposeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadFlats = useCallback(async () => {
    setFlatsLoading(true);
    setFlatsError("");
    try {
      const res = await axios.get(
        `${BASE_URL}/residents/building/${VISITOR_CHECK_IN_BUILDING_ID}`,
      );
      const rows = Array.isArray(res.data) ? res.data : [];
      const flats = rows
        .map((r: { flatNo?: string }) => String(r.flatNo ?? "").trim())
        .filter(Boolean);
      const unique = [...new Set(flats)].sort(sortFlatLabels);
      setFlatOptions(unique);
    } catch (e) {
      setFlatOptions([]);
      setFlatsError(getErrorMessage(e, "Could not load flats for this building."));
    } finally {
      setFlatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFlats();
  }, [loadFlats]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedName, savedPhone] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.VISITOR_LAST_DISPLAY_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.VISITOR_LAST_PHONE),
        ]);
        if (cancelled) return;
        if (savedName?.trim()) setFullName(savedName.trim());
        if (savedPhone && /^\d{10}$/.test(savedPhone)) setPhoneDigits(savedPhone);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const purposeLabel = useMemo(() => {
    if (!selectedPurpose) return "";
    return VISITOR_PURPOSE_OPTIONS.find((o) => o.value === selectedPurpose)?.label ?? "";
  }, [selectedPurpose]);

  const canSubmit =
    fullName.trim().length > 0 &&
    phoneDigits.replace(/\D/g, "").length === 10 &&
    selectedFlat &&
    selectedPurpose &&
    !flatsLoading &&
    !flatsError &&
    flatOptions.length > 0;

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const phone = phoneDigits.replace(/\D/g, "").slice(0, 10);
      await axios.post(
        `${BASE_URL}/visitors/building/${VISITOR_CHECK_IN_BUILDING_ID}`,
        {
          visitorName: fullName.trim(),
          visitorPhone: phone,
          purpose: selectedPurpose,
          visitedFlatNo: selectedFlat,
          notes: notes.trim() || undefined,
        },
      );
      try {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.VISITOR_LAST_DISPLAY_NAME, fullName.trim()],
          [STORAGE_KEYS.VISITOR_LAST_PHONE, phone],
        ]);
      } catch {
        /* ignore */
      }
      router.replace({
        pathname: "/visitor-check-in-success",
        params: { mode: mode ?? "guest" },
      } as never);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Could not register visit",
        text2: getErrorMessage(e, "Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Feather name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Visitor registration</Text>
            <View style={{ width: rs(32) }} />
          </View>
          <Text style={styles.instructions}>Please fill in your details before entering.</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneDigits}
                onChangeText={(t) => setPhoneDigits(t.replace(/\D/g, "").slice(0, 10))}
              />
            </View>

            <Text style={styles.label}>Visiting Flat</Text>
            <Pressable
              style={[styles.select, (!flatOptions.length || flatsLoading) && styles.selectDisabled]}
              onPress={() => flatOptions.length && !flatsLoading && setFlatModalOpen(true)}
              disabled={!flatOptions.length || !!flatsLoading}
            >
              <Text style={selectedFlat ? styles.selectValue : styles.selectPlaceholder}>
                {selectedFlat ? `Flat ${selectedFlat}` : "Select flat"}
              </Text>
              <Feather name="chevron-down" size={20} color="#64748B" />
            </Pressable>
            {flatsLoading ? (
              <ActivityIndicator color={BRAND} style={{ marginTop: 8 }} />
            ) : null}
            {flatsError ? <Text style={styles.errorSmall}>{flatsError}</Text> : null}

            <Text style={styles.label}>Type of visit</Text>
            <Pressable style={styles.select} onPress={() => setPurposeModalOpen(true)}>
              <Text style={selectedPurpose ? styles.selectValue : styles.selectPlaceholder}>
                {selectedPurpose ? purposeLabel : "Select visit type"}
              </Text>
              <Feather name="chevron-down" size={20} color="#64748B" />
            </Pressable>

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes"
              placeholderTextColor="#9CA3AF"
              multiline
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />

            <Pressable
              style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
              onPress={() => void onSubmit()}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FAFAFA" />
              ) : (
                <Text style={styles.submitText}>Register Visit</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={flatModalOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setFlatModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Select flat</Text>
                <ScrollView style={styles.modalList}>
                  {flatOptions.map((f) => (
                    <Pressable
                      key={f}
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedFlat(f);
                        setFlatModalOpen(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>Flat {f}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={purposeModalOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setPurposeModalOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>Type of visit</Text>
                <ScrollView style={styles.modalList}>
                  {VISITOR_PURPOSE_OPTIONS.map((o) => (
                    <Pressable
                      key={o.value}
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedPurpose(o.value);
                        setPurposeModalOpen(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{o.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(16),
    paddingVertical: rvs(8),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: rs(4) },
  headerTitle: { fontSize: rms(17), fontWeight: "600", color: "#0F172A" },
  instructions: {
    fontSize: rms(14),
    color: "#64748B",
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    backgroundColor: "#FFFFFF",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: rs(20),
    paddingTop: rvs(16),
    paddingBottom: rvs(40),
  },
  label: {
    fontSize: rms(13),
    fontWeight: "600",
    color: "#475569",
    marginBottom: rvs(8),
    marginTop: rvs(4),
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(14),
    fontSize: rms(16),
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: rvs(4),
  },
  textArea: { minHeight: rvs(100), paddingTop: rvs(14) },
  phoneRow: { flexDirection: "row", gap: rs(10), marginBottom: rvs(4) },
  phonePrefix: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  phonePrefixText: { fontSize: rms(16), fontWeight: "600", color: "#475569" },
  phoneInput: { flex: 1, marginBottom: 0 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(14),
    backgroundColor: "#FFFFFF",
    marginBottom: rvs(4),
  },
  selectDisabled: { opacity: 0.5 },
  selectPlaceholder: { fontSize: rms(16), color: "#9CA3AF" },
  selectValue: { fontSize: rms(16), color: "#0F172A" },
  errorSmall: { fontSize: rms(13), color: "#C81616", marginTop: rvs(4) },
  submitBtn: {
    marginTop: rvs(24),
    backgroundColor: BRAND,
    borderRadius: rs(14),
    paddingVertical: rvs(16),
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { fontSize: rms(16), fontWeight: "600", color: "#FAFAFA" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    maxHeight: "50%",
    paddingBottom: rvs(24),
  },
  modalTitle: {
    fontSize: rms(17),
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: rvs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalList: { maxHeight: rvs(320) },
  modalItem: {
    paddingVertical: rvs(16),
    paddingHorizontal: rs(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: { fontSize: rms(16), color: "#0F172A" },
});
