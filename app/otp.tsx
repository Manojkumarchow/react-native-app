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
  ScrollView,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import FrostedCard from "./components/FrostedCard";
import { sendOTP, verifyOTP } from "./services/otp.service";
import { createProfile } from "./services/profile.service";

export default function OTPVerify() {
  const router = useRouter();
  const { phone, name, password, role, buildingId, resetFlow } =
    useLocalSearchParams();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
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
    | "USER";

  const resolvedBuildingId = Number(
    Array.isArray(buildingId) ? buildingId[0] : buildingId
  );

  const handleResend = async () => {
    try {
      setIsLoading(true);
      setError("");
      await sendOTP(resolvedPhone);
      setOtp(["", "", "", ""]);
      inputs[0].current?.focus();
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (enteredOtp = otp.join("")) => {
    if (enteredOtp.length < 4) {
      setError("Please enter all 4 digits");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const verification = await verifyOTP(resolvedPhone, enteredOtp);
      if (!verification.verified) {
        setError(verification.message || "Invalid Code");
        return;
      }

      if (resetFlow === "true") {
        router.replace(`/reset-password?phone=${resolvedPhone}`);
        return;
      }

      await createProfile(
        resolvedName,
        resolvedPhone,
        resolvedPassword,
        resolvedRole,
        String(resolvedBuildingId)
      );

      router.push("/otp-success");
    } catch {
      setError("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ headerShown: false, title: "OTP Verification" }}
      />

      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.centerWrapper}>
              <View style={styles.cardWidth}>
                <FrostedCard>
                  <Text style={styles.title}>Verify your Phone Number</Text>
                  <Text style={styles.subtitle}>
                    Enter the 4-digit code sent to your phone
                  </Text>

                  <View style={styles.otpRow}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={inputs[index]}
                        style={[styles.otpBox, error && styles.otpError]}
                        maxLength={1}
                        keyboardType="number-pad"
                        value={digit}
                        onChangeText={(text) => {
                          const newOtp = [...otp];
                          newOtp[index] = text.replace(/[^0-9]/g, "");
                          setOtp(newOtp);
                          if (text && index < 3)
                            inputs[index + 1].current?.focus();
                        }}
                      />
                    ))}
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                    <Text style={styles.resend}>
                      Didn’t receive code?{" "}
                      <Text style={{ fontWeight: "700" }}>Resend</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleVerify()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Verify</Text>
                    )}
                  </TouchableOpacity>
                </FrostedCard>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#B3D6F7" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  centerWrapper: { alignItems: "center", paddingHorizontal: 16 },
  cardWidth: { width: "100%", maxWidth: 420 },

  title: { fontSize: 24, fontWeight: "700", color: "#0A174E" },
  subtitle: { marginTop: 8, marginBottom: 20, color: "#444" },

  otpRow: { flexDirection: "row", justifyContent: "space-between" },
  otpBox: {
    width: 50,
    height: 55,
    borderWidth: 1.5,
    borderRadius: 6,
    textAlign: "center",
    fontSize: 22,
    borderColor: "#6C63FF",
    backgroundColor: "#fff",
  },
  otpError: { borderColor: "red" },
  error: { color: "red", textAlign: "center", marginTop: 10 },

  resend: { textAlign: "center", marginVertical: 12 },
  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
