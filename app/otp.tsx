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
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";

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

      const hasSignupBasics = !!resolvedName && !!resolvedPhone;
      const hasFullSignupData =
        hasSignupBasics &&
        !!resolvedPassword &&
        !!resolvedRole &&
        Number.isFinite(resolvedBuildingId) &&
        resolvedBuildingId > 0;

      // Auth -> OTP flow provides only name+phone. Continue in signup screen.
      if (!hasFullSignupData) {
        router.replace({
          pathname: "/signup",
          params: {
            prefillName: resolvedName ?? "",
            prefillPhone: resolvedPhone ?? "",
          },
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
        <SafeAreaView edges={["top"]} style={styles.bg}>
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
    marginBottom: rvs(20),
    minHeight: rvs(38),
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
    color: "#000",
    marginBottom: rvs(20),
  },
  errorTitle: {
    fontSize: rms(20),
    fontWeight: "500",
    color: "#000",
    marginBottom: rvs(20),
  },
  errorHighlight: {
    color: ERROR_BORDER,
  },
  subtitle: {
    color: "#666",
    marginBottom: rvs(20),
    fontSize: rms(12),
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(12),
    marginBottom: rvs(14),
  },
  otpBox: {
    width: rs(52),
    height: rvs(44),
    borderWidth: 1.5,
    borderRadius: rs(8),
    textAlign: "center",
    fontSize: rms(18),
    fontWeight: "500",
    borderColor: BORDER_COLOR,
    color: "#000",
  },
  otpBoxError: {
    borderColor: ERROR_BORDER,
  },
  errorText: {
    color: ERROR_BORDER,
    fontSize: rms(13),
    marginBottom: rvs(8),
  },
  resendText: {
    color: MUTED_TEXT,
    textAlign: "center",
    marginBottom: rvs(16),
  },
  resendLink: {
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    minHeight: rvs(48),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
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
});
