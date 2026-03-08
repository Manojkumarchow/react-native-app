import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { updatePin } from "./services/profile.service";

const BRAND_BLUE = "#1c98ed";
const CARD_BG = "#ffffff";
const SEGMENT_BG = "#f4f4f5";
const BORDER_COLOR = "#a1a1aa";
const ERROR_BORDER = "#c81616";
const DISABLED_BG = "#d9d9d9";
const DISABLED_TEXT = "#a1a1aa";
const MUTED_TEXT = "#777";

export default function ResetPinScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const resolvedPhone = Array.isArray(phone) ? phone[0] : phone ?? "";

  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMismatchError, setHasMismatchError] = useState(false);
  const [errorText, setErrorText] = useState("");

  const pinRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];
  const confirmRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const pinValue = pin.join("");
  const confirmPinValue = confirmPin.join("");
  const isComplete = pinValue.length === 4 && confirmPinValue.length === 4;

  const handlePinChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.RefObject<TextInput>[]
  ) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    setter((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setHasMismatchError(false);
    setErrorText("");

    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    key: string,
    currentValues: string[],
    refs: React.RefObject<TextInput>[]
  ) => {
    if (key === "Backspace" && !currentValues[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleResetPin = async () => {
    if (!isComplete || loading) return;
    if (pinValue !== confirmPinValue) {
      setHasMismatchError(true);
      setErrorText("PINs do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setHasMismatchError(false);
      setErrorText("");

      await updatePin(resolvedPhone, pinValue);
      router.replace("/reset-pin-success");
    } catch {
      Toast.show({
        type: "error",
        text1: "PIN reset failed",
        text2: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "Reset PIN" }} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.bg}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View style={styles.header}>
              <Image
                source={require("./../assets/images/nestiti-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.card}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity style={[styles.segment, styles.segmentActive]}>
                  <Text style={[styles.segmentText, styles.segmentTextActive]}>
                    RESET PIN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.segment} disabled>
                  <Text style={styles.segmentText}>CONFIRM</Text>
                </TouchableOpacity>
              </View>

              {hasMismatchError ? (
                <Text style={styles.errorTitle}>
                  PIN <Text style={styles.errorHighlight}>Incorrect match</Text>!
                </Text>
              ) : (
                <Text style={styles.cardTitle}>Create and confirm new PIN</Text>
              )}
              <Text style={styles.subtitle}>{resolvedPhone}</Text>

              <Text style={styles.pinLabel}>Create New PIN</Text>
              <View style={styles.pinRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={`new-${i}`}
                    ref={pinRefs[i]}
                    style={[styles.pinBox, hasMismatchError && styles.pinBoxError]}
                    value={pin[i]}
                    secureTextEntry={!showPin}
                    onChangeText={(v) => handlePinChange(i, v, setPin, pinRefs)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(i, nativeEvent.key, pin, pinRefs)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <Text style={styles.pinLabel}>Confirm New PIN</Text>
              <View style={styles.pinRow}>
                {[0, 1, 2, 3].map((i) => (
                  <TextInput
                    key={`confirm-${i}`}
                    ref={confirmRefs[i]}
                    style={[styles.pinBox, hasMismatchError && styles.pinBoxError]}
                    value={confirmPin[i]}
                    secureTextEntry={!showPin}
                    onChangeText={(v) =>
                      handlePinChange(i, v, setConfirmPin, confirmRefs)
                    }
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(i, nativeEvent.key, confirmPin, confirmRefs)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!isComplete || loading) && styles.nextButtonDisabled,
                ]}
                onPress={handleResetPin}
                disabled={!isComplete || loading}
              >
                {loading ? (
                  <ActivityIndicator color={DISABLED_TEXT} />
                ) : (
                  <Text
                    style={[
                      styles.nextButtonText,
                      (!isComplete || loading) && styles.nextButtonTextDisabled,
                    ]}
                  >
                    Reset PIN
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 22,
    paddingBottom: 12,
  },
  logo: {
    width: 235,
    height: 235,
  },
  card: {
    marginTop: 4,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 88,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: SEGMENT_BG,
    borderRadius: 9,
    padding: 2,
    marginBottom: 20,
    height: 38,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentText: {
    fontSize: 13,
    color: DISABLED_TEXT,
    fontWeight: "400",
  },
  segmentTextActive: {
    color: BRAND_BLUE,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    marginBottom: 20,
  },
  errorHighlight: {
    color: ERROR_BORDER,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
    fontSize: 12,
  },
  pinLabel: {
    fontSize: 12,
    color: "#444",
    marginBottom: 8,
    fontWeight: "500",
  },
  pinRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pinBox: {
    width: 52,
    height: 44,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
  pinBoxError: {
    borderColor: ERROR_BORDER,
  },
  errorText: {
    color: ERROR_BORDER,
    marginBottom: 10,
    fontSize: 13,
  },
  nextButton: {
    backgroundColor: BRAND_BLUE,
    height: 48,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: DISABLED_BG,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  nextButtonTextDisabled: {
    color: DISABLED_TEXT,
  },
});
