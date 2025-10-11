import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showMobileBlock, setShowMobileBlock] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [showOtpBlock, setShowOtpBlock] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPasswordBlock, setShowPasswordBlock] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    // Dummy credentials
    if (username === 'user' && password === 'pass') {
      // Trigger login event for tab layout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('loginSuccess'));
      }
      router.replace('/(tabs)');
    } else {
      alert('Invalid credentials. Use user/pass');
    }
  };

  const handleForgotPassword = () => {
    setShowMobileBlock(true);
  };

  const handleMobileSubmit = () => {
    setShowOtpBlock(true);
  };

  const handleOtpSubmit = () => {
    setShowPasswordBlock(true);
  };

  const handlePasswordSubmit = () => {
    // You can add password validation here
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowMobileBlock(false);
        setShowOtpBlock(false);
        setShowPasswordBlock(false);
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
        setMobileNumber('');
        // Redirect to login page
        router.replace('/(tabs)/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {!showMobileBlock ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </>
      ) : !showOtpBlock ? (
        <View style={styles.mobileBlock}>
          <Text style={styles.mobileLabel}>Registered Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleMobileSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : !showPasswordBlock ? (
        <View style={styles.otpBlock}>
          <Text style={styles.otpLabel}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={4}
          />
          {otp.length === 4 && (
            <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : !showSuccess ? (
        <View style={styles.passwordBlock}>
          <Text style={styles.passwordLabel}>Set New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {newPassword.length > 0 && confirmPassword.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.successBlock}>
          <Text style={styles.successText}>You have successfully changed your password. Redirecting you to login</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  mobileBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  mobileLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  otpBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  passwordBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  passwordLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  successBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
  },
  successText: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
