Here's the full text of the **PayTrace PRD — Firebase Edition**:

---

# PAYTRACE

### Personal Money Transaction Manager

## Product Requirements Document

**Firebase + Google Auth Edition | Version 1.0 | May 23, 2026 | Status: Draft**

---

## 1. Executive Summary

PayTrace is a mobile-first personal finance application that helps individuals track money they owe to others and money others owe to them. It replaces mental notes and paper records with a clean, always-accessible ledger organized by person — not by date or category.

The core problem PayTrace solves: when you lend money to a friend, borrow from a family member, or split an expense with a colleague, keeping track of who owes what becomes cumbersome. PayTrace makes this instant, clear, and stress-free.

| Attribute      | Detail                                          |
| -------------- | ----------------------------------------------- |
| App Name       | PayTrace                                        |
| Platform       | React Native (Expo) + Firebase                  |
| Target Users   | Individuals managing personal lending/borrowing |
| Core Value     | See every balance per person at a glance        |
| Authentication | Firebase Auth (Google + Email/Password)         |
| MVP Timeline   | 12 weeks                                        |
| Version        | 1.0 — Firebase Edition                          |

---

## 2. Problem Statement

**The Core Problem:** People frequently lend and borrow money in everyday life — paying for a friend's meal, splitting rent, covering a colleague's coffee. Tracking these informal transactions is almost always done mentally or on scraps of paper, leading to forgotten debts, awkward conversations, and strained relationships.

### 2.1 Pain Points

- No single place to see all balances across multiple people
- Forgetting exact amounts and dates of transactions
- Embarrassment in asking "how much do I owe you again?"
- No easy way to add notes or context to a transaction
- Existing banking apps don't support informal personal lending

### 2.2 Target Audience

| User Type           | Example Scenario                                  |
| ------------------- | ------------------------------------------------- |
| Young Professionals | Split dinner with 4 friends, track who paid what  |
| Roommates           | One person pays rent, others reimburse them       |
| Family Members      | Parents lend money to children for emergencies    |
| Small Groups        | Trip organizer advances money for the whole group |
| Freelancers         | Track client advances and partial payments        |

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

1. Enable users to track all personal transactions organized by person
2. Provide instant visibility into net balance per person (owed vs owing)
3. Support full CRUD operations on people and transactions
4. Deliver a secure, authenticated experience per user
5. Ensure the app is intuitive enough to use without a tutorial

### 3.2 Success Metrics (KPIs)

| Metric                                        | Target (3 months post-launch) |
| --------------------------------------------- | ----------------------------- |
| User Retention (Day 30)                       | ≥ 40%                         |
| Avg. transactions logged per active user/week | ≥ 5                           |
| Task completion rate (add transaction)        | ≥ 90%                         |
| App Store Rating                              | ≥ 4.4 stars                   |
| Crash-free sessions                           | ≥ 99.5%                       |
| Avg. time to add a transaction                | < 30 seconds                  |

---

## 4. Features & Functional Requirements

### 4.1 Authentication

Firebase Authentication handles all identity management — no custom auth server needed.

- Google Sign-In via Firebase Authentication (OAuth 2.0) — one-tap login
- Email + Password sign-up and sign-in via Firebase Auth
- Email verification on new email registrations
- Password reset via Firebase-managed email link
- Persistent login session managed by Firebase SDK (ID token auto-refresh)
- Sign out (current device) and sign out of all devices via token revocation
- Optional biometric unlock (Face ID / fingerprint) after initial Firebase auth
- Firebase Auth UID used as the Firestore document namespace for all user data

### 4.2 People Management

Each user maintains their own list of people they have financial relationships with.

| Operation              | Description                                             | Priority         |
| ---------------------- | ------------------------------------------------------- | ---------------- |
| Create (Add Person)    | Add a contact by name, optional phone/email             | P0 — Must Have   |
| Read (View Person)     | See all transactions with a person + net balance        | P0 — Must Have   |
| Update (Edit Person)   | Edit name, contact info                                 | P1 — Should Have |
| Delete (Remove Person) | Remove person (with confirmation; archive transactions) | P1 — Should Have |
| Search/Filter          | Search contacts by name                                 | P1 — Should Have |

