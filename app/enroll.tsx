import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

/* -----------------------------
   VALIDATION HELPERS
----------------------------- */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone);

const isValidPincode = (pincode: string) => /^[0-9]{6}$/.test(pincode);

const INITIAL_FORM = {
  buildingName: "",
  streetName: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  floors: "",
  flatStart: "",
  flatEnd: "",
  adminName: "",
  adminPhone: "",
  adminEmail: "",
  termsAccepted: false,
};

export default function EnrollBuildingScreen() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     FORM VALIDITY
  ----------------------------- */
  const isFormValid = useMemo(() => {
    return (
      form.buildingName.trim() &&
      form.streetName.trim() &&
      form.city.trim() &&
      form.state.trim() &&
      isValidPincode(form.pincode) &&
      form.adminName.trim() &&
      isValidPhone(form.adminPhone) &&
      isValidEmail(form.adminEmail) &&
      form.termsAccepted &&
      !loading
    );
  }, [form, loading]);

  /* -----------------------------
     SUBMIT
  ----------------------------- */
  const submit = async () => {
    if (!isFormValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Details",
        text2: "Please fill all required fields correctly",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        buildingName: form.buildingName,
        buildingAddress: {
          streetName: form.streetName,
          landmark: form.landmark,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        floors: Number(form.floors || 0),
        flatStartNumber: Number(form.flatStart || 0),
        flatEndNumber: Number(form.flatEnd || 0),
        adminName: form.adminName,
        adminPhone: form.adminPhone,
        adminEmail: form.adminEmail,
        profileId: "PROFILE_ID_FROM_AUTH",
      };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/building/create`,
        payload
      );

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Success 🎉",
          text2: "Building is enrolled",
        });

        setForm(INITIAL_FORM);

        setTimeout(() => {
          router.back();
        }, 800);
      } else {
        Toast.show({
          type: "error",
          text1: "Unexpected Response",
          text2: "Please try again later",
        });
      }
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Enrollment Failed",
        text2: err?.response?.data?.message ?? "Unable to enroll building",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enroll</Text>
        </View>

        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Register Your Apartment</Text>

            <TextInput
              style={styles.input}
              placeholder="Building Name *"
              value={form.buildingName}
              onChangeText={(v) => setForm({ ...form, buildingName: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="Street Name *"
              value={form.streetName}
              onChangeText={(v) => setForm({ ...form, streetName: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="Landmark (Optional)"
              value={form.landmark}
              onChangeText={(v) => setForm({ ...form, landmark: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="City *"
              value={form.city}
              onChangeText={(v) => setForm({ ...form, city: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="State *"
              value={form.state}
              onChangeText={(v) => setForm({ ...form, state: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="Pincode *"
              keyboardType="number-pad"
              maxLength={6}
              value={form.pincode}
              onChangeText={(v) =>
                setForm({
                  ...form,
                  pincode: v.replace(/[^0-9]/g, ""),
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Admin Name *"
              value={form.adminName}
              onChangeText={(v) => setForm({ ...form, adminName: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="Admin Phone *"
              keyboardType="number-pad"
              maxLength={10}
              value={form.adminPhone}
              onChangeText={(v) =>
                setForm({
                  ...form,
                  adminPhone: v.replace(/[^0-9]/g, ""),
                })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Admin Email *"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.adminEmail}
              onChangeText={(v) => setForm({ ...form, adminEmail: v })}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() =>
                setForm({
                  ...form,
                  termsAccepted: !form.termsAccepted,
                })
              }
            >
              <View
                style={[styles.checkbox, form.termsAccepted && styles.checked]}
              />
              <Text style={styles.checkboxText}>
                I have read all Terms & Conditions *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submit, !isFormValid && styles.submitDisabled]}
              disabled={!isFormValid}
              onPress={submit}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Enroll Now</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1C98ED" },
  header: { flexDirection: "row", alignItems: "center", padding: 18 },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#5956E9",
    marginRight: 10,
  },
  checked: { backgroundColor: "#5956E9" },
  checkboxText: { color: "#828282", fontSize: 15 },
  submit: {
    backgroundColor: "#1C98ED",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
