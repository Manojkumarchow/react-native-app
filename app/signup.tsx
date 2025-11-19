import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import FrostedCard from './components/FrostedCard';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = () => {
    setError('');
    if (!fullName || !phone || !password) {
      setError('All fields are required');
      return;
    }
    alert('Signup successful!');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.bg}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#555"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Signup</Text>
              </TouchableOpacity>

              <View style={styles.signinRow}>
                <Text style={styles.signinText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
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
    backgroundColor: '#B3D6F7',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0A174E',
  },

  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 25,
  },

  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#6C63FF',
    fontSize: 16,
    paddingVertical: 10,
    marginBottom: 20,
    color: '#222',
  },

  button: {
    backgroundColor: '#3B5BFE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  signinText: {
    color: '#222',
    fontSize: 14,
  },

  signinLink: {
    color: '#0A174E',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