### 4.3 Transaction Management

Every transaction is linked to one person and records the direction of money flow, amount, date, and an optional note.

| Operation | Description                                               | Priority         |
| --------- | --------------------------------------------------------- | ---------------- |
| Create    | Log a new transaction: amount, direction, date, note      | P0 — Must Have   |
| Read      | View transaction history per person, sorted by date       | P0 — Must Have   |
| Update    | Edit amount, date, direction, or note on any transaction  | P0 — Must Have   |
| Delete    | Delete a transaction with confirmation dialog             | P0 — Must Have   |
| Filter    | Filter transactions by date range or type (lent/borrowed) | P1 — Should Have |

### 4.4 Transaction Fields

- Amount — numeric, required, supports decimals (currency formatted)
- Direction — "I lent" (they owe me) or "I borrowed" (I owe them)
- Date — defaults to today, user can pick any past/future date
- Note — free text, optional, up to 200 characters
- Linked Person — required, selected from contacts list

### 4.5 Dashboard / Home Screen

- Total net balance across all people (how much you're owed minus how much you owe)
- List of all people with individual net balance per person
- Color coding: green = they owe you, red = you owe them, gray = settled
- Tap any person card to drill into their transaction history
- Floating action button to quickly add a new transaction

### 4.6 Person Detail Screen

- Person's name and contact info at the top
- Net balance badge prominently displayed
- Chronological list of all transactions with that person
- Each transaction row: date, note snippet, amount, direction indicator
- Swipe-to-edit and swipe-to-delete on transaction rows
- Button to mark all as settled (resets balance to zero with a settlement record)

---

## 5. Non-Functional Requirements

| Category        | Requirement                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Performance     | App launch < 2s on mid-range devices; list scroll at 60fps                                          |
| Offline Support | Core read/write operations work offline; Firestore SDK handles sync on reconnect automatically      |
| Security        | Data encrypted at rest and in transit by Firebase; Firestore Security Rules enforce per-user access |
| Scalability     | Cloud Firestore scales automatically; no manual capacity planning needed                            |
| Accessibility   | WCAG 2.1 AA: sufficient contrast, font scaling, screen reader support                               |
| Data Backup     | Firestore automatic backups; users can export data as CSV via Cloud Function                        |
| Session Timeout | Auto-lock after 5 mins of inactivity (configurable); Firebase ID token auto-refresh in background   |
| Error Handling  | User-friendly error messages; no raw stack traces in UI                                             |

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer            | Technology                         | Rationale                                                              |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Mobile Framework | React Native (Expo)                | Single codebase for iOS & Android; large ecosystem                     |
| State Management | Redux Toolkit + RTK Query          | Predictable state; built-in caching & sync                             |
| Navigation       | React Navigation v6                | Industry standard; deep linking support                                |
| UI Components    | NativeWind + custom design system  | Tailwind-style for RN; consistent theming                              |
| Backend (BaaS)   | Firebase (Firestore + Functions)   | Fully managed; no server provisioning; scales automatically            |
| Database         | Cloud Firestore                    | Real-time NoSQL; built-in offline sync; scales to millions of docs     |
| Authentication   | Firebase Authentication            | Google Sign-In + Email/Password; managed tokens; zero custom auth code |
| Serverless Logic | Firebase Cloud Functions (Node.js) | Event-driven backend; triggers on Firestore writes; no idle cost       |
| File Storage     | Firebase Storage                   | Profile photos & exports; integrates with Firebase Auth security rules |
| Hosting / Config | Firebase Hosting + Remote Config   | Static assets; feature flags without app re-deploy                     |
| CI/CD            | GitHub Actions + Firebase CLI      | Automated test → build → firebase deploy pipeline                      |

### 6.2 Data Model (Firestore Collections)

All data is stored in Cloud Firestore using a hierarchical collection structure. Security Rules ensure each user can only read/write their own documents.

| Firestore Path                                    | Key Fields                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| users/{uid}                                       | uid, displayName, email, photoURL, provider (google\|email), createdAt     |
| users/{uid}/people/{personId}                     | personId, name, phone, email, createdAt, updatedAt                         |
| users/{uid}/people/{personId}/transactions/{txId} | txId, amount, direction (lent\|borrowed), date, note, createdAt, updatedAt |
| users/{uid}/settlements/{settlementId}            | settlementId, personId, settledAt, notes                                   |

### 6.3 Data Access Pattern

Because the Firebase SDK handles data sync directly from the mobile client, there are no hand-rolled REST endpoints for CRUD. The React Native app talks to Firestore via the Firebase SDK. Cloud Functions handle server-side logic that should not run on-device.

- All CRUD on people and transactions uses the Firebase SDK directly from the React Native app
- Firestore Security Rules (not middleware) enforce authorization — users can only access `users/{their-uid}/**`
- Real-time listeners (onSnapshot) power the dashboard and transaction lists — no polling needed
- Cursor-based pagination via Firestore `startAfter()` for transaction history
- Firestore batch writes used for settlement records (atomic multi-document update)

### 6.4 Cloud Functions (Server-side Logic)

| Trigger            | Function Name        | Purpose                                                              |
| ------------------ | -------------------- | -------------------------------------------------------------------- |
| HTTP (callable)    | deleteUserAccount    | Wipe all user data + revoke Firebase Auth tokens on account deletion |
| HTTP (callable)    | exportUserData       | Generate & return CSV of all transactions (CPU-heavy, off-device)    |
| Firestore onCreate | onTransactionCreated | Recalculate and cache net balance for a Person doc                   |
| Firestore onDelete | onTransactionDeleted | Recalculate cached balance when a transaction is removed             |
| Auth onCreate      | onUserCreated        | Initialize users/{uid} profile document on first sign-up             |
| Auth onDelete      | onUserDeleted        | Cascade-delete all sub-collections when a Firebase user is deleted   |

---

## 7. UI / UX Design Guidelines

### 7.1 Design Principles

- Clarity first — every screen answers one question clearly
- Minimal taps — adding a transaction should take ≤ 3 taps
- Color as information — green/red convey direction consistently throughout
- Progressive disclosure — show summary first, detail on demand
- Mobile-native patterns — swipe gestures, bottom sheets, haptic feedback

### 7.3 Screen Hierarchy

1. Splash / Onboarding → Sign Up / Login (Google or Email)
2. Home Dashboard → list of people with net balances
3. Person Detail → transaction history + add transaction FAB
4. Add / Edit Transaction → bottom sheet modal
5. Add / Edit Person → simple form
6. Settings → profile, security, data export, logout

---

## 8. Engineering Best Practices

### 8.1 Frontend (React Native)

- Functional components only — no class components
- Custom hooks for business logic (useTransactions, usePeople, useAuth)
- Absolute imports configured via tsconfig/babel paths
- Co-locate component, styles, and types in single folder per component
- Memoization with React.memo, useMemo, useCallback where profiled as needed
- Error boundaries at route level to prevent full-app crashes
- Expo EAS Build for CI/CD and OTA updates

### 8.2 Firebase & Cloud Functions

- All Firestore Security Rules version-controlled in `firestore.rules` and reviewed in every PR
- Cloud Functions written in TypeScript with strict mode; deployed via `firebase deploy --only functions`
- Input validation with Zod inside callable Cloud Functions before any Firestore write
- Firebase environment config (`functions.config()`) for secrets — no hardcoded keys
- Firestore `batch()` and `runTransaction()` for multi-document atomic writes (e.g., settlement)
- Callable functions return typed responses; use `onCall` not `onRequest` where auth is required
- Emulator Suite (Auth + Firestore + Functions) used locally — no staging Firebase project needed

### 8.3 Code Quality

- TypeScript strict mode on both frontend and Cloud Functions
- ESLint + Prettier enforced in pre-commit hooks (Husky + lint-staged)
- Unit tests for all Cloud Function logic (Jest + Firebase Emulator; ≥ 80% coverage target)
- Firestore Security Rules tested with `@firebase/rules-unit-testing`
- Conventional Commits for all commit messages
- PR template with checklist: tests pass, types clean, Security Rules reviewed, changelog updated

---

## 9. Development Milestones

| Phase                     | Week    | Deliverables                                                                            |
| ------------------------- | ------- | --------------------------------------------------------------------------------------- |
| Phase 1 — Foundation      | 1 – 2   | Project scaffold, Firebase project setup, Firestore schema, Security Rules, Auth config |
| Phase 2 — Core Data Layer | 3 – 4   | People & Transaction CRUD via Firestore SDK, Cloud Functions, unit tests with Emulator  |
| Phase 3 — Mobile Shell    | 5 – 6   | Navigation setup, design system, auth screens (Google + Email)                          |
| Phase 4 — Core Screens    | 7 – 8   | Dashboard, Person Detail, Add/Edit Transaction                                          |
| Phase 5 — Polish          | 9 – 10  | Offline mode, error states, animations, accessibility                                   |
| Phase 6 — QA & Launch     | 11 – 12 | Beta testing, bug fixes, App Store submission                                           |

---

## 10. Out of Scope (V1)

The following features are intentionally excluded from V1 to maintain focus and meet the 12-week timeline. They are candidates for V2+.

- Group expense splitting (e.g., Splitwise-style)
- Push notifications / payment reminders
- In-app payments or real money transfer
- Recurring transaction templates
- Multi-currency support
- Social features (shared ledgers with contacts)
- Desktop web application
- Third-party integrations (UPI, bank feeds)

---

## 11. Risks & Mitigations

| Risk                                       | Likelihood | Impact | Mitigation                                                                           |
| ------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------ |
| Scope creep delays MVP                     | High       | High   | Strict V1 feature freeze; backlog grooming weekly                                    |
| Data loss / sync conflicts in offline mode | Medium     | High   | Firestore SDK handles conflict resolution; audit log for settlements                 |
| Low user adoption                          | Medium     | High   | Onboarding flow with pre-populated sample data                                       |
| Firestore Security Rules misconfiguration  | Medium     | High   | Rules unit tests with @firebase/rules-unit-testing; third-party review before launch |
| Performance on low-end Android devices     | Medium     | Medium | Performance profiling on budget devices in Phase 5                                   |

---

## 12. Glossary

| Term                     | Definition                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| Lent                     | User gave money to a Person — Person owes the User                                                   |
| Borrowed                 | User received money from a Person — User owes the Person                                             |
| Net Balance              | Sum of all LENT amounts minus sum of all BORROWED amounts for a Person                               |
| Settlement               | A record that marks all outstanding balance with a Person as cleared (zero)                          |
| Contact / Person         | Anyone the User has a financial relationship with inside the app                                     |
| CRUD                     | Create, Read, Update, Delete — the four basic data operations                                        |
| Firebase Auth UID        | Unique user identifier issued by Firebase Authentication; used as the Firestore document namespace   |
| Firestore Security Rules | Server-side declarative access control language that enforces who can read/write which documents     |
| Cloud Function           | Serverless Node.js function deployed on Google Cloud and triggered by Firebase events or HTTP calls  |
| onSnapshot               | Firestore real-time listener that pushes document/collection updates to the client instantly         |
| Emulator Suite           | Local Firebase emulators for Auth, Firestore, and Functions — allows offline development and testing |
| OTA                      | Over-the-Air update — push JS bundle updates without App Store review                                |

---

_© 2026 PayTrace. All rights reserved._
