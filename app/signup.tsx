import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import FrostedCard from "./components/FrostedCard";

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const passwordRef = useRef<TextInput>(null);
  const handleSignup = () => {
    setError("");
    if (!fullName || !phone || !password) {
      setError("All fields are required");
      return;
    }
    alert("Signup successful!");
  };

  const validatePassword = (pwd:string) => {
  const isValid =
    /[A-Z]/.test(pwd) &&       // uppercase
    /[a-z]/.test(pwd) &&       // lowercase
    /[0-9]/.test(pwd) &&       // number
    /[^A-Za-z0-9]/.test(pwd) &&// special char
    pwd.length >= 8;           // min length

  setIsPasswordValid(isValid);
  return isValid;
};

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <FrostedCard>
              <Text style={styles.title}>Create an account!!</Text>
              <Text style={styles.subtitle}>Register your account</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#555"
                value={fullName}
                onChangeText={setFullName}
              />

              <TextInput
                style={[
                  styles.input,
                  isPhoneValid === false && styles.inputError,
                  isPhoneValid === true &&
                    phone.length === 10 &&
                    styles.inputSuccess,
                ]}
                placeholder="Phone Number"
                placeholderTextColor="#555"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "");
                  setPhone(cleaned);

                  if (cleaned.length === 10) {
                    setIsPhoneValid(true);
                    passwordRef.current?.focus();
                  } else {
                    setIsPhoneValid(false);
                  }
                }}
              />

              {isPhoneValid === false && phone.length > 0 && (
                <Text style={styles.validationError}>
                  Phone number must be 10 digits
                </Text>
              )}

              {/* <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              /> */}

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
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text);
                }}
              />

              {isPasswordValid === false && password.length > 0 && (
                <Text style={styles.validationError}>
                  Password must include uppercase, lowercase, number, special
                  character and be at least 8 characters.
                </Text>
              )}

              {/* ERROR message for missing fields */}
              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* SIGNUP BUTTON — this was missing */}
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Signup</Text>
              </TouchableOpacity>

              {/* SIGN-IN LINK */}
              <View style={styles.signinRow}>
                <Text style={styles.signinText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={styles.signinLink}> Sign in</Text>
                </TouchableOpacity>
              </View>
            </FrostedCard>
          </ScrollView>
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
    fontSize: 26,
    fontWeight: "700",
    color: "#0A174E",
  },

  subtitle: {
    fontSize: 14,
    color: "#444",
    marginBottom: 25,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#6C63FF",
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
    color: "#222",
  },

  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  signinText: {
    color: "#222",
    fontSize: 14,
  },

  signinLink: {
    color: "#0A174E",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
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
});
