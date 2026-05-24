# 💸 PayTrace

An elegant, high-performance React Native / Expo tracking ledger application designed to effortlessly trace outstanding balances, borrow/lend records, and settlements with absolute clarity and offline-first capabilities.

## 🚀 Features

* **Vibrant HSL-Calibrated Colors & Dark Mode Support**: Sleek, eye-catching, and modern design featuring glassmorphic components and fluid animations.
* **Offline-First Resilience**: Full offline operation. Transactions are automatically queued and synchronized atomically to Firebase Firestore using a custom batch synchronization engine.
* **Instant Biometric Authentication**: Optional face/fingerprint lock using `expo-local-authentication` with custom session-inactivity timeouts.
* **Comprehensive Analytics & Statistics**: Fast breakdown of what you owe vs what you are owed, featuring fully cached balances for immediate performance.
* **E2E & Unit Test Coverage**: Over 85 tests running on Jest (`tests/e2e` and Cloud Functions unit tests).

## 🛠️ Local Quickstart

### 1. Installation
Clone the repository, configure the package dependencies, and install:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file at the root of the project using the structure from `.env.example`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=xxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxx
```

### 3. Run the App
Launch the Expo development server:
```bash
npx expo start --clear
```

### 4. Running Tests
Run the client E2E test suites or cloud functions unit tests:
```bash
# E2E Tests
npx jest tests/e2e

# Functions Tests
cd functions && npm test
```

## 🏗️ Architecture

```
src/
├── components/     # Reusable custom UI components (InputField, Button, etc.)
├── design/         # Harmony color palette, HSL tokens, and typography
├── hooks/          # Custom Hooks (useAuth, usePeople, useTransactions)
├── navigation/     # Composite stack/tab navigators with route safety
├── screens/        # Screen modules (Home, Details, Splash, Settings, Auth)
├── services/       # Core system API & client-side offline engines
└── store/          # Redux Toolkit centralized state machine (slices & selectors)
```
