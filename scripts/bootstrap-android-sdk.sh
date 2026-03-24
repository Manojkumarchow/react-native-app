#!/usr/bin/env bash
# One-time: create ~/Library/Android/sdk and install packages required by this React Native / Expo app.
# Requires: JDK 17+ on PATH, and Homebrew's sdkmanager:
#   brew install --cask android-commandlinetools
set -euo pipefail

SDK_ROOT="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_HOME="$SDK_ROOT"

if ! command -v sdkmanager >/dev/null 2>&1; then
  echo "sdkmanager not found. Install with:"
  echo "  brew install --cask android-commandlinetools"
  echo "Then ensure /opt/homebrew/bin is on your PATH and re-run this script."
  exit 1
fi

echo "Using SDK root: $SDK_ROOT"
mkdir -p "$SDK_ROOT"

echo "Accepting licenses (may prompt once)..."
yes | sdkmanager --sdk_root="$SDK_ROOT" --licenses >/dev/null 2>&1 || true

echo "Installing platform-tools, Android 36, build-tools 36.0.0, NDK 27.1.12297006..."
sdkmanager --sdk_root="$SDK_ROOT" --install \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "ndk;27.1.12297006"

echo ""
echo "Done. Set in android/local.properties:"
echo "  sdk.dir=$SDK_ROOT"
echo "(Use forward slashes, no quotes.)"
echo ""
echo "Then: cd android && ./gradlew assembleRelease"
