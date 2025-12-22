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
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import FrostedCard from "./components/FrostedCard";
import { sendOTP, verifyOTP } from "./services/otp.service";
import { createProfile } from "./services/profile.service";

export default function OTPVerify() {
  const router = useRouter();
  const { phone, name, password, role, resetFlow } = useLocalSearchParams();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const resetOtp = () => {
    setOtp(["", "", "", ""]);
    setError("");
    inputs[0].current?.focus();
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      setError("");
      await sendOTP(Array.isArray(phone) ? phone[0] : phone);
      resetOtp();
    } catch (e) {
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

      const verification = await verifyOTP(
        Array.isArray(phone) ? phone[0] : phone,
        enteredOtp
      );

      if (!verification.verified) {
        setError(verification.message || "Invalid Code, Try Again");
        return;
      }

      // NEW FLOW CONTROL
      if (resetFlow === "true") {
        // FORGOT PASSWORD FLOW → Redirect to login
        router.replace(`/reset-password?phone=${phone}`);
        return;
        return;
      }

      // ORIGINAL SIGNUP FLOW
      await createProfile(
        Array.isArray(name) ? name[0] : name,
        Array.isArray(phone) ? phone[0] : phone,
        Array.isArray(password) ? password[0] : password,
        (Array.isArray(role) ? role[0] : role) as "ADMIN" | "USER"
      );

      router.push("/otp-success");
    } catch (e) {
      setError("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (text: string, index: number) => {
    if (/[^0-9]/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputs[index + 1].current?.focus();
    }

    if (!text && index > 0) {
      inputs[index - 1].current?.focus();
    }

    const finalOtp = newOtp.join("");
    if (finalOtp.length === 4) {
      setTimeout(() => handleVerify(finalOtp), 150);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <FrostedCard>
            <Text style={styles.title}>Verify your Phone Number</Text>
            <Text style={styles.subtitle}>
              Please enter the 4-digit code sent to your phone number
            </Text>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={inputs[index]}
                  style={[styles.otpBox, error ? styles.otpError : null]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                />
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text style={styles.resend}>
                Haven’t received code?{" "}
                <Text style={{ fontWeight: "700" }}>Resend</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
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
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0A174E",
  },
  subtitle: {
    marginTop: 8,
    color: "#444",
    marginBottom: 20,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
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
  otpError: {
    borderColor: "red",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },
  resend: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "#444",
  },
  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
