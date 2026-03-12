import React, { useMemo, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";

const smartLocksBanner =
  "https://www.figma.com/api/mcp/asset/e1528a11-a6aa-4077-9988-03231743226e";

const quickActions = [
  {
    key: "residents",
    label: "Residents",
    icon: "account-group-outline",
    route: "/residents",
    role: ["ADMIN"],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "clipboard-text-outline",
    route: "/maintenance",
    role: ["USER", "ADMIN"],
  },
  {
    key: "post-notice",
    label: "Post Notice",
    icon: "bullhorn-outline",
    route: "/create-notice",
    role: ["ADMIN"],
  },
  {
    key: "cctv",
    label: "CCTV",
    icon: "cctv",
    route: "/cctv",
    role: ["USER", "ADMIN"],
  },
  {
    key: "ledger",
    label: "Ledger",
    icon: "book-outline",
    route: "/ledger",
    role: ["USER", "ADMIN"],
  },
];

const homeServices = [
  { key: "plumber", label: "Plumber", icon: "tools", serviceKey: "plumber" },
  { key: "electrician", label: "Electrician", icon: "flash", serviceKey: "electrician" },
  { key: "carpenter", label: "Carpenter", icon: "hammer", serviceKey: "carpenter" },
  { key: "cleaner", label: "Cleaner", icon: "broom", serviceKey: "cleaner" },
  { key: "painter", label: "Painter", icon: "roller", serviceKey: "painter" },
  { key: "beautician", label: "Beautician", icon: "face-woman", serviceKey: "beautician" },
];

const tenantUpdates = [
  {
    id: "n1",
    type: "Notice",
    title: "Water Supply Maintenance",
    time: "2 hours ago",
    body: "Regular cleaning of overhead tanks scheduled for tomorrow between 10 AM to 2 PM.",
  },
  {
    id: "a1",
    type: "Announcements",
    title: "Treasurer for the community is Mr. Govindh Ayyar",
    time: "Aug 15, 09:00 AM",
    body: "Flag hoisting followed by cultural activities at the main clubhouse lawn.",
  },
  {
    id: "e1",
    type: "Events",
    title: "Independence Day Celebration",
    time: "2 hours ago",
    body: "Regular cleaning of overhead tanks scheduled for tomorrow between 10 AM to 2 PM.",
  },
];

export default function Home() {
  const router = useRouter();
  const { name, avatarUri, buildingName, role, flatNo } = useProfileStore();
  const watchmanPhone = useBuildingStore((state) => state.watchmen?.phone);
  const [showWatchmanSheet, setShowWatchmanSheet] = useState(false);

  const filteredActions = useMemo(
    () =>
      quickActions.filter(
        (item) => !item.role || (role ? item.role.includes(role) : false)
      ),
    [role]
  );

  const initials = useMemo(() => {
    if (!name) return "VP";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [name]);

  const callNumber = watchmanPhone || "+91 98000 12345";
  const callHref = `tel:${callNumber.replace(/\s+/g, "")}`;

  if (role === "USER") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.tenantHeaderCard}>
            <View style={styles.tenantHeaderTopRow}>
              <View>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.tenantUserName}>{name || "Govardhan Reddy"}</Text>
              </View>

              <View style={styles.headerIcons}>
                <Pressable style={styles.iconBtn} onPress={() => setShowWatchmanSheet(true)}>
                  <Feather name="phone" size={20} color="#71717A" />
                </Pressable>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => router.push("/notifications")}
                >
                  <Ionicons name="notifications-outline" size={20} color="#71717A" />
                  <View style={styles.notificationDot} />
                </Pressable>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#94A3B8" />
              <Text style={styles.locationText}>
                {buildingName || "Sunrise Residency"} · Tenant
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.tenantContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tenantStatsRow}>
              <Pressable style={styles.duesCard} onPress={() => router.push("/payments")}>
                <Text style={styles.duesLabel}>Dues</Text>
                <Text style={styles.duesAmount}>₹1,800</Text>
                <Text style={styles.duesFootnote}>Overdue by 5 days</Text>
              </Pressable>

              <Pressable
                style={styles.issuesCard}
                onPress={() =>
                  router.push({ pathname: "/all-tickets", params: { status: "OPEN" } } as never)
                }
              >
                <Text style={styles.issuesLabel}>Notices</Text>
                <Text style={styles.issuesAmount}>01</Text>
                <Text style={styles.issuesFootnote}>New announcement</Text>
              </Pressable>
            </View>

            <Text style={styles.tenantSectionTitle}>Quick Actions</Text>
            <View style={styles.tenantActionGrid}>
              <Pressable style={styles.tenantActionCard} onPress={() => router.push("/issues")}>
                <View style={[styles.tenantActionIcon, { backgroundColor: "#FEF2F2" }]}>
                  <MaterialCommunityIcons name="alert-outline" size={22} color="#F87171" />
                </View>
                <Text style={styles.tenantActionText}>Raise Issue</Text>
              </Pressable>

              <Pressable style={styles.tenantActionCard} onPress={() => router.push("/ledger")}>
                <View style={[styles.tenantActionIcon, { backgroundColor: "#FEF3C7" }]}>
                  <MaterialCommunityIcons
                    name="book-outline"
                    size={20}
                    color="#D97706"
                  />
                </View>
                <Text style={styles.tenantActionText}>Apartment Ledger</Text>
              </Pressable>

              <Pressable style={styles.tenantActionCard} onPress={() => router.push("/residents")}>
                <View style={[styles.tenantActionIcon, { backgroundColor: "#E6F0FF" }]}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={20}
                    color="#3B82F6"
                  />
                </View>
                <Text style={styles.tenantActionText}>Residents</Text>
              </Pressable>

              <Pressable style={styles.tenantActionCard} onPress={() => router.push("/cctv")}>
                <View style={[styles.tenantActionIcon, { backgroundColor: "#DCFCE7" }]}>
                  <MaterialCommunityIcons name="cctv" size={20} color="#10B981" />
                </View>
                <Text style={styles.tenantActionText}>CCTV</Text>
              </Pressable>
            </View>

            <View style={styles.sectionRow}>
              <Text style={styles.tenantSectionTitle}>Home Services</Text>
              <Pressable onPress={() => router.push("/my-bookings" as never)}>
                <Text style={styles.linkText}>My Bookings</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesRow}
            >
              {homeServices.map((item) => (
                <Pressable
                  key={item.key}
                  style={styles.serviceChip}
                  onPress={() =>
                    router.push({ pathname: "/home-services", params: { service: item.serviceKey } } as never)
                  }
                >
                  <MaterialCommunityIcons name={item.icon as any} size={16} color="#1C98ED" />
                  <Text style={styles.serviceLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable style={styles.bannerCard} onPress={() => router.push("/home-services" as never)}>
              <Image source={{ uri: smartLocksBanner }} style={styles.bannerImage} />
            </Pressable>

            <View style={[styles.sectionRow, { marginTop: 4 }]}>
              <Text style={styles.tenantSectionTitle}>Community Updates</Text>
              <Pressable onPress={() => router.push("/announcements" as never)}>
                <MaterialIcons name="keyboard-arrow-right" size={22} color="#111827" />
              </Pressable>
            </View>

            {tenantUpdates.map((item) => {
              const isAnnouncement = item.type === "Announcements";
              const isEvent = item.type === "Events";
              const accentColor = isAnnouncement
                ? "#A16207"
                : isEvent
                  ? "#1C98ED"
                  : "#C81616";
              const pillStyle = isAnnouncement
                ? styles.noticeBadgeWarning
                : isEvent
                  ? styles.noticeBadgeBlue
                  : styles.noticeBadgeRed;
              return (
                <Pressable
                  key={item.id}
                  style={styles.noticeCard}
                  onPress={() => router.push("/announcements" as never)}
                >
                  <View style={[styles.noticeAccent, { backgroundColor: accentColor }]} />
                  <View style={styles.noticeContent}>
                    <View style={styles.noticeHeader}>
                      <Text style={[styles.noticeBadge, pillStyle]}>{item.type}</Text>
                      <Text style={styles.noticeTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.noticeTitle}>{item.title}</Text>
                    <Text style={styles.noticeDescription}>{item.body}</Text>
                    {isAnnouncement ? (
                      <View style={styles.announcementMetaRow}>
                        <View style={styles.announcementMetaChip}>
                          <Text style={styles.announcementMetaText}>Clubhouse</Text>
                        </View>
                        <View style={styles.announcementMetaChip}>
                          <Text style={styles.announcementMetaText}>+14 Participating</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.bottomNav}>
            <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
              <Ionicons name="home-outline" size={20} color="#1C98ED" />
              <Text style={styles.navLabelActive}>Home</Text>
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => router.push("/payments")}>
              <Ionicons name="card-outline" size={20} color="#A1A1AA" />
              <Text style={styles.navLabel}>Payments</Text>
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => router.push("/announcements" as never)}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#777" />
              <Text style={styles.navLabelMuted}>Community</Text>
            </Pressable>
            <Pressable style={styles.navItem} onPress={() => router.push("/profile")}>
              <Ionicons name="person-outline" size={20} color="#777" />
              <Text style={styles.navLabelMuted}>Profile</Text>
            </Pressable>
          </View>

          <Modal
            transparent
            visible={showWatchmanSheet}
            animationType="slide"
            onRequestClose={() => setShowWatchmanSheet(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowWatchmanSheet(false)}>
              <View style={styles.sheetBackdrop}>
                <TouchableWithoutFeedback>
                  <View style={styles.watchmanSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.watchmanAvatar}>
                      <Text style={styles.watchmanAvatarText}>👮</Text>
                    </View>
                    <Text style={styles.watchmanTitle}>Call Watchman</Text>
                    <Text style={styles.watchmanSubtitle}>Sunrise Residency Security</Text>
                    <Text style={styles.watchmanPhone}>{callNumber}</Text>

                    <Pressable
                      style={styles.watchmanCallButton}
                      onPress={async () => {
                        const supported = await Linking.canOpenURL(callHref);
                        if (supported) {
                          await Linking.openURL(callHref);
                        }
                        setShowWatchmanSheet(false);
                      }}
                    >
                      <Text style={styles.watchmanCallButtonText}>Call Now</Text>
                    </Pressable>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.userBlock}>
              <View style={styles.avatarWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                )}
              </View>
              <View>
                <Text style={styles.greeting}>Good morning,</Text>
                <Text style={styles.userName}>{name || "Vara Prasad"}</Text>
              </View>
            </View>

            <View style={styles.headerIcons}>
              <Pressable style={styles.iconBtn} onPress={() => setShowWatchmanSheet(true)}>
                <Feather name="phone" size={20} color="#71717A" />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications-outline" size={20} color="#71717A" />
                <View style={styles.notificationDot} />
              </Pressable>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#94A3B8" />
            <Text style={styles.locationText}>
              {buildingName || "Kondapur, Hyderabad"} {flatNo ? `· ${flatNo}` : ""}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Ionicons name="business-outline" size={14} color="#2899CF" />}
              iconBg="#E6F4FA"
              value="10"
              label="Total Flats"
            />
            <StatCard
              icon={<Ionicons name="people-outline" size={14} color="#16A34A" />}
              iconBg="#DCFCE7"
              value="28"
              label="Total Residents"
            />
            <StatCard
              icon={<Ionicons name="wallet-outline" size={14} color="#D97706" />}
              iconBg="#FEF3C7"
              value="28000"
              label="Apartment Dues"
            />
            <StatCard
              icon={
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color="#C81616"
                />
              }
              iconBg="rgba(220,38,38,0.12)"
              value="03"
              label="Open Issues"
              onPress={() =>
                router.push({ pathname: "/all-tickets", params: { status: "OPEN" } } as never)
              }
            />
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {filteredActions.map((item) => (
              <Pressable
                key={item.key}
                style={styles.quickActionItem}
                onPress={() => router.push(item.route as never)}
              >
                <View style={styles.quickActionIconWrap}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color="#1C98ED"
                  />
                </View>
                <Text style={styles.quickActionLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.bannerCard}
            onPress={() => router.push("/home-services" as never)}
          >
            <Image source={{ uri: smartLocksBanner }} style={styles.bannerImage} />
          </Pressable>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Home Services</Text>
            <Pressable onPress={() => router.push("/my-bookings" as never)}>
              <Text style={styles.linkText}>My Bookings</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesRow}
          >
            {homeServices.map((item) => (
              <Pressable
                key={item.key}
                style={styles.serviceChip}
                onPress={() =>
                  router.push({ pathname: "/home-services", params: { service: item.serviceKey } } as never)
                }
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={16}
                  color="#1C98ED"
                />
                <Text style={styles.serviceLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.sectionRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <Pressable onPress={() => router.push("/announcements" as never)}>
              <MaterialIcons name="keyboard-arrow-right" size={22} color="#111827" />
            </Pressable>
          </View>

          <Pressable style={styles.noticeCard} onPress={() => router.push("/notices")}>
            <View style={[styles.noticeAccent, { backgroundColor: "#C81616" }]} />
            <View style={styles.noticeContent}>
              <View style={styles.noticeHeader}>
                <Text style={[styles.noticeBadge, styles.noticeBadgeRed]}>Notice</Text>
                <Text style={styles.noticeTime}>2 hours ago</Text>
              </View>
              <Text style={styles.noticeTitle}>Water Supply Maintenance</Text>
              <Text style={styles.noticeDescription}>
                Regular cleaning of overhead tanks scheduled for tomorrow between 10
                AM to 2 PM.
              </Text>
            </View>
          </Pressable>

          <Pressable style={styles.noticeCard} onPress={() => router.push("/events")}>
            <View style={[styles.noticeAccent, { backgroundColor: "#1C98ED" }]} />
            <View style={styles.noticeContent}>
              <View style={styles.noticeHeader}>
                <Text style={[styles.noticeBadge, styles.noticeBadgeBlue]}>Events</Text>
                <Text style={styles.noticeTime}>2 hours ago</Text>
              </View>
              <Text style={styles.noticeTitle}>Independence Day Celebration</Text>
              <Text style={styles.noticeDescription}>
                Regular cleaning of overhead tanks scheduled for tomorrow between 10
                AM to 2 PM.
              </Text>
            </View>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
            <Ionicons name="home-outline" size={20} color="#1C98ED" />
            <Text style={styles.navLabelActive}>Home</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/payments")}>
            <Ionicons name="card-outline" size={20} color="#A1A1AA" />
            <Text style={styles.navLabel}>Payments</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/announcements" as never)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#777" />
            <Text style={styles.navLabelMuted}>Community</Text>
          </Pressable>
          <Pressable style={styles.navItem} onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={20} color="#777" />
            <Text style={styles.navLabelMuted}>Profile</Text>
          </Pressable>
        </View>

        <Modal
          transparent
          visible={showWatchmanSheet}
          animationType="slide"
          onRequestClose={() => setShowWatchmanSheet(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowWatchmanSheet(false)}>
            <View style={styles.sheetBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.watchmanSheet}>
                  <View style={styles.sheetHandle} />
                  <View style={styles.watchmanAvatar}>
                    <Text style={styles.watchmanAvatarText}>👮</Text>
                  </View>
                  <Text style={styles.watchmanTitle}>Call Watchman</Text>
                  <Text style={styles.watchmanSubtitle}>Sunrise Residency Security</Text>
                  <Text style={styles.watchmanPhone}>{callNumber}</Text>

                  <Pressable
                    style={styles.watchmanCallButton}
                    onPress={async () => {
                      const supported = await Linking.canOpenURL(callHref);
                      if (supported) {
                        await Linking.openURL(callHref);
                      }
                      setShowWatchmanSheet(false);
                    }}
                  >
                    <Text style={styles.watchmanCallButtonText}>Call Now</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAFAFA" },
  tenantHeaderCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tenantHeaderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tenantUserName: {
    fontSize: 24,
    color: "#475569",
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2799CE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  greeting: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  notificationDot: {
    position: "absolute",
    right: 2,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#EF4444",
  },
  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
  },
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  tenantContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  tenantStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  duesCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: "#A16207",
    backgroundColor: "rgba(234,179,8,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  duesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A16207",
  },
  duesAmount: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: "700",
    color: "#A16207",
  },
  duesFootnote: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "500",
    color: "#A16207",
  },
  issuesCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: "#1C98ED",
    backgroundColor: "rgba(222,244,255,0.34)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  issuesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C98ED",
  },
  issuesAmount: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: "700",
    color: "#1C98ED",
  },
  issuesFootnote: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "500",
    color: "#137FEC",
  },
  tenantSectionTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
  },
  tenantActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 12,
    marginBottom: 14,
  },
  tenantActionCard: {
    width: "48%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  tenantActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tenantActionText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 18,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconWrap: {
    width: 30,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#181818",
    marginBottom: 10,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    columnGap: 12,
    marginBottom: 18,
  },
  quickActionItem: {
    width: "31%",
    alignItems: "center",
  },
  quickActionIconWrap: {
    width: "100%",
    aspectRatio: 1.16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
  bannerCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
  },
  bannerImage: {
    width: "100%",
    height: 118,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: "#1C98ED",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  servicesRow: {
    gap: 10,
    paddingBottom: 10,
  },
  serviceChip: {
    width: 96,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  serviceLabel: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  noticeCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
  },
  noticeAccent: {
    width: 6,
  },
  noticeContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  noticeBadge: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noticeBadgeRed: {
    backgroundColor: "rgba(220,38,38,0.12)",
    color: "#DC2626",
  },
  noticeBadgeBlue: {
    backgroundColor: "rgba(40,153,207,0.1)",
    color: "#2899CF",
  },
  noticeBadgeWarning: {
    backgroundColor: "rgba(255,232,131,0.33)",
    color: "#A16207",
  },
  noticeTime: {
    fontSize: 10,
    color: "#94A3B8",
  },
  noticeTitle: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    marginBottom: 4,
  },
  noticeDescription: {
    fontSize: 10,
    color: "#64748B",
    lineHeight: 15,
  },
  announcementMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  announcementMetaChip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  announcementMetaText: {
    fontSize: 10,
    color: "#0F172A",
    fontWeight: "500",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  watchmanSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  sheetHandle: {
    width: 58,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D4D4D8",
    alignSelf: "center",
    marginBottom: 18,
  },
  watchmanAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCEAF4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
  watchmanAvatarText: {
    fontSize: 36,
  },
  watchmanTitle: {
    fontSize: 34,
    color: "#181818",
    fontWeight: "600",
    textAlign: "center",
  },
  watchmanSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  watchmanPhone: {
    marginTop: 10,
    marginBottom: 16,
    fontSize: 18,
    color: "#1C98ED",
    fontWeight: "700",
    textAlign: "center",
  },
  watchmanCallButton: {
    backgroundColor: "#2899CF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  watchmanCallButtonText: {
    color: "#FAFAFA",
    fontSize: 22,
    fontWeight: "500",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
    backgroundColor: "#FBFDFF",
    borderTopWidth: 1,
    borderTopColor: "#E6E6E6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 72,
  },
  navLabelActive: {
    fontSize: 12,
    color: "#1C98ED",
    fontWeight: "500",
  },
  navLabel: {
    fontSize: 14,
    color: "#A1A1AA",
    fontWeight: "500",
  },
  navLabelMuted: {
    fontSize: 12,
    color: "#777",
  },
});
