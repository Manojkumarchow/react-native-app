import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

export default function EditAccount() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState((params.name as string) ?? '');
  const [phone, setPhone] = useState((params.phone as string) ?? '');
  const [email, setEmail] = useState((params.email as string) ?? '');
  const [flat, setFlat] = useState((params.flat as string) ?? '');
  const [building, setBuilding] = useState((params.building as string) ?? '');
  const [address, setAddress] = useState((params.address as string) ?? '');

  const onSave = () => {
    // For now mock saving behavior
    Alert.alert('Saved', 'Profile changes saved (mock).');
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.heading}>Edit Account Details</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Text style={styles.label}>Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />

          <Text style={styles.label}>Flat</Text>
          <TextInput value={flat} onChangeText={setFlat} style={styles.input} />

          <Text style={styles.label}>Building</Text>
          <TextInput value={building} onChangeText={setBuilding} style={styles.input} />

          <Text style={styles.label}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} style={[styles.input, { height: 80 }]} multiline />

          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f8fb' },
  container: { padding: 18, marginTop: 18 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, color: '#333', marginTop: 10 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderColor: '#E6E6E6', borderWidth: 1, marginTop: 6 },
  saveBtn: { marginTop: 18, backgroundColor: '#1C98ED', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
