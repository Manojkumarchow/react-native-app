import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import { BASE_URL } from "./config";
import { sendOTP } from "./services/otp.service";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";
import { STORAGE_KEYS } from "@/constants/storage";

type Building = {
  buildingId: number;
  buildingName: string;
};

const BRAND_BLUE = "#1C98ED";

export default function SetupFlatScreen() {
  const router = useRouter();
  const { prefillName, prefillPhone } = useLocalSearchParams<{
    prefillName?: string;
    prefillPhone?: string;
  }>();

  const resolvedName = Array.isArray(prefillName) ? prefillName[0] : prefillName ?? "";
  const resolvedPhone = Array.isArray(prefillPhone) ? prefillPhone[0] : prefillPhone ?? "";

  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"OWNER" | "USER">("USER");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [query, setQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const hydrateRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_ROLE);
        if ((storedRole ?? "").toUpperCase() === "OWNER") {
          setRole("OWNER");
          return;
        }
        setRole("USER");
      } catch {
        setRole("USER");
      }
    };
    hydrateRole();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBuildings = async () => {
      try {
        setLoadingBuildings(true);
        const res = await axios.get(`${BASE_URL}/building/all`);
        if (!mounted) return;
        const rows: Building[] = Array.isArray(res.data) ? res.data : [];
        setBuildings(rows);
      } catch {
        if (!mounted) return;
        setBuildings([]);
      } finally {
        if (mounted) setLoadingBuildings(false);
      }
    };
    loadBuildings();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredBuildings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter((b) => b.buildingName.toLowerCase().includes(q));
  }, [buildings, query]);

  const onContinue = async () => {
    setError("");
    if (!resolvedName || !resolvedPhone) {
      setError("Missing signup details. Please start from signup again.");
      return;
    }
    if (!selectedBuilding) {
      setError("Please select your apartment.");
      return;
    }
    if (pin.trim().length !== 4) {
      setError("Please set a valid 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      await sendOTP(resolvedPhone);
      router.push({
        pathname: "/otp",
        params: {
          name: resolvedName,
          phone: resolvedPhone,
          password: pin.trim(),
          role,
          buildingId: String(selectedBuilding.buildingId),
          buildingName: selectedBuilding.buildingName,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.bg}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.logoWrap}>
            <Image
              source={require("./../assets/images/nestiti-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Set Up Your Flat</Text>
            <Text style={styles.subtitle}>Start with your Flat&apos;s basic details.</Text>

            <View style={styles.roleRow}>
              <Pressable
                onPress={() => setRole("USER")}
                style={[styles.roleChip, role === "USER" && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, role === "USER" && styles.roleTextActive]}>
                  Tenant
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("OWNER")}
                style={[styles.roleChip, role === "OWNER" && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, role === "OWNER" && styles.roleTextActive]}>
                  Owner
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Apartment Name</Text>
              <View style={styles.searchField}>
                <Feather name="search" size={rs(18)} color="#52525B" />
                <TextInput
                  value={query}
                  onChangeText={(txt) => {
                    setQuery(txt);
                    setShowDropdown(true);
                    if (!txt.trim()) {
                      setSelectedBuilding(null);
                    }
                  }}
                  placeholder="Search apartment name"
                  placeholderTextColor="#71717A"
                  style={styles.searchInput}
                />
                {query.length > 0 ? (
                  <Pressable
                    onPress={() => {
                      setQuery("");
                      setSelectedBuilding(null);
                      setShowDropdown(true);
                    }}
                  >
                    <Feather name="x-circle" size={rs(18)} color="#52525B" />
                  </Pressable>
                ) : null}
              </View>

              {showDropdown ? (
                <View style={styles.dropdown}>
                  <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                    {loadingBuildings ? (
                      <View style={styles.dropdownLoader}>
                        <ActivityIndicator color={BRAND_BLUE} />
                      </View>
                    ) : (
                      filteredBuildings.map((item) => {
                        const selected = selectedBuilding?.buildingId === item.buildingId;
                        return (
                          <Pressable
                            key={item.buildingId}
                            style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                            onPress={() => {
                              setSelectedBuilding(item);
                              setQuery(item.buildingName);
                              setShowDropdown(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selected && styles.dropdownItemTextSelected,
                              ]}
                            >
                              {item.buildingName}
                            </Text>
                            {selected ? (
                              <Feather name="check" size={rs(18)} color={BRAND_BLUE} />
                            ) : null}
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              ) : null}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PIN</Text>
              <TextInput
                value={pin}
                onChangeText={(txt) => setPin(txt.replace(/[^0-9]/g, "").slice(0, 4))}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor="#71717A"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={styles.pinInput}
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={onContinue}
              style={[styles.button, (loading || !selectedBuilding || pin.length !== 4) && styles.buttonDisabled]}
              disabled={loading || !selectedBuilding || pin.length !== 4}
            >
              {loading ? (
                <ActivityIndicator color="#A1A1AA" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: BRAND_BLUE },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: rvs(18),
    paddingBottom: rvs(8),
  },
  logo: {
    width: rs(235),
    height: rs(235),
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: rs(32),
    borderTopRightRadius: rs(32),
    paddingHorizontal: rs(19),
    paddingTop: rvs(24),
    paddingBottom: rvs(24),
  },
  title: {
    fontSize: rms(34),
    fontWeight: "500",
    color: "#2D2D32",
    marginBottom: rvs(8),
  },
  subtitle: {
    fontSize: rms(16),
    color: "#71717A",
    marginBottom: rvs(20),
  },
  roleRow: {
    flexDirection: "row",
    gap: rs(10),
    marginBottom: rvs(16),
  },
  roleChip: {
    flex: 1,
    minHeight: rvs(38),
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#A1A1AA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  roleChipActive: {
    borderColor: BRAND_BLUE,
    backgroundColor: "#DEF4FF",
  },
  roleText: {
    color: "#71717A",
    fontSize: rms(13),
    fontWeight: "500",
  },
  roleTextActive: {
    color: BRAND_BLUE,
  },
  fieldGroup: {
    marginBottom: rvs(16),
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: rs(8),
    marginBottom: rvs(4),
    paddingHorizontal: rs(4),
    backgroundColor: "#E4F8FF",
    borderRadius: rs(8),
    fontSize: rms(12),
    color: "#09090B",
  },
  searchField: {
    borderWidth: 1,
    borderColor: BRAND_BLUE,
    borderRadius: rs(8),
    minHeight: rvs(56),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    paddingHorizontal: rs(12),
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    color: "#1D1B20",
    fontSize: rms(16),
    paddingVertical: rvs(8),
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#F4F4F5",
    borderRadius: rs(8),
    marginTop: rvs(4),
    maxHeight: rvs(220),
    backgroundColor: "#fff",
  },
  dropdownScroll: {
    width: "100%",
  },
  dropdownLoader: {
    paddingVertical: rvs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownItem: {
    minHeight: rvs(56),
    paddingHorizontal: rs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F4F4F5",
  },
  dropdownItemSelected: {
    backgroundColor: "#DEF4FF57",
  },
  dropdownItemText: {
    color: "#1D1B20",
    fontSize: rms(15),
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: BRAND_BLUE,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: "#A1A1AA",
    borderRadius: rs(8),
    minHeight: rvs(56),
    paddingHorizontal: rs(16),
    color: "#1D1B20",
    fontSize: rms(16),
    backgroundColor: "#fff",
  },
  error: {
    color: "#C81616",
    fontSize: rms(13),
    marginBottom: rvs(10),
  },
  button: {
    backgroundColor: BRAND_BLUE,
    minHeight: rvs(48),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
    marginTop: rvs(8),
  },
  buttonDisabled: {
    backgroundColor: "#D9D9D9",
  },
  buttonText: {
    color: "#fff",
    fontSize: rms(14),
    fontWeight: "600",
  },
});
