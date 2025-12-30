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
import { useRouter, Stack } from "expo-router";
import FrostedCard from "./components/FrostedCard";
import Toast from "react-native-toast-message";
import { sendOTP } from "./services/otp.service";
import { getProfile } from "./services/profile.service";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Number",
        text2: "Phone number must be 10 digits",
      });
      return;
    }

    try {
      setLoading(true);
      await getProfile(phone);
      const otpRes = await sendOTP(phone);

      router.push({
        pathname: "/otp",
        params: { phone, otp: otpRes.otp, resetFlow: "true" },
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Account Not Found",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "Forgot Password" }} />

      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.centerWrapper}>
              <View style={styles.cardWidth}>
                <FrostedCard>
                  <Text style={styles.title}>What’s your phone?</Text>
                  <Text style={styles.subtitle}>
                    We’ll send a code to your phone number
                  </Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
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
                    <Text>I remember my password?</Text>
                    <Text style={styles.signinLink}> Login</Text>
                  </TouchableOpacity>
                </FrostedCard>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#B3D6F7" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  centerWrapper: { alignItems: "center", paddingHorizontal: 16 },
  cardWidth: { width: "100%", maxWidth: 420 },

  title: { fontSize: 24, fontWeight: "700", color: "#0A174E" },
  subtitle: { marginBottom: 24, color: "#444" },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#1C98ED",
    paddingVertical: 14,
    borderRadius: 32,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  signinRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  signinLink: { fontWeight: "700", marginLeft: 4 },
});
