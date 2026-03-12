import React, { useMemo } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

function getStatusTheme(status: IssueStatus) {
  if (status === "OPEN") {
    return {
      idColor: "#C81616",
      pillBg: "rgba(255,86,86,0.1)",
      pillColor: "#C81616",
      dotColor: "#C81616",
      label: "Open",
    };
  }
  if (status === "IN_PROGRESS") {
    return {
      idColor: "#A16207",
      pillBg: "rgba(234,179,8,0.12)",
      pillColor: "#A16207",
      dotColor: "#A16207",
      label: "Processing",
    };
  }
  return {
    idColor: "#1C98ED",
    pillBg: "rgba(144,203,243,0.27)",
    pillColor: "#1C98ED",
    dotColor: "#1C98ED",
    label: "Closed",
  };
}

export default function TenantIssueDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    status?: string;
    timeLabel?: string;
    images?: string;
  }>();

  const status = (params.status as IssueStatus) || "OPEN";
  const theme = getStatusTheme(status);

  const images = useMemo(() => {
    if (!params.images) return [];
    try {
      const parsed = JSON.parse(String(params.images));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params.images]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#181818" />
            </Pressable>
            <Text style={styles.headerTitle}>Raise Issue</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.issueCard}>
            <View style={styles.issueTopRow}>
              <Text style={[styles.issueId, { color: theme.idColor }]}>
                {params.id || "ISS123567"}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: theme.pillBg }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.dotColor }]} />
                <Text style={[styles.statusText, { color: theme.pillColor }]}>{theme.label}</Text>
              </View>
            </View>

            <Text style={styles.issueTitle}>
              {params.title || "Staircase light not working on 3rd floor."}
            </Text>
            <Text style={styles.issueTime}>{params.timeLabel || "Posted 5min ago"}</Text>
          </View>

          {images.length ? (
            images.map((uri, idx) => (
              <Image
                key={`${uri}-${idx}`}
                source={{ uri }}
                style={styles.issueImage}
                resizeMode="cover"
              />
            ))
          ) : (
            <>
              <View style={styles.placeholderImage} />
              <View style={styles.placeholderImage} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: { padding: 2 },
  headerTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 14,
  },
  issueCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  issueTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueId: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusPill: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
  },
  issueTitle: {
    color: "#000",
    fontSize: 32,
    fontWeight: "500",
    marginBottom: 4,
  },
  issueTime: {
    fontSize: 10,
    color: "#A1A1AA",
  },
  issueImage: {
    width: "100%",
    height: 187,
    borderRadius: 12,
    backgroundColor: "#0E324B",
  },
  placeholderImage: {
    width: "100%",
    height: 187,
    borderRadius: 12,
    backgroundColor: "#0E324B",
  },
});
