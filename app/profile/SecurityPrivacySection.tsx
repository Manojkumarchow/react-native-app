import React from "react";
import SectionCard from "./SectionCard";
import Row from "./Row";
import { useRouter } from "expo-router";

export default function SecurityPrivacySection() {
  const router = useRouter();

  return (
    <SectionCard title="Security & Privacy">
      <Row
        icon="comment-outline"
        label="Feedback"
        onPress={() => {
          // hook this later if needed
        }}
      />

      <Row
        icon="information-outline"
        label="About Us"
        onPress={() => router.push("/profile/about-us")}
      />

      <Row
        icon="headset"
        label="Contact Support"
        onPress={() => {
          router.push("/profile/contact-us");
        }}
      />
    </SectionCard>
  );
}
