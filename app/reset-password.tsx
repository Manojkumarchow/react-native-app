import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import FrostedCard from "./components/FrostedCard";
import { updateProfile } from "./services/profile.service";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  /* ---------------------------------
     Password Validation (UNCHANGED)
  ---------------------------------- */
  const validatePassword = (pwd: string) => {
    const valid =
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd) &&
      pwd.length >= 8;

    setIsPasswordValid(valid);
    return valid;
  };

  /* ---------------------------------
     Reset Handler (UNCHANGED)
  ---------------------------------- */
  const handleReset = async () => {
    setError("");

    if (!validatePassword(password)) {
      setError(
        "Password must include uppercase, lowercase, number, special character and be at least 8 characters."
      );
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await updateProfile(Array.isArray(phone) ? phone[0] : phone, password);

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
      });

      setTimeout(() => router.replace("/login"), 2000);
    } catch {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Header for navigation */}
      <Stack.Screen options={{ headerShown: false, title: "Reset Password" }} />

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
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>Enter your new password</Text>

                  <TextInput
                    ref={passwordRef}
                    style={[
                      styles.input,
                      isPasswordValid === false && styles.inputError,
                      isPasswordValid === true &&
                        password.length > 0 &&
                        styles.inputSuccess,
                    ]}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    placeholderTextColor="#555"
                    onChangeText={(text) => {
                      setPassword(text);
                      validatePassword(text);
                    }}
                    onSubmitEditing={() => confirmRef.current?.focus()}
                  />

                  {isPasswordValid === false && password.length > 0 && (
                    <Text style={styles.validationError}>
                      Password must include uppercase, lowercase, number,
                      special character and be at least 8 characters.
                    </Text>
                  )}

                  <TextInput
                    ref={confirmRef}
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#555"
                    secureTextEntry
                    value={confirm}
                    onChangeText={setConfirm}
                  />

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.6 }]}
                    disabled={loading}
                    onPress={handleReset}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </FrostedCard>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Toast />
      </View>
    </>
  );
}

/* ---------------------------------
   Styles (UI CONSISTENT)
---------------------------------- */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center", // 🔑 vertical centering
  },

  centerWrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
  },

  cardWidth: {
    width: "100%",
    maxWidth: 420, // 🔑 same as Login
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0A174E",
  },

  subtitle: {
    marginBottom: 24,
    color: "#444",
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
    color: "#222",
  },

  inputError: {
    borderBottomColor: "red",
  },

  inputSuccess: {
    borderBottomColor: "green",
  },

  validationError: {
    color: "red",
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 13,
  },

  button: {
    backgroundColor: "#1C98ED",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
