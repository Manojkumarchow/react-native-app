import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

const backgroundImage = require('../../assets/images/home.jpg');
const BASE_URL = 'http://localhost:8080/whistleup/profile';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProfileScreen() {
  const [fetchForm, setFetchForm] = useState({ userId: '' });
  const [updateForm, setUpdateForm] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [showUpdateSection, setShowUpdateSection] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);

  // Success popup animation
  const [successMessage, setSuccessMessage] = useState('');
  const successOpacity = useRef(new Animated.Value(0)).current;

  const showSuccessPopup = (message) => {
    setSuccessMessage(message);
    Animated.timing(successOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => setSuccessMessage(''));
      }, 1800);
    });
  };

  const handleChange = (formSetter, field, value) => {
    formSetter((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch Profile
  const handleFetch = async () => {
    if (!fetchForm.userId.trim()) return alert('⚠️ Enter User ID to fetch');
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/${fetchForm.userId}`);
      if (res.ok) {
        const data = await res.json();
        setUpdateForm({
          userId: data.userId || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          password: '',
          role: data.role || '',
        });
        setShowUpdateSection(true);
        setShowCreateSection(false);
      } else alert('❌ Profile not found');
    } catch (e) {
      alert('⚠️ Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const handleUpdate = async () => {
    if (!updateForm.password.trim()) return alert('⚠️ Password required');
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm),
      });
      if (res.ok) {
        showSuccessPopup('🎉 Profile Updated Successfully!');
        setUpdateForm({ userId: '', name: '', email: '', phone: '', password: '', role: '' });
        setFetchForm({ userId: '' });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowUpdateSection(false);
      } else alert('❌ Failed to update profile');
    } catch (e) {
      alert('⚠️ Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Create Profile
  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        showSuccessPopup('🎉 Profile Created Successfully!');
        setCreateForm({ name: '', email: '', phone: '', password: '', role: '' });
      } else alert('❌ Failed to create profile');
    } catch (e) {
      alert('⚠️ Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Slide animation for Create section
  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showCreateSection ? 1 : 0,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showCreateSection]);

  const slideStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.header}>👤 Profile Management</Text>

          {/* Fetch Section */}
          <Text style={styles.sectionTitle}>Fetch Profile by User ID</Text>
          <TextInput
            style={styles.input}
            value={fetchForm.userId}
            onChangeText={(val) => handleChange(setFetchForm, 'userId', val)}
            placeholder="Enter User ID"
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.smallButtonFetch} onPress={handleFetch}>
            <Text style={styles.smallButtonText}>Fetch Profile</Text>
          </TouchableOpacity>

          {showUpdateSection && (
            <View style={{ marginTop: 15 }}>
              <Text style={styles.sectionTitle}>Update Profile</Text>
              {['name', 'email', 'phone', 'password', 'role'].map((key) => (
                <TextInput
                  key={key}
                  style={styles.input}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={updateForm[key]}
                  onChangeText={(v) => handleChange(setUpdateForm, key, v)}
                  secureTextEntry={key === 'password'}
                />
              ))}
              <TouchableOpacity style={styles.smallButtonUpdate} onPress={handleUpdate}>
                <Text style={styles.smallButtonText}>Update Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Create Section */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.toggleHeader}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setShowCreateSection(!showCreateSection);
              setShowUpdateSection(false);
            }}
          >
            <Text style={styles.toggleText}>
              {showCreateSection ? '⬆️ Hide Create User' : '➕ Create New User'}
            </Text>
          </TouchableOpacity>

          {showCreateSection && (
            <Animated.View style={[slideStyle, { marginTop: 10 }]}>
              {['name', 'email', 'phone', 'password', 'role'].map((key) => (
                <TextInput
                  key={key}
                  style={styles.input}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={createForm[key]}
                  onChangeText={(v) => handleChange(setCreateForm, key, v)}
                  secureTextEntry={key === 'password'}
                />
              ))}
              <TouchableOpacity style={styles.smallButtonCreate} onPress={handleCreate}>
                <Text style={styles.smallButtonText}>Create Profile</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Success Popup */}
      {successMessage !== '' && (
        <Animated.View style={[styles.successPopup, { opacity: successOpacity }]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successText}>{successMessage}</Text>
        </Animated.View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fafafa',
    marginTop: 8,
  },
  toggleHeader: {
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  toggleText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },

  // Buttons
  smallButtonFetch: {
    backgroundColor: '#1E90FF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 3,
    marginTop: 12,
  },
  smallButtonUpdate: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 3,
    marginTop: 12,
  },
  smallButtonCreate: {
    backgroundColor: '#32CD32',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 3,
    marginTop: 12,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Success Popup
  successPopup: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  successEmoji: { fontSize: 48 },
  successText: { fontSize: 18, fontWeight: 'bold', color: '#28a745', marginTop: 8 },
});
