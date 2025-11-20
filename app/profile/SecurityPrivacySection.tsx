import React from 'react';
import SectionCard from './SectionCard';
import Row from './Row';
import { useRouter } from 'expo-router';

export default function SecurityPrivacySection() {
  const router = useRouter();

  return (
    <SectionCard
      title="Security & Privacy"
      onEdit={() => router.push('/profile/security')}
    >
      <Row icon="comment-outline" label="Feedback" />
      <Row icon="information-outline" label="About Us" />
      <Row icon="headset" label="Contact Support" />
    </SectionCard>
  );
}
