import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { STORAGE_KEYS } from "@/constants/storage";
import { rms, rs, rvs } from "@/constants/responsive";

const splashLogo = require("../assets/images/splash-logo.png");

const onboardingSlides = [
  {
    title: "All Your Apartment Needs at One Place",
    description:
      "Manage bills, maintenance, visitors, and announcements - all from a single app.",
    image: require("../assets/images/onboarding-installation.png"),
  },
  {
    title: "Raise Requests. Track Progress.",
    description:
      "Submit maintenance issues and stay updated until they're resolved.",
    image: require("../assets/images/onboarding-electrician.png"),
  },
  {
    title: "Stay Connected to Your Community",
    description:
      "Get announcements, event updates, and important notices instantly.",
    image: require("../assets/images/onboarding-rental.png"),
  },
];

type SplashStage = "BOOT" | "BRAND" | "ONBOARDING" | "ROLE_SELECT";
type SelectedRole = "ADMIN" | "Owner" | "USER";

export default function SplashScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<SplashStage>("BOOT");
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);

  const dotScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.18,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [dotScale]);

  useEffect(() => {
    let isMounted = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      let onboardingDone = false;
      try {
        onboardingDone =
          (await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE)) === "true";
      } catch {
        onboardingDone = false;
      }
      if (!isMounted) return;

      timers.push(
        setTimeout(() => {
          if (!isMounted) return;
          setStage("BRAND");
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
              toValue: 1,
              duration: 480,
              useNativeDriver: true,
            }),
          ]).start();
        }, 850),
      );

      timers.push(
        setTimeout(() => {
          if (!isMounted) return;
          if (onboardingDone) {
            router.replace("/login");
            return;
          }
          setStage("ONBOARDING");
        }, 2450),
      );
    };

    run();

    return () => {
      isMounted = false;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [logoOpacity, logoScale, router]);

  const activeSlide = useMemo(() => onboardingSlides[slideIndex], [slideIndex]);

  const goToRoleStep = () => setStage("ROLE_SELECT");
  const goToNextSlide = () => {
    if (slideIndex === onboardingSlides.length - 1) {
      setStage("ROLE_SELECT");
      return;
    }
    setSlideIndex((prev) => prev + 1);
  };

  const continueWithRole = async () => {
    if (!selectedRole) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_ROLE, selectedRole);
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
    } catch {
      // Allow onboarding to continue even if storage is unavailable.
    }
    router.replace("/login");
  };

  if (stage === "BOOT") {
    return (
      <SafeAreaView style={styles.bootRoot}>
        <Animated.View
          style={[styles.bootDot, { transform: [{ scale: dotScale }] }]}
        />
      </SafeAreaView>
    );
  }

  if (stage === "BRAND") {
    return (
      <SafeAreaView style={styles.brandRoot}>
        <Animated.View
          style={[
            styles.centerWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image source={splashLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (stage === "ONBOARDING") {
    return (
      <SafeAreaView style={styles.onboardRoot}>
        <View style={styles.onboardImageWrap}>
          <Image
            source={activeSlide.image}
            style={styles.onboardImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.indicatorRow}>
          {onboardingSlides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicatorDot,
                idx === slideIndex && styles.indicatorDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.onboardTitle}>{activeSlide.title}</Text>
        <Text style={styles.onboardDescription}>{activeSlide.description}</Text>

        <View style={styles.actionRow}>
          <Pressable style={styles.skipBtn} onPress={goToRoleStep}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <Pressable style={styles.nextBtn} onPress={goToNextSlide}>
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.roleRoot}>
      <View style={styles.roleHeader}>
        <Text style={styles.roleTitle}>How will you use Nestiti?</Text>
        <Text style={styles.roleSubTitle}>
          This helps us set up the right experience for you.
        </Text>
      </View>

      <View style={styles.roleOptions}>
        <RoleCard
          selected={selectedRole === "ADMIN"}
          title="President / Admin"
          subtitle="I manage an apartment"
          onPress={() => setSelectedRole("ADMIN")}
        />
        <RoleCard
          selected={selectedRole === "Owner"}
          title="Resident - Owner"
          subtitle="I live in an apartment"
          onPress={() => setSelectedRole("Owner")}
        />
        <RoleCard
          selected={selectedRole === "USER"}
          title="Resident - Tenant"
          subtitle="I live in an apartment"
          onPress={() => setSelectedRole("USER")}
        />
      </View>

      <Pressable
        style={[
          styles.continueBtn,
          !selectedRole && styles.continueBtnDisabled,
        ]}
        onPress={continueWithRole}
        disabled={!selectedRole}
      >
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function RoleCard({
  selected,
  title,
  subtitle,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.roleCard,
        selected ? styles.roleCardActive : styles.roleCardInactive,
      ]}
    >
      <MaterialCommunityIcons
        name={selected ? "radiobox-marked" : "radiobox-blank"}
        size={24}
        color={selected ? "#1C98ED" : "#71717A"}
      />
      <View style={styles.roleTextBlock}>
        <Text
          style={[styles.roleCardTitle, selected && styles.roleCardTitleActive]}
        >
          {title}
        </Text>
        <Text style={styles.roleCardSubTitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bootRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bootDot: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    backgroundColor: "#1C98ED",
  },
  brandRoot: {
    flex: 1,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: rs(28),
  },
  logo: {
    width: "76%",
    maxWidth: rs(320),
    aspectRatio: 1,
  },
  tagline: {
    marginTop: rvs(10),
    color: "#FFFFFF",
    fontSize: rms(12),
    letterSpacing: 0.2,
    fontWeight: "500",
  },
  onboardRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(24),
    paddingTop: rvs(44),
    paddingBottom: rvs(36),
  },
  onboardImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: rvs(330),
  },
  onboardImage: {
    width: "100%",
    maxWidth: rs(360),
    height: rvs(300),
  },
  indicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    marginTop: rvs(12),
  },
  indicatorDot: {
    width: rs(12),
    height: rs(12),
    borderRadius: rs(6),
    backgroundColor: "#E4E4E7",
  },
  indicatorDotActive: {
    width: rs(30),
    backgroundColor: "#1C98ED",
  },
  onboardTitle: {
    marginTop: rvs(18),
    textAlign: "center",
    color: "#181818",
    fontSize: rms(20),
    fontWeight: "700",
  },
  onboardDescription: {
    marginTop: rvs(12),
    textAlign: "center",
    color: "#181818",
    fontSize: rms(16),
    lineHeight: rvs(24),
  },
  actionRow: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 48,
    paddingBottom: 8,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    color: "#09090B",
    fontSize: 14,
    fontWeight: "500",
  },
  nextBtn: {
    minWidth: 64,
    borderRadius: 12,
    backgroundColor: "#1C98ED",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  nextText: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "500",
  },
  roleRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 26,
    paddingTop: 110,
    paddingBottom: 30,
  },
  roleHeader: {
    alignItems: "center",
    marginBottom: 22,
  },
  roleTitle: {
    color: "#181818",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  roleSubTitle: {
    color: "#181818",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  roleOptions: {
    gap: 18,
  },
  roleCard: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roleCardActive: {
    borderColor: "#1C98ED",
    backgroundColor: "#EBF9FF",
  },
  roleCardInactive: {
    borderColor: "#A1A1AA",
    backgroundColor: "#FFFFFF",
  },
  roleTextBlock: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#777777",
    marginBottom: 2,
  },
  roleCardTitleActive: {
    color: "#1D84B5",
  },
  roleCardSubTitle: {
    fontSize: 16,
    color: "#777777",
  },
  continueBtn: {
    marginTop: "auto",
    borderRadius: 14,
    backgroundColor: "#1C98ED",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: "#FAFAFA",
    fontSize: 16,
    fontWeight: "600",
  },
});
