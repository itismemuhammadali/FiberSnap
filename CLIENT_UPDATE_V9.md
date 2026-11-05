# FiberSnap - Version 9 Release & Client Update Notes

**Date:** November 2026  
**Project:** FiberSnap Mobile Application (iOS & Android)  
**Build Version:** 1.0.0 (V9)  

---

## Executive Summary

This update completes all requested edits for Version 9 of FiberSnap, focusing on user interaction refinements, strict free tier policy enforcement, visual table adjustments, wellness-oriented medical disclaimers, and a comprehensive overhaul of the legal documents (Terms of Service, Apple Standard EULA, and GDPR-compliant Privacy Policy).

All code changes have been validated with the TypeScript compiler (`npx tsc --noEmit`) with zero errors.

---

## 1. Goal Method Selection & Card State Reset
- **Behavior Updated:** When a user enters numbers in either the "Body weight-tailored" or "Custom Goal" fields and subsequently switches back to "Standard Target", the numbers are cleared and the unselected cards cleanly display **"Set Weight"** and **"Set Grams"** respectively (rather than retaining previous input values).
- **Subtitle Reset:** The subtitles for unselected options automatically revert to their default instructional guidance, eliminating confusion.
- **Files Modified:** `src/screens/GoalScreen.tsx`, `src/screens/GoalSetupScreen.tsx`.

---

## 2. Updated Goal Disclaimer
- **Text Replaced:** Below the "Save goal" button, the disclaimer text has been updated to the approved general wellness wording:
  > *"General wellness guidance, not medical advice. If you have a digestive condition or are under a doctor’s care, talk to a physician or registered dietitian before making significant changes to your fiber intake."*
- **File Modified:** `src/screens/GoalScreen.tsx`.

---

## 3. Elimination of "7-Day Free Trial" & Lifetime Complimentary Scan Policy
- **Removed 7-Day Trial References:** All mentions of a "7-Day Free Trial" have been permanently removed across the application, including the Terms of Service screen, the About screen, and the Subscription Paywall modal.
- **Strict Free Tier Limit:** Non-subscribers receive **exactly one (1) single complimentary AI meal scan for a lifetime**. Once that single scan has been used, the camera and gallery scan buttons automatically prompt for FiberSnap Plus.
- **Persistent Tracking:** The complimentary scan state is persistently stored locally on the device (`@fibersnap_lifetime_scan_used`) and synchronized across user profiles, ensuring it cannot be bypassed or reset by logging in/out or clearing user history.
- **Manual Logging 100% Free:** Free tier users continue to have unlimited access to manual food searches, custom food entries, personalized goal calculations, and progress history.
- **Files Modified:** `src/services/storage.ts`, `src/context/AppContext.tsx`, `src/screens/TodayScreen.tsx`, `src/components/PaywallModal.tsx`, `src/screens/AboutScreen.tsx`, `src/screens/TermsScreen.tsx`.

---

## 4. Fiber Content Table & Category Clarification
- **Category Filter Updated:** Removed the `"All Foods"` filter pill from the Fiber Content Table on the Sources tab. The category list now starts with **"Vegetables"** as the first and default selected category.
- **USDA 1,000 Requests/Hour Limit Clarification:**
  - **Question:** *Does looking up foods in the Fiber Content Table count towards the 1,000/hour limit of the USDA database, or are these foods hardwired into the app already?*
  - **Answer:** **These foods are 100% hardwired locally into the application.** The entire Fiber Content Table dataset is bundled directly inside the app code (`src/constants/guidelines.ts`). Browsing categories, filtering by food type, or searching within this table executes entirely on-device and makes **zero external network requests**. It does **not** count towards the USDA FoodData Central 1,000 request/hour rate limit. The only feature that makes live external requests to the USDA API is the manual food search modal when typing custom queries.
- **File Modified:** `src/screens/SourcesScreen.tsx`.

---

## 5. Progress Tab: Soluble vs. Insoluble Split Section Removed
- **Section Removed:** Deleted the "Soluble vs. Insoluble" split progress card and bar chart from the Progress tab screen, simplifying the analytics view to focus on daily averages, best days, goals met, and streak tracking.
- **File Modified:** `src/screens/ProgressScreen.tsx`.

---

