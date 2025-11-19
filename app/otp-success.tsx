import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import FrostedCard from "./components/FrostedCard";

export default function OTPSuccess() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <FrostedCard>
          <View style={styles.circle}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.title}>Successfully Verified</Text>
          <Text style={styles.subtitle}>
            Your registration verification has been completed successfully
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </FrostedCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#B3D6F7",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#3B5BFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  check: {
    fontSize: 40,
    color: "#3B5BFE",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A174E",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    color: "#444",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#3B5BFE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
    width: "70%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
