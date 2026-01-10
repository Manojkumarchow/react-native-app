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
import * as Location from "expo-location";
import Geocoder from "react-native-geocoding";
import useProfileStore from "./store/profileStore";

/* ---------------------------------
   GOOGLE MAPS
---------------------------------- */
Geocoder.init("AIzaSyC_jKoC1WtsqVFP6GRWKrrAJ_kueCljN88");

/* -----------------------------
   VALIDATION HELPERS
----------------------------- */
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone: string) => /^[0-9]{10}$/.test(phone);
const isValidPincode = (pincode: string) => /^[0-9]{6}$/.test(pincode);

/* -----------------------------
   ADDRESS PARSER
----------------------------- */
const extractAddressComponents = (components: any[]) => {
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name || "";

  const streetNumber = get("street_number");
  const route = get("route");

  return {
    streetName: [streetNumber, route].filter(Boolean).join(" "),
    landmark:
      get("sublocality") ||
      get("sublocality_level_1") ||
      get("neighborhood") ||
      get("premise") ||
      get("locality"),
    city: get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    pincode: get("postal_code"),
  };
};

const INITIAL_FORM = {
  buildingName: "",
  streetName: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  floors: "",
  flatStart: "",
  totalResidents: "",
  flatEnd: "",
  adminName: "",
  adminPhone: "",
  adminEmail: "",
  upiId: "",
  waterFieldRequired: null as null | boolean, // ✅ NEW FIELD
  termsAccepted: false,
};

export default function EnrollBuildingScreen() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const username = useProfileStore((s) => s.phone);
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
      // isValidEmail(form.adminEmail) &&
      form.waterFieldRequired !== null && // ✅ REQUIRED
      form.termsAccepted &&
      !loading
    );
  }, [form, loading]);

  /* -----------------------------
     FETCH CURRENT LOCATION
  ----------------------------- */
  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Required",
          text2: "Please enable location access",
        });
        return;
      }

      let location = null;

      try {
        // Attempt 1: High accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });
      } catch {
        // Attempt 2: Last known location
        location = await Location.getLastKnownPositionAsync({});
      }

      if (!location) {
        // Attempt 3: Balanced accuracy retry
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!location) {
        throw new Error("Location unavailable");
      }

      const { latitude, longitude } = location.coords;

      const geoResponse = await Geocoder.from(latitude, longitude);
      const result = geoResponse.results[0];

      const address = result.formatted_address;
      const components = extractAddressComponents(result.address_components);

      setCurrentAddress(address);

      setForm((prev) => ({
        ...prev,
        streetName: components.streetName,
        landmark: components.landmark,
        city: components.city,
        state: components.state,
        pincode: components.pincode,
      }));

      Toast.show({
        type: "success",
        text1: "Location Detected",
        text2: "Address auto-filled successfully",
      });
    } catch (error) {
      console.error("Location error:", error);
      Toast.show({
        type: "error",
        text1: "Location Unavailable",
        text2: "Please enter address manually",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  /* -----------------------------
     SUBMIT
  ----------------------------- */
  const submit = async () => {
    if (!isFormValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Details",
        text2: "Please check required fields",
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
          fullAddress: currentAddress,
        },
        floors: Number(form.floors || 0),
        totalResidents: Number(form.totalResidents || 0),
        flatStartNumber: Number(form.flatStart || 0),
        flatEndNumber: Number(form.flatEnd || 0),
        adminName: form.adminName,
        adminPhone: form.adminPhone,
        upiId: form.upiId,
        waterFieldRequired: form.waterFieldRequired, // ✅ SENT TO BACKEND
        profileId: username,
      };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BASE_URL}/building/create`,
        payload
      );

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Success 🎉",
          text2: "Building enrolled successfully",
        });

        setForm(INITIAL_FORM);
        setCurrentAddress("");
        setTimeout(() => router.back(), 800);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Enrollment Failed",
        text2: err?.response?.data?.message ?? "Something went wrong",
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
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={fetchCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.locationText}>📍 Use Current Location</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.readOnly]}
              placeholder="Auto-detected full address"
              value={currentAddress}
              editable={false}
              multiline
            />

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
              placeholder="Landmark"
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
              placeholder="Total Floors *"
              value={form.floors}
              onChangeText={(v) => setForm({ ...form, floors: v })}
            />

            <TextInput
              style={styles.input}
              placeholder="Total No. of Residents *"
              value={form.totalResidents}
              onChangeText={(v) => setForm({ ...form, totalResidents: v })}
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
              placeholder="UPI Id *"
              keyboardType="number-pad"
              maxLength={10}
              value={form.upiId}
              onChangeText={(v) => setForm({ ...form, upiId: v })}
            />

            <View style={styles.radioGroup}>
              <Text style={styles.radioLabel}>
                Water Field Required? *
              </Text>

              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setForm({
                      ...form,
                      waterFieldRequired: true,
                    })
                  }
                >
                  <View
                    style={[
                      styles.radioOuter,
                      form.waterFieldRequired === true &&
                      styles.radioOuterActive,
                    ]}
                  >
                    {form.waterFieldRequired === true && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() =>
                    setForm({
                      ...form,
                      waterFieldRequired: false,
                    })
                  }
                >
                  <View
                    style={[
                      styles.radioOuter,
                      form.waterFieldRequired === false &&
                      styles.radioOuterActive,
                    ]}
                  >
                    {form.waterFieldRequired === false && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* <TextInput
              style={styles.input}
              placeholder="Admin Email *"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.adminEmail}
              onChangeText={(v) => setForm({ ...form, adminEmail: v })}
            /> */}

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
                I accept Terms & Conditions *
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
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C98ED",
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  readOnly: { backgroundColor: "#F5F7FA" },
  locationBtn: {
    backgroundColor: "#5956E9",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
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
  submitDisabled: { opacity: 0.5 },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  radioGroup: {
    marginTop: 8,
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: "row",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#5956E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: "#5956E9",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#5956E9",
  },
  radioText: {
    fontSize: 15,
  },
});

