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
import { Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const SEGMENT_BG = "#f4f4f5";
const BORDER_COLOR = "#a1a1aa";
const PLACEHOLDER_COLOR = "#9ca3af";
const MUTED_TEXT = "#777";
const LABEL_BG = "#e4f8ff";

export default function AuthScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"LOGIN" | "SIGNUP">("SIGNUP");

  // Signup fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Login fields (phone only - PIN on next screen)
  const [loginPhone, setLoginPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginNext = () => {
    setError("");
    if (!loginPhone || loginPhone.replace(/\D/g, "").length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone",
        text2: "Please enter a valid 10-digit mobile number",
      });
      return;
    }
    router.push({
      pathname: "/login-pin",
      params: { phone: loginPhone.replace(/\D/g, "") },
    });
  };

  const handleSignupNext = () => {
    setError("");
    if (!fullName.trim() || !phone.trim()) {
      setError("Full name and mobile number are required");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    router.push({
      pathname: "/signup",
      params: { prefillName: fullName.trim(), prefillPhone: phone.replace(/\D/g, "") },
    });
  };

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
            {/* Header: Logo only (text is in the image) */}
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* White card just below logo with extra whitespace */}
            <View style={styles.card}>
              {/* Segmented Control */}
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segment, activeTab === "LOGIN" && styles.segmentActive]}
                  onPress={() => setActiveTab("LOGIN")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeTab === "LOGIN" && styles.segmentTextActive,
                    ]}
                  >
                    LOGIN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, activeTab === "SIGNUP" && styles.segmentActive]}
                  onPress={() => setActiveTab("SIGNUP")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      activeTab === "SIGNUP" && styles.segmentTextActive,
                    ]}
                  >
                    SIGNUP
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === "SIGNUP" ? (
                <>
                  <Text style={styles.cardTitle}>Let's get your account setup!</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.floatingLabel}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Full Name"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                    />
                  </View>

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
                    <Text style={styles.otpHint}>
                      ( We'll send a one-time password to confirm your identity )
                    </Text>
                  </View>

                  {!!error && <Text style={styles.error}>{error}</Text>}

                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleSignupNext}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Let's get you logged in!</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.floatingLabel}>Mobile Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Mobile Number"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={loginPhone}
                      onChangeText={(t) =>
                        setLoginPhone(t.replace(/[^0-9]/g, ""))
                      }
                    />
                  </View>

                  {!!error && <Text style={styles.error}>{error}</Text>}

                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleLoginNext}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.nextButtonText}>Next</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
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
    color: PLACEHOLDER_COLOR,
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  eyeButton: {
    padding: 12,
  },
  otpHint: {
    fontSize: 12,
    color: PLACEHOLDER_COLOR,
    marginTop: 8,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: BRAND_BLUE,
    fontWeight: "600",
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
  error: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12,
  },
});