## 6. Terms of Service: Non-Clinical Phrasing
- **Medical Disclaimer Updated:** Shifted the tone away from clinical diagnoses (removing specific disease names like Crohn's disease, ulcerative colitis, diverticulitis, and diabetes) to broad, professional wellness guidance:
  > *"ALWAYS CONSULT A LICENSED PHYSICIAN OR REGISTERED DIETITIAN BEFORE UNDERTAKING SUBSTANTIAL DIETARY CHANGES, PARTICULARLY IF YOU HAVE ANY DIGESTIVE, METABOLIC, OR OTHER CHRONIC HEALTH CONDITION, OR ARE OTHERWISE UNDER THE CARE OF A PHYSICIAN."*
- **Files Modified:** `src/screens/TermsScreen.tsx`, `src/screens/CitationsScreen.tsx`, `FiberSnap_Terms_of_Service.docx`.

---

## 7. Legal Overhaul: Terms of Service, Apple EULA & GDPR Privacy Policy
Both in-app screens (`PrivacyPolicyScreen.tsx`, `TermsScreen.tsx`) and the corresponding Word documents (`FiberSnap_Privacy_Policy.docx`, `FiberSnap_Terms_of_Service.docx`) were rewritten and synchronized to address all 7 legal audit requirements:

1. **Photo Retention Reconciled:**
   - **AI Inference (Section 3):** Explains that photos sent for AI scanning are processed ephemerally in transient RAM to generate nutritional estimates and are discarded immediately upon returning the JSON response.
   - **Cloud Storage (Section 4):** Explains that photos are stored in Firebase Cloud Storage **only if and when the user affirmatively saves the meal into their food diary**. Canceled scans or deleted meal entries are never retained or are permanently purged.
2. **International Data Transfers (GDPR/EEA/UK to US):**
   - Added dedicated Section 6 detailing US hosting on Google Cloud/Firebase.
   - Formally named the recognized transfer mechanisms: the **EU-U.S. Data Privacy Framework (EU-U.S. DPF)**, the **UK Extension to the EU-U.S. DPF**, the **Swiss-U.S. DPF** (Google LLC certified), and the European Commission **Standard Contractual Clauses (SCCs)** (Decision 2021/914).
3. **Removed "Biometric" Terminology:**
   - Deleted all references labeling age, biological sex, or body weight as "biometric" data.
   - Renamed Section 2.B to *"Health, Demographic & Target Parameters"*.
4. **AI Model Training Transparency:**
   - Replaced unverified absolute claims with accurate legal disclosures: visual recognition is executed via Google Gemini APIs subject to Google Cloud / Gemini API Data Governance and privacy terms (`policies.google.com/privacy`). Stated that FiberSnap does not independently train foundation models on user photos.
5. **Apple Standard EULA Adopted:**
   - Section 4 of the Terms of Service now formally adopts and incorporates [Apple's Standard Licensed Application EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/) for iOS users, with an interactive direct link, alongside Google Play platform terms for Android.
6. **Active Subscriptions on Account Deletion:**
   - Prominently stated in both documents that **deleting an in-app account does NOT cancel an active Apple ID or Google Play auto-renewing subscription**, because app developers do not have technical or legal authority to cancel store subscriptions. Provided step-by-step instructions for canceling via device settings.
7. **Complete GDPR Rights & Disclosures:**
   - Added full catalog of GDPR Articles 15–22 rights (Access, Rectification, Erasure, Restriction of Processing, Data Portability, Right to Object, Right to Withdraw Consent).
   - Added right to lodge a complaint with an EU Member State Data Protection Authority or the UK Information Commissioner's Office (ICO).
   - Added Automated Decision-Making & Profiling disclosure (confirming no automated decisions producing legal effects).
   - Designated Data Controller and contact: `hello@duomatic.co`.

---

## 8. Summary of Files Updated

| File | Type | Description |
|---|---|---|
| `src/screens/GoalScreen.tsx` | App Screen | Goal selection reset & updated disclaimer below Save Goal |
| `src/screens/GoalSetupScreen.tsx` | App Screen | Goal onboarding selection reset |
| `src/screens/SourcesScreen.tsx` | App Screen | Removed "All Foods" pill, default to "Vegetables" |
| `src/screens/ProgressScreen.tsx` | App Screen | Removed Soluble vs. Insoluble split progress card |
| `src/screens/TodayScreen.tsx` | App Screen | Enforced 1 lifetime complimentary AI scan limit |
| `src/services/storage.ts` | Storage Service | Persistent `@fibersnap_lifetime_scan_used` device key |
| `src/context/AppContext.tsx` | App Context | State management for lifetime scan enforcement |
| `src/components/PaywallModal.tsx` | Component | Removed 7-day free trial references |
| `src/screens/AboutScreen.tsx` | App Screen | Removed 7-day free trial references |
| `src/screens/CitationsScreen.tsx` | App Screen | Updated medical disclaimer to wellness phrasing |
| `src/screens/TermsScreen.tsx` | App Screen | Apple EULA, subscription deletion notice, wellness disclaimer |
| `src/screens/PrivacyPolicyScreen.tsx` | App Screen | Reconciled photos, DPF/SCCs, no biometrics, GDPR rights |
| `FiberSnap_Terms_of_Service.docx` | Word Document | Fully synchronized with in-app Terms & EULA |
| `FiberSnap_Privacy_Policy.docx` | Word Document | Fully synchronized with in-app Privacy Policy |

