import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (phone === "9999" && password === "8888") {
      setError("erroe"); 
      router.replace("/home"); 
    } else {
      setError("Invalid Credentials"); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle} />

      <LinearGradient colors={["#ffffff", "#dfeffc"]} style={styles.card}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#888"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#888"
        />

        <TouchableOpacity onPress={() => router.push("/forgot")}>
          <Text style={styles.forgot}>Forget Password</Text>
        </TouchableOpacity>

        {/* 🔴 Error message appears now */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => router.push("/signup")}
          >
            Sign up
          </Text>
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C98ED66",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  circle: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: 350,
    backgroundColor: "#1C98ED",
    top: -420,
    left: -250,
  },

  card: {
    width: "85%",
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0D1A2E",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#6478F2",
    paddingVertical: 8,
    fontSize: 16,
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: 5,
    color: "#6478F2",
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#0C88E8",
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
  signupLink: {
    color: "#6478F2",
    fontWeight: "600",
  },
});
