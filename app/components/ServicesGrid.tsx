import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const services = [
  { key: 'maintenance', label: 'Maintenance', icon: 'wallet-outline', route: '/maintenance' },
  { key: 'residents', label: 'Residents', icon: 'home-account', route: '/residents' },
  { key: 'home', label: 'Home Services', icon: 'home-heart', route: '/home-services' },
  { key: 'rent', label: 'Rent', icon: 'key-outline', route: '/rent' },
  { key: 'watch', label: 'Watch Men', icon: 'account-tie', route: '/watchmen' },
  // { key: 'cctv', label: 'CCTV', icon: 'security', route: '/cctv' },
  { key: 'emergency', label: 'Emergency Contact', icon: 'phone-alert', route: '/emergency' },
  { key: 'announce', label: 'Latest Announcement', icon: 'bullhorn', route: '/announcements' },
];

export default function ServicesGrid() {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {services.map((s) => (
          <TouchableOpacity key={s.key} style={styles.cell} onPress={() => router.push(s.route as any)}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name={s.icon as any} size={36} color="#1C98ED" />
            </View>
            <Text style={styles.label}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '23%', minWidth: 84, alignItems: 'center', marginBottom: 18 },
  icon: { width: 72, height: 72, borderRadius: 12, backgroundColor: 'rgba(28,152,237,0.12)', borderWidth: 1, borderColor: 'rgba(28,152,237,0.25)', marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  label: { textAlign: 'center', fontSize: 12, color: '#444' },
});
