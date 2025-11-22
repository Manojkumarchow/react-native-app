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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import FrostedCard from "./components/FrostedCard";
import { updateProfile } from "./services/profile.service";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

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

  const handleReset = async () => {
    if (!validatePassword(password)) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Follow the required password rules",
      });
      return;
    }

    if (password !== confirm) {
      Toast.show({
        type: "error",
        text1: "Password mismatch",
        text2: "Both passwords must match",
      });
      return;
    }

    try {
      setLoading(true);

      await updateProfile(
        Array.isArray(phone) ? phone[0] : phone,
        Array.isArray(password) ? password[0] : password
      );

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
      });

      setTimeout(() => router.replace("/login"), 2000);
    } catch (e) {
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
    <View style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FrostedCard>
          <Text style={styles.title}>Reset Password!</Text>
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
              Password must include uppercase, lowercase, number, special
              character and be at least 8 characters.
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#B3D6F7", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", color: "#0A174E" },
  subtitle: { marginBottom: 24, color: "#444" },
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
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  inputError: { borderBottomColor: "red" },
  inputSuccess: { borderBottomColor: "green" },
  validationError: {
    color: "red",
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
});
