import React, { useState } from "react";
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
import { useRouter, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { sendOTP } from "./services/otp.service";
import { getProfile } from "./services/profile.service";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const BORDER_COLOR = "#a1a1aa";
const PLACEHOLDER_COLOR = "#9ca3af";
const MUTED_TEXT = "#777";
const LABEL_BG = "#e4f8ff";

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
      const response = await sendOTP(phone);
      console.log(response);
      router.push({
        pathname: "/otp",
        params: { phone, resetFlow: "true" },
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
      <Stack.Screen options={{ headerShown: false, title: "Forgot PIN" }} />
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
              <Text style={styles.cardTitle}>Forgot your PIN?</Text>
              <Text style={styles.cardSubtitle}>
                Enter your mobile number to receive a 4-digit OTP.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.floatingLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
                />
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <Toast />
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
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    marginBottom: 20,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  floatingLabel: {
    position: "absolute",
    left: 12,
    top: -8,
    backgroundColor: LABEL_BG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    color: MUTED_TEXT,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
