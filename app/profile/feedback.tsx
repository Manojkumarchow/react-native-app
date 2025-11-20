import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';

export default function Feedback() {
  const [feedback, setFeedback] = useState('');

  const submit = () => {
    Alert.alert("Submitted", "Your feedback has been submitted.");
    setFeedback("");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <Text style={styles.title}>Feedback</Text>

        <Text style={styles.label}>Tell us what you think</Text>
        <TextInput
          style={styles.textarea}
          value={feedback}
          onChangeText={setFeedback}
          multiline
          placeholder="Write your feedback here..."
        />

        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  label: { color: '#444', marginBottom: 10, fontSize: 14 },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 150,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1C98ED',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
