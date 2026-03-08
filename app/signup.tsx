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
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams, type Href } from "expo-router";
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
  const { prefillName, prefillPhone } = useLocalSearchParams<{
    prefillName?: string;
    prefillPhone?: string;
  }>();

  const [fullName, setFullName] = useState(prefillName ?? "");
  const [phone, setPhone] = useState(prefillPhone ?? "");

  useEffect(() => {
    if (prefillName) setFullName(prefillName);
    if (prefillPhone) setPhone(prefillPhone);
  }, [prefillName, prefillPhone]);
  const [password, setPassword] = useState("");

  const [flatNo, setFlatNo] = useState("");
  const [floor, setFloor] = useState<number | null>(null);

  const [error, setError] = useState("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );

  const [buildingQuery, setBuildingQuery] = useState("");
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);

  const [role, setRole] = useState<"ADMIN" | "USER">("ADMIN");

  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToFocusedInput = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        b.buildingName.toLowerCase().includes(q),
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
    } catch {}

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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {/* Header: Logo visible above card */}
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Card attached to bottom */}
            <View style={styles.card}>
              <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.cardScroll,
                  { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 80 },
                ]}
              >
                <FrostedCard>
                  <Text style={styles.title}>Create an account</Text>
                  <Text style={styles.subtitle}>
                    {prefillName && prefillPhone
                      ? "Complete your registration"
                      : "Register your account"}
                  </Text>

                  {!prefillName && (
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#5A6C8A"
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={scrollToFocusedInput}
                    />
                  )}

                  {!prefillPhone && (
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number"
                      onFocus={scrollToFocusedInput}
                      placeholderTextColor={"#5A6C8A"}
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                    />
                  )}

                  {/* BUILDING */}
                  <View style={styles.dropdownWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Select Building"
                      placeholderTextColor={"#5A6C8A"}
                      value={
                        selectedBuilding
                          ? `${selectedBuilding.buildingId} - ${selectedBuilding.buildingName}`
                          : buildingQuery
                      }
                      onFocus={() => {
                        setShowBuildingDropdown(true);
                        scrollToFocusedInput();
                      }}
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
                      onPress={() => {
                        setShowFloorDropdown((prev) => !prev);
                        scrollToFocusedInput();
                      }}
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
                    placeholderTextColor="#5A6C8A"
                    keyboardType="number-pad"
                    value={flatNo}
                    onChangeText={setFlatNo}
                    onFocus={scrollToFocusedInput}
                  />

                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Password"
                    onFocus={scrollToFocusedInput}
                    placeholderTextColor="#5A6C8A"
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
                  <View style={styles.signinRow}>
                    <Text style={styles.signinText}>
                      Already have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.replace("/auth" as Href)}>
                      <Text style={styles.signinLink}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </FrostedCard>
              </ScrollView>
            </View>
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
  flex: { flex: 1 },
  bg: {
    flex: 1,
    backgroundColor: "#1c98ed",
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 35,
  },
  logo: {
    width: 280,
    height: 280,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "72%",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardScroll: {
    flexGrow: 1,
  },

  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  signinText: {
    color: "#222",
    fontSize: 14,
  },

  signinLink: {
    color: "#0A174E",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
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
    color: "#131314ff",
  },

  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },

  dropdown: {
    position: "absolute",
    top: 52,
    width: "100%",
    backgroundColor: "#5a6c8ab1",
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
