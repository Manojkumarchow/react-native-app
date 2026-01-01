import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import axios from "axios";

import FrostedCard from "./components/FrostedCard";
import { sendOTP } from "./services/otp.service";
import { getProfile } from "./services/profile.service";

/* ---------------------------------
   Types
---------------------------------- */
type Building = {
  buildingId: number;
  buildingName: string;
  floors: number;
};

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [flatNo, setFlatNo] = useState("");
  const [floor, setFloor] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  const [buildingQuery, setBuildingQuery] = useState("");
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);

  const [role, setRole] = useState<"ADMIN" | "USER">("ADMIN");

  const passwordRef = useRef<TextInput>(null);

  /* ---------------------------------
     Fetch Buildings (UNCHANGED)
  ---------------------------------- */
  useEffect(() => {
  console.log("🚀 Buildings API call started");

  axios
    .get(`${process.env.EXPO_PUBLIC_BASE_URL}/building/all`)
    .then((res) => {
      console.log("✅ Buildings API success");
      console.log("📦 Raw response:", res);
      console.log("📦 Response data:", res.data);

      setBuildings(res.data || []);
    })
    .catch((err) => {
      console.log("❌ Buildings API failed");
      console.log("❌ Error:", err?.message);
      console.log("❌ Full error:", err);

      setError("Unable to load buildings");
    });
}, []);


  /* ---------------------------------
     Filter Buildings
  ---------------------------------- */
  const filteredBuildings = useMemo(() => {
    if (!buildingQuery.trim()) return buildings;
    const q = buildingQuery.toLowerCase();
    return buildings.filter(
      (b) =>
        String(b.buildingId).includes(q) ||
        b.buildingName.toLowerCase().includes(q)
    );
  }, [buildingQuery, buildings]);

  const floors = selectedBuilding
    ? Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1)
    : [];

  /* ---------------------------------
     Signup Logic (UNCHANGED)
  ---------------------------------- */
  const handleSignup = async () => {
    setError("");

    if (
      !fullName ||
      !phone ||
      !password ||
      !selectedBuilding ||
      !floor ||
      !flatNo
    ) {
      setError("All fields are required");
      return;
    }

    try {
      await getProfile(phone);
      setError("User already exists");
      return;
    } catch { }

    try {
      const otpRes = await sendOTP(phone);
      router.push({
        pathname: "/otp",
        params: {
          phone,
          otp: otpRes.otp,
          name: fullName,
          password,
          role,
          buildingId: String(selectedBuilding.buildingId),
          floor: String(floor),
          flatNo,
        },
      });
    } catch {
      setError("Failed to send OTP");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* 🔹 Navigation Header */}

      {/* 🔹 Keyboard-safe wrapper instead of Pressable */}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowBuildingDropdown(false);
          setShowFloorDropdown(false);
        }}
      >
        <View style={styles.bg}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.cardWrapper}>
                <FrostedCard>
                  <Text style={styles.title}>Create an account</Text>
                  <Text style={styles.subtitle}>Register your account</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={setFullName}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />

                  {/* BUILDING */}
                  <View style={styles.dropdownWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Select Building"
                      value={
                        selectedBuilding
                          ? `${selectedBuilding.buildingId} - ${selectedBuilding.buildingName}`
                          : buildingQuery
                      }
                      onFocus={() => setShowBuildingDropdown(true)}
                      onChangeText={(t) => {
                        setBuildingQuery(t);
                        setShowBuildingDropdown(true);
                      }}
                    />

                    {showBuildingDropdown && (
                      <View style={styles.dropdown}>
                        <ScrollView
                          keyboardShouldPersistTaps="handled"
                          nestedScrollEnabled
                        >
                          {filteredBuildings.map((item) => (
                            <TouchableOpacity
                              key={item.buildingId}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setSelectedBuilding(item);
                                setBuildingQuery("");
                                setFloor(null);
                                setShowBuildingDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownText}>
                                {item.buildingId} – {item.buildingName}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                      </View>
                    )}
                  </View>

                  {/* FLOOR */}
                  <View style={styles.dropdownWrapper}>
                    <TouchableOpacity
                      style={styles.selectInput}
                      disabled={!selectedBuilding}
                      onPress={() => setShowFloorDropdown((prev) => !prev)}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          !floor && styles.placeholder,
                        ]}
                      >
                        {floor ? `Floor ${floor}` : "Select Floor"}
                      </Text>
                    </TouchableOpacity>

                    {showFloorDropdown && (
                      <View style={styles.dropdown}>
                        {floors.map((f) => (
                          <TouchableOpacity
                            key={f}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFloor(f);
                              setShowFloorDropdown(false);
                            }}
                          >
                            <Text style={styles.dropdownText}>Floor {f}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Flat Number (e.g. 101)"
                    keyboardType="number-pad"
                    value={flatNo}
                    onChangeText={setFlatNo}
                  />

                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />

                  <Text style={styles.roleLabel}>Register as</Text>
                  <View style={styles.radioRow}>
                    {["ADMIN", "USER"].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.radioOption}
                        onPress={() => setRole(r as any)}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            role === r && styles.radioSelected,
                          ]}
                        />
                        <Text>{r === "ADMIN" ? "Owner" : "Tenant"}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                  >
                    <Text style={styles.buttonText}>Signup</Text>
                  </TouchableOpacity>

                  {!!error && <Text style={styles.error}>{error}</Text>}
                </FrostedCard>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

/* ---------------------------------
   Styles (UI-only changes)
---------------------------------- */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },

  scrollContent: {
    flexGrow: 1,                 // ⭐ REQUIRED
    justifyContent: "center",    // ⭐ centers vertically
    alignItems: "center",
    paddingVertical: 24,
  },

  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0A174E",
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    marginBottom: 20,
    paddingVertical: 8,
  },

  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },

  dropdown: {
    position: "absolute",
    top: 52,
    width: "100%",
    backgroundColor: "#F6FAFF",
    borderRadius: 12,
    maxHeight: 180,
    elevation: 6,
    zIndex: 20,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: "#E1ECF7",
  },

  dropdownText: {
    fontSize: 15,
    color: "#0A174E",
  },

  selectInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    paddingVertical: 14,
    marginBottom: 20,
  },

  selectText: {
    fontSize: 16,
  },

  placeholder: {
    color: "#999",
  },

  roleLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },

  radioRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  radioOption: {
    flexDirection: "row",
    marginRight: 20,
    alignItems: "center",
  },

  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginRight: 6,
  },

  radioSelected: {
    backgroundColor: "#6C63FF",
  },

  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  headerRow: {
    marginTop: 55,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    marginLeft: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});
