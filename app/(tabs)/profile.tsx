import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    altNumber: '',
    occupation: '',
    company: '',
    emergencyContact: '',
    emergencyRelation: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const errs = {};

    if (!form.fullName) errs.fullName = 'Full Name is required';
    if (!form.dob) errs.dob = 'Date of Birth is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.mobile || !/^[0-9]{10}$/.test(form.mobile)) errs.mobile = 'Valid Mobile Number is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid Email is required';

    if (!form.address) errs.address = 'Current Address is required';
    if (!form.city) errs.city = 'City is required';
    if (!form.state) errs.state = 'State is required';
    if (!form.pincode || !/^[0-9]{6}$/.test(form.pincode)) errs.pincode = 'Valid Pincode is required';
    if (form.altNumber && !/^[0-9]{10}$/.test(form.altNumber)) errs.altNumber = 'Alternate Number must be 10 digits';

    if (!form.occupation) errs.occupation = 'Occupation is required';
    if (!form.company) errs.company = 'Company Name is required';
    if (!form.emergencyContact) errs.emergencyContact = 'Emergency Contact Name is required';
    if (!form.emergencyRelation) errs.emergencyRelation = 'Relationship with Emergency Contact is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.submitMessage}>Thank you! Form submitted successfully.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={form.fullName} onChangeText={val => handleChange('fullName', val)} />
        {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput style={styles.input} value={form.dob} placeholder="YYYY-MM-DD" onChangeText={val => handleChange('dob', val)} />
        {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={form.gender} onChangeText={val => handleChange('gender', val)} />
        {errors.gender && <Text style={styles.error}>{errors.gender}</Text>}

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={form.mobile} onChangeText={val => handleChange('mobile', val)} />
        {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} keyboardType="email-address" value={form.email} onChangeText={val => handleChange('email', val)} />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text style={styles.sectionTitle}>Current Address and Contact</Text>

        <Text style={styles.label}>Current Address</Text>
        <TextInput style={styles.input} value={form.address} onChangeText={val => handleChange('address', val)} />
        {errors.address && <Text style={styles.error}>{errors.address}</Text>}

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={form.city} onChangeText={val => handleChange('city', val)} />
        {errors.city && <Text style={styles.error}>{errors.city}</Text>}

        <Text style={styles.label}>State</Text>
        <TextInput style={styles.input} value={form.state} onChangeText={val => handleChange('state', val)} />
        {errors.state && <Text style={styles.error}>{errors.state}</Text>}

        <Text style={styles.label}>Pincode</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={form.pincode} onChangeText={val => handleChange('pincode', val)} />
        {errors.pincode && <Text style={styles.error}>{errors.pincode}</Text>}

        <Text style={styles.label}>Alternate Number</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={form.altNumber} onChangeText={val => handleChange('altNumber', val)} />
        {errors.altNumber && <Text style={styles.error}>{errors.altNumber}</Text>}

        <Text style={styles.sectionTitle}>Emergency / Professional Details</Text>

        <Text style={styles.label}>Occupation</Text>
        <TextInput style={styles.input} value={form.occupation} onChangeText={val => handleChange('occupation', val)} />
        {errors.occupation && <Text style={styles.error}>{errors.occupation}</Text>}

        <Text style={styles.label}>Company Name</Text>
        <TextInput style={styles.input} value={form.company} onChangeText={val => handleChange('company', val)} />
        {errors.company && <Text style={styles.error}>{errors.company}</Text>}

        <Text style={styles.label}>Emergency Contact Name</Text>
        <TextInput style={styles.input} value={form.emergencyContact} onChangeText={val => handleChange('emergencyContact', val)} />
        {errors.emergencyContact && <Text style={styles.error}>{errors.emergencyContact}</Text>}

        <Text style={styles.label}>Relationship with Emergency Contact</Text>
        <TextInput style={styles.input} value={form.emergencyRelation} onChangeText={val => handleChange('emergencyRelation', val)} />
        {errors.emergencyRelation && <Text style={styles.error}>{errors.emergencyRelation}</Text>}

        <Button title="Submit" onPress={handleSubmit} color="#007AFF" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#f5f7fa' },
  container: {
    flex: 1,
    padding: 20,
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fafafa',
    marginTop: 6,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  submitMessage: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  }
});
