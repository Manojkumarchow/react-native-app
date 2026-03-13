import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { sendOTP, verifyOTP } from "./services/otp.service";
import { createProfile } from "./services/profile.service";
import { getErrorMessage } from "./services/error";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const SEGMENT_BG = "#f4f4f5";
const BORDER_COLOR = "#a1a1aa";
const ERROR_BORDER = "#c81616";
const MUTED_TEXT = "#777";
const DISABLED_BG = "#d9d9d9";
const DISABLED_TEXT = "#a1a1aa";

export default function OTPVerify() {
  const router = useRouter();
  const { phone, name, password, role, buildingId, floor, flatNo, resetFlow } =
    useLocalSearchParams();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const resolvedPhone = Array.isArray(phone) ? phone[0] : phone;
  const resolvedName = Array.isArray(name) ? name[0] : name;
  const resolvedPassword = Array.isArray(password) ? password[0] : password;
  const resolvedRole = (Array.isArray(role) ? role[0] : role) as
    | "ADMIN"
    | "USER"
    | "OWNER"
    | "SYSTEM_ADMIN";
  const resolvedBuildingId = Number(
    Array.isArray(buildingId) ? buildingId[0] : buildingId
  );
  const resolvedFloor = Array.isArray(floor) ? floor[0] : floor;
  const resolvedFlatNo = Array.isArray(flatNo) ? flatNo[0] : flatNo;

  const otpValue = otp.join("");
  const isComplete = otpValue.length === 4;

  const handleResend = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorText("");
      await sendOTP(resolvedPhone);
      setOtp(["", "", "", ""]);
      inputs[0].current?.focus();
    } catch {
      setHasError(true);
      setErrorText("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = sanitized;
    setOtp(nextOtp);
    setHasError(false);
    setErrorText("");

    if (sanitized && index < 3) {
      inputs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isComplete || isLoading) return;

    try {
      setIsLoading(true);
      setHasError(false);
      setErrorText("");

      const verification = await verifyOTP(resolvedPhone, otpValue);
      if (!verification.verified) {
        setHasError(true);
        setErrorText(verification.message || "OTP Incorrect! Please try again.");
        return;
      }

      if (resetFlow === "true") {
        router.replace({
          pathname: "/forgot-otp-success",
          params: { phone: resolvedPhone },
        });
        return;
      }

      await createProfile(
        resolvedName,
        resolvedPhone,
        resolvedPassword,
        resolvedRole,
        String(resolvedBuildingId),
        resolvedFloor,
        resolvedFlatNo
      );
      router.push("/otp-success");
    } catch (error) {
      setHasError(true);
      setErrorText(getErrorMessage(error, "Verification failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "OTP Verification" }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.bg}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.card}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity style={[styles.segment, styles.segmentActive]}>
                  <Text style={[styles.segmentText, styles.segmentTextActive]}>
                    OTP
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.segment} disabled>
                  <Text style={styles.segmentText}>RESET PIN</Text>
                </TouchableOpacity>
              </View>

              {hasError ? (
                <Text style={styles.errorTitle}>
                  OTP <Text style={styles.errorHighlight}>Incorrect</Text>! Please
                  try again.
                </Text>
              ) : (
                <Text style={styles.cardTitle}>Enter 4-digit OTP</Text>
              )}

              <Text style={styles.subtitle}>
                {`Code sent to ${resolvedPhone ?? "your number"}`}
              </Text>

              <View style={styles.otpRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={i}
                    ref={inputs[i]}
                    style={[styles.otpBox, hasError && styles.otpBoxError]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={(v) => handleOtpChange(i, v)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(i, nativeEvent.key)
                    }
                    selectTextOnFocus
                  />
                ))}
              </View>

              {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text style={styles.resendText}>
                  Didn’t receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!isComplete || isLoading) && styles.nextButtonDisabled,
                ]}
                onPress={handleVerify}
                disabled={!isComplete || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={DISABLED_TEXT} />
                ) : (
                  <Text
                    style={[
                      styles.nextButtonText,
                      (!isComplete || isLoading) && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Verify OTP
                  </Text>
                )}
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
    marginBottom: 20,
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
    color: "#000",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    marginBottom: 20,
  },
  errorHighlight: {
    color: ERROR_BORDER,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
    fontSize: 12,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  otpBox: {
    width: 52,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    borderColor: BORDER_COLOR,
    color: "#000",
  },
  otpBoxError: {
    borderColor: ERROR_BORDER,
  },
  errorText: {
    color: ERROR_BORDER,
    fontSize: 13,
    marginBottom: 8,
  },
  resendText: {
    color: MUTED_TEXT,
    textAlign: "center",
    marginBottom: 16,
  },
  resendLink: {
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
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
});
