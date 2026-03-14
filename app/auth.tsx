import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { rms, rs, rvs } from "@/constants/responsive";
import { STORAGE_KEYS } from "@/constants/storage";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const SEGMENT_BG = "#f4f4f5";
const BORDER_COLOR = "#a1a1aa";
const PLACEHOLDER_COLOR = "#9ca3af";
const MUTED_TEXT = "#777";
const LABEL_BG = "#e4f8ff";

export default function AuthScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"LOGIN" | "SIGNUP">("LOGIN");

  // Signup fields
  const [fullName, setFullName] = useState("");
  const fullNameRef = useRef("");
  const [phone, setPhone] = useState("");

  // Login fields (phone only - PIN on next screen)
  const [loginPhone, setLoginPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hydrateLastPhone = async () => {
      try {
        const savedPhone = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN_PHONE);
        if (savedPhone && /^\d{10}$/.test(savedPhone)) {
          setLoginPhone(savedPhone);
          setActiveTab("LOGIN");
        }
      } catch {
        // non-blocking hydration
      }
    };
    hydrateLastPhone();
  }, []);

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
    const resolvedFullName = (fullNameRef.current || fullName).trim();
    if (__DEV__) {
      console.log("[auth] signup name check", {
        stateName: fullName,
        refName: fullNameRef.current,
      });
    }
    if (!resolvedFullName || !phone.trim()) {
      setError("Full name and mobile number are required");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    router.push({
      pathname: "/otp",
      params: { name: resolvedFullName, phone: phone.replace(/\D/g, "") },
    });
  };

  const handleFullNameChange = (text: string) => {
    fullNameRef.current = text;
    setFullName(text);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

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
                  <Text style={styles.cardTitle}>Let&apos;s get your account setup!</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.floatingLabel} pointerEvents="none">
                      Full Name
                    </Text>
                    <TextInput
                      style={[styles.input, styles.fullNameInput]}
                      placeholder="Enter Full Name"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={fullName}
                      onChangeText={handleFullNameChange}
                      onEndEditing={({ nativeEvent }) =>
                        handleFullNameChange(nativeEvent.text ?? "")
                      }
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.floatingLabel} pointerEvents="none">
                      Mobile Number
                    </Text>
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
                      ( We&apos;ll send a one-time password to confirm your identity )
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
                  <Text style={styles.cardTitle}>Let&apos;s get you logged in!</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.floatingLabel} pointerEvents="none">
                      Mobile Number
                    </Text>
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
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                </>
              )}
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: rvs(24),
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(8),
  },
  logo: {
    width: rs(210),
    height: rs(210),
  },
  card: {
    marginHorizontal: rs(12),
    backgroundColor: CARD_BG,
    borderRadius: rs(26),
    paddingHorizontal: rs(19),
    paddingTop: rvs(20),
    paddingBottom: rvs(28),
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: SEGMENT_BG,
    borderRadius: rs(9),
    padding: rs(2),
    marginBottom: rvs(24),
    height: rvs(38),
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
    color: PLACEHOLDER_COLOR,
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
  cardSubtitle: {
    fontSize: rms(14),
    color: "#666",
    marginBottom: rvs(20),
  },
  inputGroup: {
    marginBottom: rvs(20),
  },
  floatingLabel: {
    position: "absolute",
    left: rs(12),
    top: rvs(-8),
    backgroundColor: LABEL_BG,
    paddingHorizontal: rs(6),
    paddingVertical: rvs(2),
    borderRadius: rs(8),
    fontSize: rms(12),
    color: MUTED_TEXT,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: rs(8),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    fontSize: rms(16),
    color: "#000",
    backgroundColor: "#fff",
  },
  fullNameInput: {
    minHeight: rvs(48),
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: rs(8),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    fontSize: rms(16),
    color: "#000",
  },
  eyeButton: {
    padding: rs(12),
  },
  otpHint: {
    fontSize: rms(12),
    color: PLACEHOLDER_COLOR,
    marginTop: rvs(8),
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: rvs(20),
  },
  forgotText: {
    fontSize: rms(14),
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    minHeight: rvs(48),
    borderRadius: rs(100),
    alignItems: "center",
    justifyContent: "center",
    marginTop: rvs(8),
  },
  nextButtonText: {
    color: "#fff",
    fontSize: rms(14),
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
    fontSize: rms(14),
    marginBottom: rvs(12),
  },
});
