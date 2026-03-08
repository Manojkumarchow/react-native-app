import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

const BRAND_BLUE = "#1c98ed";

const ShapeSetPath =
  "M61.9489 22.7579C63.5001 21.3758 64.2757 20.6848 64.9888 20.1259C75.3031 12.0423 89.6969 12.0423 100.011 20.1259C100.724 20.6848 101.5 21.3758 103.051 22.7579C103.57 23.2206 103.83 23.452 104.091 23.6733C107.743 26.7749 112.1 28.9035 116.768 29.8665C117.101 29.9352 117.441 29.9969 118.122 30.1203C120.154 30.4888 121.17 30.6731 122.046 30.8902C134.707 34.0305 143.681 45.4464 143.882 58.6668C143.896 59.5808 143.847 60.6268 143.749 62.7188C143.716 63.4192 143.699 63.7694 143.691 64.1141C143.578 68.9446 144.654 73.7276 146.822 78.03C146.977 78.337 147.142 78.6453 147.471 79.2619C148.454 81.1035 148.945 82.0243 149.324 82.8539C154.798 94.8535 151.595 109.089 141.531 117.491C140.835 118.072 139.998 118.685 138.325 119.912C137.764 120.322 137.484 120.528 137.214 120.736C133.42 123.658 130.405 127.494 128.441 131.896C128.3 132.21 128.165 132.533 127.895 133.178C127.089 135.106 126.686 136.07 126.282 136.887C120.447 148.71 107.479 155.046 94.7282 152.302C93.8467 152.113 92.8523 151.831 90.8637 151.269C90.1978 151.081 89.8649 150.986 89.5354 150.902C84.9181 149.715 80.0819 149.715 75.4646 150.902C75.1351 150.986 74.8022 151.081 74.1364 151.269C72.1477 151.831 71.1534 152.113 70.2719 152.302C57.5215 155.046 44.5531 148.71 38.7177 136.887C38.3142 136.07 37.911 135.106 37.1046 133.178C36.8346 132.533 36.6996 132.21 36.5594 131.896C34.5953 127.494 31.58 123.658 27.7864 120.736C27.5157 120.528 27.2356 120.322 26.6753 119.912C25.0019 118.685 24.1652 118.072 23.4694 117.491C13.4054 109.089 10.2025 94.8535 15.6762 82.8539C16.0546 82.0243 16.5461 81.1035 17.5292 79.2619C17.8584 78.6453 18.0229 78.337 18.1776 78.03C20.3457 73.7276 21.4219 68.9446 21.3087 64.1141C21.3006 63.7694 21.2842 63.4192 21.2514 62.7188C21.1534 60.6268 21.1043 59.5808 21.1182 58.6668C21.319 45.4464 30.2933 34.0305 42.9544 30.8902C43.8297 30.6731 44.8459 30.4888 46.8782 30.1203C47.5586 29.9969 47.8988 29.9352 48.2319 29.8665C52.8996 28.9035 57.2569 26.7749 60.9093 23.6733C61.1699 23.452 61.4296 23.2206 61.9489 22.7579Z";

export default function LoginSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <View style={styles.shapeContainer}>
            <Svg
              width={165}
              height={167}
              viewBox="0 0 165 167"
              style={styles.shapeSvg}
            >
              <Path d={ShapeSetPath} fill={BRAND_BLUE} />
            </Svg>
            <View style={styles.tickOverlay}>
              <Feather name="check" size={56} color="#FAFAFA" strokeWidth={4} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>Verification Successful</Text>
        <Text style={styles.subtitle}>
          You're all set. Redirecting you to your home.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  shapeContainer: {
    width: 165,
    height: 167,
    alignItems: "center",
    justifyContent: "center",
  },
  shapeSvg: {
    position: "absolute",
  },
  tickOverlay: {
    position: "absolute",
    left: 42,
    top: 43,
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: BRAND_BLUE,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
});
