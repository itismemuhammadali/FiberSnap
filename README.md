# 🥗 FiberSnap — AI Computer Vision Dietary Fiber Tracker & Clinical Nutrition Engine

<p align="center">
  <img src="logo.jpeg" alt="FiberSnap Logo" width="160" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);" />
</p>

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_51-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-Multimodal_Vision-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![USDA FoodData](https://img.shields.io/badge/USDA-FoodData_Central_API-006837?style=for-the-badge)](https://fdc.nal.usda.gov)
[![Firebase](https://img.shields.io/badge/Firebase-Functions_%7C_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Executive Overview & Clinical Problem Solved

**FiberSnap** is an intelligent mobile nutrition platform engineered to eliminate the friction of manual dietary logging. While mainstream fitness applications focus generically on calories and macronutrients, FiberSnap is clinically targeted at **dietary fiber optimization**—one of the most critical deficiencies in modern diets linked to metabolic health, cardiovascular resilience, and microbiome diversity.

By fusing **multimodal computer vision (Google Gemini 1.5 Flash)** with the **USDA FoodData Central clinical food database**, FiberSnap enables users to photograph complex meals and receive instant, verifiable breakdowns of soluble, insoluble, and total dietary fiber content within seconds.

---

## 🚀 Core Platform Capabilities

### 1. Multimodal AI Meal Vision Scanner
- **One-Tap Photo Logging:** Users take a snapshot of a meal or plate.
- **Ingredient Decomposition:** The Gemini AI vision model identifies distinct meal components, cooking preparations, and spatial volume estimates.
- **Granular Fiber Quantification:** Automatically calculates total dietary fiber, categorizing soluble fiber (cholesterol and blood glucose modulation) versus insoluble fiber (digestive motility).

### 2. Verified USDA FoodData Central Grounding
- **Scientific Nutritional Precision:** Every AI estimation is grounded against verified chemical nutrient analyses from the USDA FoodData Central database.
- **Micronutrient & Prebiotic Insights:** Tracks prebiotic density (inulin, resistant starch, pectin, beta-glucan) to deliver personalized gut-health scorecards.

### 3. Barcode & Packaged Food Scanner
- **Global UPC/EAN Scanning:** Instant camera barcode scanner retrieving verified nutritional labels from packaged groceries.
- **Net Carb & Fiber Impact:** Computes total digestible carbohydrates versus non-digestible fiber impact for metabolic and glycemic monitoring.

### 4. Interactive Health Analytics & Longitudinal Trends
- **Daily Target Rings:** Dynamic goal pacing adjusting targets based on age, gender, and personal health protocols.
- **Digestive Symptom Correlation:** Allows users to record wellness and fullness ratings, correlating dietary fiber intake with digestive comfort over weekly and monthly horizons.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MOBILE APPLICATION LAYER                           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      FiberSnap Mobile (React Native / Expo)         │   │
│   │   • Camera Vision Viewfinder  • Barcode Camera Scanner              │   │
│   │   • Daily Fiber Target Rings  • Longitudinal Progress Charts        │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CLOUD INTELLIGENCE & PROCESSING LAYER                   │
│                                                                             │
│   ┌───────────────────────────────┐       ┌─────────────────────────────┐   │
│   │   Google Gemini 1.5 Vision    │       │  USDA FoodData Central API  │   │
│   │  • Meal Segment Identification│       │  • Ground-Truth Chemistry   │   │
│   │  • Volume & Portion Estimator │       │  • Soluble / Insoluble Ratios│  │
│   └───────────────┬───────────────┘       └──────────────┬──────────────┘   │
│                   └───────────────────────┬──────────────┘                  │
│                                           ▼                                 │
│                   Firebase Cloud Functions (Node.js / Express)              │
│                   • Prompt Orchestration & Validation Pipeline              │
│                   • Food Cache & Token Rate-Limiter Engine                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLOUD STORAGE & DATABASE LAYER                        │
│            Cloud Firestore Database  •  Firebase Cloud Storage              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Complete Technology Stack

| Domain | Technology | Implementation Detail |
|---|---|---|
| **Mobile Architecture** | React Native 0.74, Expo SDK 51 | Cross-platform native iOS & Android with TypeScript |
| **Visual AI Engine** | Google Gemini 1.5 Flash Vision | Multi-modal visual inference pipeline with structured JSON outputs |
| **Nutrient Database** | USDA FoodData Central API | Verified clinical nutrient values and standard portion sizes |
| **Cloud Middleware** | Firebase Cloud Functions | Serverless orchestration, rate-limiting, and key security |
| **Persistence** | Cloud Firestore | Real-time offline-first sync of meal history and health metrics |
| **Authentication** | Firebase Auth | Seamless anonymous onboarding with Google & Apple sign-in |

---

## 🏛️ Engineering Provenance

Architected, engineered, and maintained by **Muhammad Ali** as Principal Mobile Architect.
