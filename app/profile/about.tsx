import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function About() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <Text style={styles.title}>About Us</Text>

        <Text style={styles.desc}>
          This app is designed to simplify financial operations, enhance
          user convenience, and provide a seamless digital experience.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.desc}>
          Deliver secure, fast and intelligent digital solutions for everyone.
        </Text>

        <Text style={styles.sectionTitle}>Version</Text>
        <Text style={styles.desc}>2.4.1 (Build 241)</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  sectionTitle: { marginTop: 18, fontSize: 16, fontWeight: '600' },
  desc: { marginTop: 6, fontSize: 14, color: '#444', lineHeight: 20 },
});
