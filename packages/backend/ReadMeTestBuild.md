To deploy a test build for your React Native app using Expo, you can leverage Expo Application Services (EAS) to create a development or preview build that you can share with testers or run on your own devices. Since you’re using Expo with your expense tracker app (built with React Native, TypeScript, and Auth0), I’ll guide you through the process step-by-step, tailored to your project. This assumes you’ve already set up your project with expo as a local dependency (per our previous update) and are ready to test on real devices or simulators.
Step 1: Install EAS CLI
EAS (Expo Application Services) replaces the deprecated expo build commands and is the modern way to create builds.
Install EAS CLI:
bash

cd expense-tracker-mobile
pnpm add -g eas-cli

Log in to Expo:
bash

eas login

Enter your Expo account credentials (sign up at expo.dev if you don’t have one).

Step 2: Configure Your Project for EAS
Update app.json:
Ensure your app.json has the necessary fields for EAS builds. Here’s an example based on your app:
json

{
  "expo": {
    "name": "Expense Tracker",
    "slug": "expense-tracker-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "yourapp",
    "extra": {
      "AUTH0_DOMAIN": "your-auth0-domain.auth0.com",
      "AUTH0_CLIENT_ID": "your-client-id",
      "AUTH0_AUDIENCE": "https://expense-tracker-api"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.expensetracker"
    },
    "android": {
      "package": "com.yourcompany.expensetracker"
    }
  }
}

Replace com.yourcompany.expensetracker with a unique identifier.

Create eas.json:
Add an eas.json file in the root of expense-tracker-mobile to define build profiles:
json

{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}

Development: For testing with the Expo Development Client (custom version of Expo Go).

Preview: For sharing with testers (standalone app).

Production: For final app store submission (not used here).

Step 3: Create a Development Build
A development build lets you test your app with the Expo Development Client, which supports native debugging and updates via your local dev server.
Install expo-dev-client:
bash

pnpm add expo-dev-client

Build for Development:
Android:
bash

eas build --profile development --platform android

This generates an APK you can install on an Android device or emulator.

iOS (requires macOS and Xcode):
bash

eas build --profile development --platform ios

This generates a simulator build or a .ipa for a real device (Apple Developer account needed for the latter).

Install the Build:
After the build completes, EAS provides a URL to download the APK (Android) or a QR code/URL for iOS.

For Android: Transfer the .apk to your device via USB or download it directly and install it (enable "Install from Unknown Sources" if needed).

For iOS: Use the Expo Development Client app (download from the App Store) to scan the QR code, or drag the .ipa into a simulator on macOS.

Run the Dev Server:
bash

pnpm start

Open the Expo Development Client on your device, scan the QR code, and your app will load with live updates from your local server.

Step 4: Create a Preview Build for Testers
A preview build is a standalone app you can share with testers without needing the dev server running.
Build for Preview:
Android:
bash

eas build --profile preview --platform android

iOS (requires an Apple Developer account for real devices):
bash

eas build --profile preview --platform ios

Share the Build:
Android: Download the .apk from the EAS dashboard (expo.dev) and share it via email, Google Drive, etc. Testers install it manually.

iOS: Upload the .ipa to TestFlight via App Store Connect:
Go to appstoreconnect.apple.com.

Create an app with your bundleIdentifier.

Use the Transporter app (macOS) to upload the .ipa.

Invite testers via TestFlight (email or public link).

Step 5: Test the Build
Android:
Install the APK on a physical device or emulator (e.g., Android Studio’s emulator).

Test features like Auth0 login, monthly expenses list, and add/update/delete expenses.

iOS:
Run the simulator build on an iOS simulator (macOS only) with:
bash

npx expo run:ios --device

For real devices, use TestFlight after uploading to App Store Connect.

Step 6: Automate with EAS Updates (Optional)
For quick updates without rebuilding:
Configure Updates:
Add to app.json:
json

"updates": {
  "fallbackToCacheTimeout": 0,
  "url": "https://u.expo.dev/your-project-id"
},
"extra": {
  "eas": {
    "projectId": "your-project-id"
  }
}

Find your-project-id in the EAS dashboard.

Publish Updates:
bash

eas update

Testers with the app installed will receive JS updates over-the-air (OTA).

Prerequisites
Android: No special account needed for APKs; use an emulator or physical device.

iOS: 
Simulator builds require macOS and Xcode.

Real device builds require an Apple Developer account ($99/year).

EAS Account: Free tier works for internal testing, but you may need a paid plan for more builds.

Example Workflow
Build a development APK:
bash

eas build --profile development --platform android

Install it on your Android device.

Start the dev server:
bash

pnpm start

Test locally, then build a preview for testers:
bash

eas build --profile preview --platform android

Share the APK link from expo.dev.

This process lets you deploy test builds efficiently, whether for personal testing or sharing with others. Let me know if you need help with specific steps, like setting up TestFlight or troubleshooting EAS!

