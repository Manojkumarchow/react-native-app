import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddContact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const saveContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Please enter both name and phone number");
      return;
    }

    try {
      const stored = await AsyncStorage.getItem("contacts");
      let contacts = stored ? JSON.parse(stored) : [];

      if (contacts.length >= 4) {
        Alert.alert("Limit Reached", "You have added the maximum of 4 contacts");
        return;
      }

      contacts.push({
        id: Date.now(),
        label: name,
        phone,
      });

      await AsyncStorage.setItem("contacts", JSON.stringify(contacts));

      router.back();
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Add Contact" }} />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.btn} onPress={saveContact}>
        <Text style={styles.btnText}>Save Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  label: { marginTop: 20, fontSize: 16, fontWeight: "600" },

  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },

  btn: {
    marginTop: 40,
    backgroundColor: "#18a5ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
