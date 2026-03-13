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

import { BASE_URL } from "./config";
import useAuthStore from "./store/authStore";
import { getProfile } from "./services/profile.service";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";
import { requestNotificationPermission } from "./useNotificationPermission";
import { getErrorMessage } from "./services/error";

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

        const profileData = await getProfile(resolvedPhone);
        setProfile(profileData);

        const token = await requestNotificationPermission();
        if (token) {
          await axios.post(
            `${BASE_URL}/devices/register`,
            {
              expoPushToken: token,
              platform: Platform.OS.toUpperCase(),
              phone: resolvedPhone,
            },
            { headers: { Authorization: `Bearer ${jwtToken}` } }
          );
        }
        try {
          const buildingId = profileData.buildingId;
          const buildingRes = await axios.get(
            `${BASE_URL}/building/${buildingId}`
          );
          setBuildingData(buildingRes.data);
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
        <View style={styles.bg}>
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
        </View>
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
    paddingTop: 22,
    paddingBottom: 12,
  },
  logo: {
    width: 235,
    height: 235,
  },
  card: {
    marginTop: 4,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 88,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: SEGMENT_BG,
    borderRadius: 9,
    padding: 2,
    marginBottom: 24,
    height: 38,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentText: {
    fontSize: 13,
    color: DISABLED_TEXT,
    fontWeight: "400",
  },
  segmentTextActive: {
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: MUTED_TEXT,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: MUTED_TEXT,
    marginBottom: 24,
  },
  errorHighlight: {
    color: ERROR_BORDER,
  },
  pinRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  pinBox: {
    width: 52,
    height: 44,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  pinBoxError: {
    borderColor: ERROR_BORDER,
  },
  eyeButton: {
    padding: 10,
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  nextButtonDisabled: {
    backgroundColor: DISABLED_BG,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  nextButtonTextDisabled: {
    color: DISABLED_TEXT,
  },
  forgotLink: {
    alignSelf: "center",
  },
  forgotText: {
    fontSize: 12,
    color: MUTED_TEXT,
  },
  forgotLinkText: {
    color: BRAND_BLUE,
    textDecorationLine: "underline",
  },
});
