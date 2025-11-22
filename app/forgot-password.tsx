import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import FrostedCard from "./components/FrostedCard";
import Toast from "react-native-toast-message";
import { sendOTP } from "./services/otp.service";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone || phone.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Number",
        text2: "Phone number must be 10 digits",
      });
      return;
    }

    try {
      setLoading(true);
      const otpRes = await sendOTP(phone);

      router.push({
        pathname: "/otp",
        params: {
          phone,
          otp: otpRes.otp, // Debug only
          resetFlow: "true",
        },
      });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed", text2: "Try again later" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <FrostedCard>
            <Text style={styles.title}>What’s your Phone?</Text>
            <Text style={styles.subtitle}>
              We’ll send code to your phone number
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Your Phone Number"
              placeholderTextColor="#555"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signinRow}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.signinText}>I remember my old Password?</Text>
              <Text style={styles.signinLink}> Login Now</Text>
            </TouchableOpacity>
          </FrostedCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </View>
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
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#1F232F",
    marginBottom: 32,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
    color: "#222",
    outlineColor: "transparent",
  },

  button: {
    backgroundColor: "#1C98ED",
    paddingVertical: 14,
    borderRadius: 32,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  signinText: {
    color: "#222",
    fontSize: 14,
  },

  signinLink: {
    color: "#5956E9",
    fontSize: 14,
    fontWeight: "700",
  },
});
