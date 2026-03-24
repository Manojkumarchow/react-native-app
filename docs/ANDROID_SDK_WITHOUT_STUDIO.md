# Android builds without Android Studio (macOS)

## “Directory does not exist” / `sdk.dir` in `local.properties`

Gradle reads `android/local.properties` → `sdk.dir=...`. If that folder **is not on disk**, you get:

`Problem: Directory does not exist` → `SDK location not found`.

Having `ANDROID_HOME` in `~/.zshrc` does **not** create the folder. You must **install packages** into that directory once (see below), or run:

```bash
chmod +x scripts/bootstrap-android-sdk.sh
./scripts/bootstrap-android-sdk.sh
```

(requires Homebrew `android-commandlinetools` so `sdkmanager` exists).

---

Gradle **must** find an Android SDK. The error:

`SDK location not found … ANDROID_HOME … or android/local.properties`

means the SDK is missing or not pointed to. You **do not** need the Android Studio IDE—only the **SDK + command-line tools** (and JDK 17).

## 1. Install JDK 17

```bash
brew install openjdk@17
```

Add to `~/.zshrc` (paths may vary on Intel vs Apple Silicon):

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

## 2. Install SDK command-line tools only

**Option A — Homebrew (no Studio app)**

```bash
brew install --cask android-commandlinetools
```

Then set a single SDK root (pick one folder and keep it):

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
mkdir -p "$ANDROID_HOME/cmdline-tools"
```

If Homebrew put tools elsewhere, copy or link them so you have:

`$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager`

Official layout: [Command-line tools only](https://developer.android.com/studio#command-line-tools-only) — unzip the “commandlinetools” zip into `cmdline-tools/latest/`.

**Option B — Manual download**

1. Download **Command line tools only** for Mac from the link above.
2. Unzip so that `sdkmanager` is at:  
   `~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager`

## 3. Set `ANDROID_HOME` and PATH

Add to `~/.zshrc`:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
```

Reload: `source ~/.zshrc`

## 4. Install packages this project needs

React Native **0.81** in this repo targets **compileSdk 36**, **build-tools 36.0.0**, and **NDK 27.1.12297006** (from `node_modules/react-native/gradle/libs.versions.toml`).

```bash
yes | sdkmanager --licenses
sdkmanager --install \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "ndk;27.1.12297006"
```

## 5. Point Gradle at the SDK (if `ANDROID_HOME` is not picked up)

Create **`android/local.properties`** (already gitignored):

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

Use your real path; on Windows use escaped backslashes (`C\:\\Users\\...`).

## 6. Build again

From the app root:

```bash
cd android && ./gradlew assembleRelease
# or
npm run android:assemble-release
```

---

### If you truly cannot install any SDK

Then you cannot run `./gradlew` locally. Use a machine or CI that has the SDK, or a remote/cloud build service—there is no way to produce a Play-ready APK/AAB without those native build tools.
