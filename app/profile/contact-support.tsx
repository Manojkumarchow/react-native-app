import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ContactSupport() {
  const openEmail = () => Linking.openURL("mailto:support@fintechpro.com");
  const openPhone = () => Linking.openURL("tel:+1800123456");
  const openWebsite = () => Linking.openURL("https://www.fintechpro.com/support");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <Text style={styles.title}>Contact Support</Text>
        <Text style={styles.subtitle}>We're here to help you anytime.</Text>

        <TouchableOpacity style={styles.row} onPress={openEmail}>
          <MaterialCommunityIcons name="email-outline" size={22} color="#1C98ED" />
          <Text style={styles.label}>Email Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={openPhone}>
          <MaterialCommunityIcons name="phone-outline" size={22} color="#1C98ED" />
          <Text style={styles.label}>Call Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={openWebsite}>
          <MaterialCommunityIcons name="web" size={22} color="#1C98ED" />
          <Text style={styles.label}>Visit Website</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginBottom: 20, color: '#666' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    gap: 12,
  },
  label: { fontSize: 15, color: '#333' },
});
