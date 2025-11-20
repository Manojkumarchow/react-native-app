import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Security() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <Text style={styles.title}>Security & Privacy</Text>

        <TouchableOpacity style={styles.row}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#1C98ED" />
          <Text style={styles.label}>Change Password</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color="#1C98ED" />
          <Text style={styles.label}>Two-Factor Authentication</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <MaterialCommunityIcons name="delete-outline" size={20} color="#DC2626" />
          <Text style={[styles.label, { color: '#DC2626' }]}>Delete Account</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  row: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    gap: 14,
  },
  label: { fontSize: 15, color: '#333', flex: 1 },
});
