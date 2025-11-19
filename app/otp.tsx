import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import FrostedCard from "./components/FrostedCard";

export default function OTPVerify() {
  const router = useRouter();
  const { phone } = useLocalSearchParams(); // optional phone from signup

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (text: string, index: number) => {
    if (/[^0-9]/.test(text)) return;

    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);

    // Move to next box
    if (text && index < 3) {
      inputs[index + 1].current?.focus();
    }

    // Move back when deleting
    if (!text && index > 0) {
      inputs[index - 1].current?.focus();
    }

    // Auto-verify when all 4 digits are filled
    const finalOtp = updated.join("");
    if (finalOtp.length === 4) {
      setTimeout(() => handleVerify(finalOtp), 100);
    }
  };

  const handleVerify = (enteredOtp = otp.join("")) => {
    if (enteredOtp.length < 4) {
      setError("Please enter the full 4-digit code");
      return;
    }

    if (enteredOtp === "1234") {
      setError("");
      router.push("/otp-success");
    } else {
      setError("Invalid Code, Try Again");
    }
  };

  const resetOtp = () => {
    setOtp(["", "", "", ""]);
    setError("");
    inputs[0].current?.focus();
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
              Please enter the 4-digit code sent to your phone Number
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

            {/* <TouchableOpacity onPress={() => alert("Resend clicked")}>
              <Text style={styles.resend}>
                Haven’t Receive Code? <Text style={{ fontWeight: "700" }}>Resend</Text>
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={resetOtp}>
              <Text style={styles.resend}>
                Haven’t Receive Code?{" "}
                <Text style={{ fontWeight: "700" }}>Resend</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleVerify()}
            >
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.signinText}>
                Already have an account?{" "}
                <Text style={styles.signinLink}>Sign in</Text>
              </Text>
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signinText: {
    textAlign: "center",
    color: "#222",
  },
  signinLink: {
    color: "#0A174E",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
