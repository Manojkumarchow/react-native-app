import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import useProfileStore from "./store/profileStore";
import useBuildingStore from "./store/buildingStore";
import { BASE_URL } from "./config";
import { getErrorMessage } from "./services/error";
import { rms, rs, rvs } from "@/constants/responsive";

const displayAd = require("../assets/images/heliq.jpeg");

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

type HomeServiceCategory = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap | string;
};

type CommunityItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt?: string;
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, avatarUri, buildingName, role, flatNo, phone, userId, buildingId } = useProfileStore();
  const { watchmen, buildingName: storeBuildingName, setBuildingData } = useBuildingStore();
  const watchmanPhone = watchmen?.phone;
  const isServicePerson = (role ?? "").toUpperCase() === "SERVICE_PERSON";
  const [showWatchmanSheet, setShowWatchmanSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<HomeServiceCategory[]>([]);
  const [communityItems, setCommunityItems] = useState<CommunityItem[]>([]);
  const [tenantDueAmount, setTenantDueAmount] = useState(0);
  const [tenantDueNote, setTenantDueNote] = useState("No due this month");
  const [tenantNoticesCount, setTenantNoticesCount] = useState(0);
  const [adminTotalFlats, setAdminTotalFlats] = useState(0);
  const [adminTotalResidents, setAdminTotalResidents] = useState(0);
  const [adminApartmentDues, setAdminApartmentDues] = useState(0);
  const [adminOpenIssues, setAdminOpenIssues] = useState(0);

  const filteredActions = useMemo(
    () =>
      quickActions.filter(
        (item) => !item.role || (role ? item.role.includes(role) : false)
      ),
    [role]
  );

  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [name]);

  const callNumber = watchmanPhone?.trim() ? watchmanPhone.trim() : "Not available";
  const callHref = `tel:${callNumber.replace(/\s+/g, "")}`;
  const watchmanSubtitle = (storeBuildingName || buildingName)
    ? `${storeBuildingName || buildingName} Security`
    : "Security";

  const isTenant = (role ?? "").toUpperCase() === "USER" || (role ?? "").toUpperCase() === "TENANT" || (role ?? "").toUpperCase() === "OWNER";
  const profileId = phone ?? userId ?? "";
  const resolvedBuildingId = buildingId ? String(buildingId) : "";

  const updates = useMemo(() => communityItems.slice(0, 3), [communityItems]);

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const time = new Date(dateStr).getTime();
    if (Number.isNaN(time)) return "Just now";
    const diffMin = Math.floor((Date.now() - time) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    if (isServicePerson) {
      router.replace("/service-person-home");
      return;
    }
    const run = async () => {
      setLoading(true);
      setErrorText(null);
      try {
        const now = new Date();
        const month = now.toLocaleString("en-US", { month: "long" });
        const year = now.getFullYear();
        const requests: Promise<any>[] = [
          axios.get(`${BASE_URL}/service/catalog/all`),
        ];
        if (resolvedBuildingId) {
          requests.push(axios.get(`${BASE_URL}/community/feed/${resolvedBuildingId}`));
        } else {
          requests.push(Promise.resolve({ data: { items: [] } }));
        }
        if (resolvedBuildingId) {
          requests.push(axios.get(`${BASE_URL}/building/${resolvedBuildingId}`));
        } else {
          requests.push(Promise.resolve({ data: null }));
        }
        if (isTenant && profileId) {
          requests.push(
            axios.get(`${BASE_URL}/payments/profile/${profileId}`, { params: { month, year } }),
          );
        } else if (!isTenant && resolvedBuildingId) {
          requests.push(
            axios.get(`${BASE_URL}/payments/apartment`, {
              params: { buildingId: resolvedBuildingId, month, year },
            }),
          );
          requests.push(axios.get(`${BASE_URL}/issues/building/${resolvedBuildingId}`));
        }

        const responses = await Promise.all(requests);
        const servicesRes = responses[0];
        const communityRes = responses[1];
        const buildingRes = responses[2];
        if (buildingRes?.data) {
          setBuildingData(buildingRes.data);
        }

        const catalog = Array.isArray(servicesRes?.data) ? servicesRes.data : [];
        setServiceCategories(
          catalog.map((item: any) => ({
            key: String(item.key ?? item.label ?? Math.random()),
            label: String(item.label ?? "Service"),
            icon: String(item.icon ?? "tools"),
          })),
        );

        const feedItems = Array.isArray(communityRes?.data?.items) ? communityRes.data.items : [];
        const mappedFeed: CommunityItem[] = feedItems.map((item: any) => ({
          id: String(item.id ?? Math.random()),
          type: String(item.type ?? "Notice"),
          title: String(item.title ?? "Update"),
          body: String(item.body ?? ""),
          createdAt: item.createdAt ? String(item.createdAt) : undefined,
        }));
        setCommunityItems(mappedFeed);
        setTenantNoticesCount(mappedFeed.length);

        if (isTenant && profileId) {
          const paymentsRes = responses[2];
          const current = paymentsRes?.data?.maintenanceCurrent;
          const amount = Number(current?.amount ?? 0);
          setTenantDueAmount(amount);
          if (!current) {
            setTenantDueNote("No due this month");
          } else if (String(current.status ?? "").toUpperCase() === "PAID") {
            setTenantDueNote("Paid");
          } else if (current.dueDate) {
            const dueDate = new Date(current.dueDate);
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0) setTenantDueNote(`Overdue by ${daysDiff} day${daysDiff > 1 ? "s" : ""}`);
            else setTenantDueNote(`Due by ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`);
          } else {
            setTenantDueNote("Due this month");
          }
        }

        if (!isTenant && resolvedBuildingId) {
          const buildingRes = responses[2];
          const apartmentRes = responses[3];
          const issuesRes = responses[4];
          setAdminTotalFlats(Number(buildingRes?.data?.totalFlats ?? 0));
          setAdminTotalResidents(Number(buildingRes?.data?.totalResidents ?? 0));
          setAdminApartmentDues(Number(apartmentRes?.data?.pending ?? 0));
          const allIssues = Array.isArray(issuesRes?.data) ? issuesRes.data : [];
          const openCount = allIssues.filter((item: any) => {
            const status = String(item?.status ?? "").toUpperCase();
            return status === "OPEN" || status === "IN_PROGRESS";
          }).length;
          setAdminOpenIssues(openCount);
        }
      } catch (error) {
        setErrorText(getErrorMessage(error, "Failed to load home data."));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isTenant, profileId, resolvedBuildingId]);

  // greetingUtils.js

 const getGreeting =  () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night & Time to sleep";
}

  if (isServicePerson) {
    return null;
  }

  if (isTenant) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.tenantHeaderCard}>
            <View style={styles.tenantHeaderTopRow}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.tenantUserName}>{name || "Resident"}</Text>
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
                {(buildingName || "Building")} · Tenant
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.tenantContentContainer}
            contentInsetAdjustmentBehavior="automatic"
            showsVerticalScrollIndicator={false}
          >
            {loading ? <ActivityIndicator color="#1C98ED" style={{ marginBottom: 12 }} /> : null}
            {errorText ? <Text style={styles.noticeDescription}>{errorText}</Text> : null}
            <View style={styles.tenantStatsRow}>
              <Pressable style={styles.duesCard} onPress={() => router.push("/payments")}>
                <Text style={styles.duesLabel}>Dues</Text>
                <Text style={styles.duesAmount}>₹{tenantDueAmount.toLocaleString("en-IN")}</Text>
                <Text style={styles.duesFootnote}>{tenantDueNote}</Text>
              </Pressable>

              <Pressable
                style={styles.issuesCard}
                onPress={() =>
                  router.push({ pathname: "/announcements", params: { status: "OPEN" } } as never)
                }
              >
                <Text style={styles.issuesLabel}>Notices</Text>
                <Text style={styles.issuesAmount}>{String(tenantNoticesCount).padStart(2, "0")}</Text>
                <Text style={styles.issuesFootnote}>
                  {tenantNoticesCount > 0 ? "Latest community updates" : "No updates"}
                </Text>
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

            <Pressable style={styles.bannerCard}>
              <Image source={displayAd} style={styles.bannerImage} resizeMode="cover" />
            </Pressable>
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
              {serviceCategories.map((item) => (
                <Pressable
                  key={item.key}
                  style={styles.serviceChip}
                  onPress={() =>
                    router.push({ pathname: "/home-services", params: { service: item.key } } as never)
                  }
                >
                  <MaterialCommunityIcons name={item.icon as any} size={16} color="#1C98ED" />
                  <Text style={styles.serviceLabel} numberOfLines={2}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={[styles.sectionRow, { marginTop: 4 }]}>
              <Text style={styles.tenantSectionTitle}>Community Updates</Text>
              <Pressable onPress={() => router.push("/announcements" as never)}>
                <MaterialIcons name="keyboard-arrow-right" size={22} color="#111827" />
              </Pressable>
            </View>

            {updates.map((item) => {
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
                      <Text style={styles.noticeTime}>{timeAgo(item.createdAt)}</Text>
                    </View>
                    <Text style={styles.noticeTitle}>{item.title}</Text>
                    <Text style={styles.noticeDescription}>{item.body}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.bottomNav,
              {
                height: rvs(76) + insets.bottom,
                paddingBottom: Math.max(insets.bottom, rvs(10)),
              },
            ]}
          >
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
                    <Text style={styles.watchmanSubtitle}>{watchmanSubtitle}</Text>
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
                <Text style={styles.userName}>{name || "Resident"}</Text>
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
              {buildingName || "Building"} {flatNo ? `· ${flatNo}` : ""}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {loading ? <ActivityIndicator color="#1C98ED" style={{ marginBottom: 12 }} /> : null}
          {errorText ? <Text style={styles.noticeDescription}>{errorText}</Text> : null}
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Ionicons name="business-outline" size={14} color="#2899CF" />}
              iconBg="#E6F4FA"
              value={String(adminTotalFlats)}
              label="Total Flats"
            />
            <StatCard
              icon={<Ionicons name="people-outline" size={14} color="#16A34A" />}
              iconBg="#DCFCE7"
              value={String(adminTotalResidents)}
              label="Total Residents"
            />
            <StatCard
              icon={<Ionicons name="wallet-outline" size={14} color="#D97706" />}
              iconBg="#FEF3C7"
              value={String(adminApartmentDues)}
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
              value={String(adminOpenIssues).padStart(2, "0")}
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
          <Pressable style={styles.bannerCard}>
            <Image source={displayAd} style={styles.bannerImage} resizeMode="cover" />
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
            {serviceCategories.map((item) => (
              <Pressable
                key={item.key}
                style={styles.serviceChip}
                onPress={() =>
                  router.push({ pathname: "/home-services", params: { service: item.key } } as never)
                }
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={16}
                  color="#1C98ED"
                />
                <Text style={styles.serviceLabel} numberOfLines={2}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.sectionRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <Pressable onPress={() => router.push("/announcements" as never)}>
              <MaterialIcons name="keyboard-arrow-right" size={22} color="#111827" />
            </Pressable>
          </View>

          {updates.map((item) => {
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
              <Pressable key={item.id} style={styles.noticeCard} onPress={() => router.push("/announcements" as never)}>
                <View style={[styles.noticeAccent, { backgroundColor: accentColor }]} />
                <View style={styles.noticeContent}>
                  <View style={styles.noticeHeader}>
                    <Text style={[styles.noticeBadge, pillStyle]}>{item.type}</Text>
                    <Text style={styles.noticeTime}>{timeAgo(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.noticeTitle}>{item.title}</Text>
                  <Text style={styles.noticeDescription}>{item.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.bottomNav,
            {
              height: rvs(76) + insets.bottom,
              paddingBottom: Math.max(insets.bottom, rvs(10)),
            },
          ]}
        >
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
                  <Text style={styles.watchmanSubtitle}>{watchmanSubtitle}</Text>
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
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
    paddingBottom: rvs(16),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
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
    fontSize: rms(24),
    color: "#475569",
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    paddingHorizontal: rs(16),
    paddingTop: rvs(8),
    paddingBottom: rvs(16),
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
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
    gap: rs(12),
  },
  avatarWrap: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
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
    fontSize: rms(14),
    fontWeight: "700",
  },
  greeting: {
    fontSize: rms(12),
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: rms(18),
    color: "#0F172A",
    fontWeight: "700",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
  },
  iconBtn: {
    padding: rs(4),
  },
  notificationDot: {
    position: "absolute",
    right: 2,
    top: 4,
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#EF4444",
  },
  locationRow: {
    marginTop: rvs(8),
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
  },
  locationText: {
    fontSize: rms(14),
    color: "#64748B",
  },
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(110),
  },
  tenantContentContainer: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(120),
  },
  tenantStatsRow: {
    flexDirection: "row",
    gap: rs(12),
    marginBottom: rvs(18),
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
    height: 178,
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
    width: 108,
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
    textAlign: "center",
    lineHeight: 18,
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
