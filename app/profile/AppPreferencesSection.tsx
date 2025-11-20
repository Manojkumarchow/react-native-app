import React from 'react';
import SectionCard from './SectionCard';
import Row from './Row';
import { useRouter } from 'expo-router';

export default function AppPreferencesSection() {
  const router = useRouter();

  return (
    <SectionCard
      title="App Preferences"
      onEdit={() => router.push('/profile/preferences')}
    >
      <Row icon="bell-outline" label="Notifications Settings" />
      <Row icon="theme-light-dark" label="Appearance" />
    </SectionCard>
  );
}
