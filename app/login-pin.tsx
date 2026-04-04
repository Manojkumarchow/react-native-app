import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import { BASE_URL } from "./config";
import useAuthStore from "./store/authStore";
import { getProfile } from "./services/profile.service";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";
import { requestNotificationPermission } from "./useNotificationPermission";
import { getErrorMessage } from "./services/error";
import {
  normalizeAdminBuildingsFromApi,
  resolveActiveAdminBuilding,
} from "./services/adminBuildingContext";
import { STORAGE_KEYS } from "@/constants/storage";
import { rms, rs, rvs } from "@/constants/responsive";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const SEGMENT_BG = "#f4f4f5";
const BORDER_COLOR = "#e4e4e7";
const ERROR_BORDER = "#c81616";
const MUTED_TEXT = "#777";
const DISABLED_BG = "#d9d9d9";
const DISABLED_TEXT = "#a1a1aa";

export default function LoginPinScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const resolvedPhone = Array.isArray(phone) ? phone[0] : phone ?? "";

  const setAuth = useAuthStore((state) => state.setAuth);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setBuildingData = useBuildingStore((state) => state.setBuildingData);

  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const pinValue = pin.join("");

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 4).split("");
      const newPin = [...pin];
      digits.forEach((d, i) => {
        if (index + i < 4) newPin[index + i] = d;
      });
      setPin(newPin);
      setHasError(false);
      const nextIdx = Math.min(index + digits.length, 3);
      refs[nextIdx].current?.focus();
      if (newPin.every((d) => d !== "")) {
        submitPin(newPin.join(""));
      }
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setHasError(false);

    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }

    if (newPin.every((d) => d !== "")) {
      submitPin(newPin.join(""));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !pin[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const submitPin = async (pinStr: string) => {
    if (!resolvedPhone || loading) return;

    setLoading(true);
    setHasError(false);

    try {
      const response = await axios.post(`${BASE_URL}/users/login`, {
        phone: resolvedPhone,
        pin: pinStr,
      });
      if (response.status === 200) {
        const { jwtToken } = response.data;
        setAuth(jwtToken, resolvedPhone);
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN_PHONE, resolvedPhone);
        } catch {
          // Storage is optional for convenience; login should still succeed.
        }

        const profileData = await getProfile(resolvedPhone);
        const adminBuildings = normalizeAdminBuildingsFromApi(profileData.adminBuildings);
        const roleUpper = String(profileData.role ?? "").toUpperCase();
        const isAdminRole = roleUpper === "ADMIN" || roleUpper === "SYSTEM_ADMIN";

        let adminActive: Awaited<ReturnType<typeof resolveActiveAdminBuilding>> = null;
        if (isAdminRole && adminBuildings.length > 0) {
          adminActive = await resolveActiveAdminBuilding(
            resolvedPhone,
            profileData.buildingId,
            adminBuildings,
          );
          setProfile({
            ...profileData,
            buildingId: adminActive?.buildingId ?? String(profileData.buildingId ?? ""),
            buildingName: adminActive?.buildingName ?? profileData.buildingName,
            adminBuildings,
          });
        } else {
          setProfile({
            ...profileData,
            adminBuildings: isAdminRole ? adminBuildings : [],
          });
        }

        const registration = await requestNotificationPermission();
        if (registration?.expoPushToken || registration?.fcmToken) {
          await axios.post(
            `${BASE_URL}/devices/register`,
            {
              expoPushToken: registration.expoPushToken ?? "",
              fcmToken: registration.fcmToken ?? "",
              platform: Platform.OS.toUpperCase(),
              phone: resolvedPhone,
            },
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );
        }
        try {
          let buildingId: string | undefined = adminActive?.buildingId;
          if (!buildingId && profileData.buildingId != null && profileData.buildingId !== "") {
            buildingId = String(profileData.buildingId);
          }
          if (buildingId) {
            const buildingRes = await axios.get(`${BASE_URL}/building/${buildingId}`);
            setBuildingData(buildingRes.data);
          }
        } catch {
          // ignore
        }

        router.replace("/login-success");
      } else {
        setHasError(true);
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: "Invalid phone or PIN. Please try again.",
        });
      }
    } catch (error) {
      setHasError(true);
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: getErrorMessage(error, "Invalid phone or PIN. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPress = () => {
    if (pinValue.length === 4 && !loading) {
      submitPin(pinValue);
    }
  };

  const handleForgotPin = () => {
    router.push("/forgot-password");
  };

  const isComplete = pinValue.length === 4;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView edges={["top"]} style={styles.bg}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            {/* Logo at top */}
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Card directly below logo with whitespace below */}
            <View style={styles.card}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity style={[styles.segment, styles.segmentActive]}>
                  <Text style={[styles.segmentText, styles.segmentTextActive]}>
                    LOGIN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.segment}
                  onPress={() => router.replace("/auth")}
                >
                  <Text style={styles.segmentText}>SIGNUP</Text>
                </TouchableOpacity>
              </View>

              {hasError ? (
                <Text style={styles.errorTitle}>
                  PIN <Text style={styles.errorHighlight}>Incorrect</Text> !
                  Please try again.
                </Text>
              ) : (
                <Text style={styles.cardTitle}>Enter your 4-digit PIN</Text>
              )}

              <View style={styles.pinRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={i}
                    ref={refs[i]}
                    style={[
                      styles.pinBox,
                      hasError && styles.pinBoxError,
                    ]}
                    value={pin[i]}
                    secureTextEntry={!showPin}
                    onChangeText={(v) => handlePinChange(i, v)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(i, nativeEvent.key)
                    }
                    keyboardType="number-pad"
                    maxLength={4}
                    selectTextOnFocus
                  />
                ))}
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPin((p) => !p)}
                >
                  <Feather
                    name={showPin ? "eye-off" : "eye"}
                    size={22}
                    color={BRAND_BLUE}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !isComplete && styles.nextButtonDisabled,
                ]}
                onPress={handleNextPress}
                disabled={!isComplete || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={DISABLED_TEXT} />
                ) : (
                  <Text
                    style={[
                      styles.nextButtonText,
                      !isComplete && styles.nextButtonTextDisabled,
                    ]}
                  >
                    {hasError ? "Continue" : "Next"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPin}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>
                  Forgot PIN?{" "}
                  <Text style={styles.forgotLinkText}>Click to Reset</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: rvs(22),
    paddingBottom: rvs(12),
  },
  logo: {
    width: rs(235),
    height: rs(235),
  },
  card: {
    marginTop: rvs(4),
    backgroundColor: CARD_BG,
    borderTopLeftRadius: rs(32),
    borderTopRightRadius: rs(32),
    paddingHorizontal: rs(19),
    paddingTop: rvs(20),
    paddingBottom: rvs(88),
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: SEGMENT_BG,
    borderRadius: rs(9),
    padding: rs(2),
    marginBottom: rvs(24),
    height: rvs(38),
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rs(7),
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: rs(8),
    elevation: 4,
  },
  segmentText: {
    fontSize: rms(13),
    color: DISABLED_TEXT,
    fontWeight: "400",
  },
  segmentTextActive: {
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: rms(20),
    fontWeight: "500",
    color: MUTED_TEXT,
    marginBottom: rvs(24),
  },
  errorTitle: {
    fontSize: rms(20),
    fontWeight: "500",
    color: MUTED_TEXT,
    marginBottom: rvs(24),
  },
  errorHighlight: {
    color: ERROR_BORDER,
  },
  pinRow: {
    flexDirection: "row",
    gap: rs(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(24),
  },
  pinBox: {
    width: rs(52),
    height: rvs(44),
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: rs(8),
    fontSize: rms(18),
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  pinBoxError: {
    borderColor: ERROR_BORDER,
  },
  eyeButton: {
    padding: rs(10),
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    minHeight: rvs(48),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(16),
  },
  nextButtonDisabled: {
    backgroundColor: DISABLED_BG,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: rms(14),
    fontWeight: "600",
  },
  nextButtonTextDisabled: {
    color: DISABLED_TEXT,
  },
  forgotLink: {
    alignSelf: "center",
  },
  forgotText: {
    fontSize: rms(12),
    color: MUTED_TEXT,
  },
  forgotLinkText: {
    color: BRAND_BLUE,
    textDecorationLine: "underline",
  },
});
