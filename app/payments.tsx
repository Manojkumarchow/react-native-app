import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Payments() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.center}>
        <Text style={styles.title}>Payments (placeholder)</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, alignItems:'center', justifyContent:'center' },
  title: { fontSize:18, fontWeight:'700' },
});
