# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Android release build on your machine (no Android Studio app)

`./gradlew assembleRelease` needs the **Android SDK** on disk. You **cannot** skip that for a native build, but you **do not** need the Android Studio IDE—only command-line tools + SDK packages.

- **Full guide:** [docs/ANDROID_SDK_WITHOUT_STUDIO.md](./docs/ANDROID_SDK_WITHOUT_STUDIO.md)
- **If Gradle says `sdk.dir` “Directory does not exist”:** the path is only configured—the SDK was never downloaded. Run once: `npm run android:bootstrap-sdk` (needs `brew install --cask android-commandlinetools` and JDK 17).
- **Otherwise:** set `ANDROID_HOME` and `sdk.dir` in `android/local.properties` to the **same folder that exists on disk**.

Then: `npm run android:assemble-release` or `cd android && ./gradlew assembleRelease`.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
