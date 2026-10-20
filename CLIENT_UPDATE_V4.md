FIBERSNAP - VERSION 4 RELEASE & CLIENT UPDATE NOTES

Date: October 13, 2026
Project: FiberSnap Mobile Application (iOS & Android)
Build Version: 1.0.0 (V4)

================================================================================
EXECUTIVE SUMMARY
================================================================================

This document details all updates, refinements, and technical implementations 
completed in Version 4 (V4) of FiberSnap based on your direct feedback. 

All 17 items have been addressed across the user experience, scientific grounding, 
visual hierarchy, and meal vision workflow. A couple of quick items where your 
preference is needed are noted in Section 3.


================================================================================
SECTION 1: COMPLETED UPDATES & REFINEMENTS
================================================================================

1. App Launch & Splash Screen
- Clarification: The temporary white loading screen with spinner observed during testing is the local Expo bundler compiling JavaScript over the local development network.
- Production Behavior: In the standalone release build (Apple TestFlight and Google Play), this bundler view does not exist; the application launches directly into the native splash screen and main dashboard.

2. Logo & Wordmark Refinements
- Pea Pod Icon: Replaced curved internal partition lines with straight, clean vertical separators matching your exact brand asset.
- Splash Screen Branding: Enlarged the logo mark and title typography on the splash view for improved visual balance.
- Wordmark Typography: Styled the brand wordmark so "Fiber" appears in solid dark ink and "Snap" appears in vibrant brand pea green.

3. Food Logging & Touch Responsiveness
- Restored Version 1 logging interaction flow.
- Background modal lifecycles were restructured so invisible modals are unmounted rather than kept in the layout tree, resolving touch interception conflicts on iOS. Tapping "+ Log a food", "+ Custom amount", or the USDA search responds instantly.

4. Daily Goal Calculation & Validation
- Standardized terminology across the app to "Body Weight-Tailored".
- Added input validation: if a user selects "Body Weight-Tailored" without entering a weight, the interface prompts for weight before saving, preventing zero or NaN targets.
- Custom goal targets are no longer pre-filled with arbitrary values until the user enters their preferred number.
- Saving a goal or finishing onboarding routes directly to the Today dashboard.

5. Reminders & Scheduled Notification Times
- Replaced the simple toggle on the profile screen with a dedicated "Reminders & Notifications" view.
- Added a full schedule of reminder time slots matching Proteia:
  * Morning: 6:00 AM, 7:00 AM, 8:00 AM, 9:00 AM
  * Midday: 12:00 PM, 1:00 PM, 2:00 PM
  * Evening: 6:00 PM, 7:00 PM, 8:00 PM
- Integrated Apple-compliant user notification permission handling and persistent scheduling.

6. Daily Goal Celebration Engine
- Added animated confetti celebration when the user reaches 100% of their daily fiber target.
- Built with physics-driven particles, smooth gravity drop, rotational flutter, and native iOS haptic feedback (Success vibration).
- Displays a celebratory banner ("Daily Goal Reached!").
- The celebration can also be triggered at any time by tapping the progress ring once the daily goal is met.

7. Default Appearance & System Theme Clarification
- Set default application theme to "Light" mode out of the box for all users.
- System Theme Explanation: The "System" setting mirrors the iOS global appearance set in device Settings -> Display & Brightness. If a device has iOS Dark Mode active, "System" displays dark. Defaulting to "Light" ensures the application remains bright and clean regardless of the device's operating system mode.

8. Complete Spelling of Abbreviations at First Mention
- Sources Screen: Table subtitle explicitly spells out "United States Department of Agriculture (USDA)".
- Research Banner: Spells out "Institute of Medicine Dietary Reference Intakes (DRI)", "World Health Organization (WHO)", and "American Heart Association (AHA)".
- Scientific Citations Screen: Header explicitly states "Institute of Medicine (IOM) Dietary Reference Intakes (DRI)", "United States Department of Agriculture (USDA)", and "World Health Organization (WHO)".
- Category filter pill updated to "Dietary Reference Intakes (DRI)".

9. General Wellness Tone (Medical Language Pulled Back)
- Replaced clinical disease guidance with daily wellness and healthy nutrition terminology:
  * "Clinical Standard" changed to "Standard Target".
  * "Clinical Recommendations" and "Clinical Guidelines" replaced with "Dietary Guidelines" and "Nutritional Recommendations".
  * "Clinical References" and "Key Clinical Finding" renamed to "Scientific References" and "Key Research Finding".
  * Reframed benefits around everyday vitality, sustained fullness (satiety), healthy digestion, and steady daily energy rather than medical pathology.

10. Citation for the 95% Fiber Gap Statistic
- In Me -> About FiberSnap, added the peer-reviewed citation directly beneath the quotation:
  "Quagliani, D., & Felt-Glover, E. (2017). Closing America's Fiber Intake Gap: Communication Strategies From a Food and Fiber Summit. American Journal of Lifestyle Medicine, 11(1), 80–85; grounded in the USDA & HHS Dietary Guidelines for Americans (2020–2025)."

11. Typography & Visual Styling
- Headers use Apple's native editorial serif (Georgia) paired with native San Francisco Pro for UI numbers, buttons, and body text.
- No fonts were generated by Claude or automated AI generators; these are native Apple system typefaces matching the original web reference design (fibersnap.html).
- AI boilerplate language has been eliminated across all descriptions and popups.
- Note: If you prefer a 100% sans-serif visual feel throughout the app (identical to Proteia), we can switch header typography to San Francisco Pro upon request.

12. Sources Screen Timeframe Filter
- Removed the "1 Year" timeframe selector from the Sources tab.
- Filter now cleanly provides: Today | 7 Days | 30 Days.

13. Interactive Scientific Discovery Popups
- Added short peer-reviewed citations to all key informational cards across the app.
- Added interactive "(i)" info buttons on card headers:
  * Daily Targets by Sex & Age (About Screen)
  * Soluble vs. Insoluble Fiber (About Screen & Sources Screen)
  * Intake Science (Goal Setup Screen)
- Tapping "(i)" opens a scientific discovery popup with a direct button linking to the research citations library pre-filtered to that specific nutritional topic.

14. Consistent Title Capitalization
- Standardized all card headings, section titles, and metric tiles across every screen to Title Case (e.g., "Today's Sources", "Soluble vs. Insoluble", "Today's Log", "This Week", "Last 30 Days", "Monthly Summary", "Set Your Goal", "Daily Goal", "Days Tracked").

15. Profile Screen Simplification
- Removed "Foods Logged, All Time" and "AI Meal Vision Scans" from the Me profile card.
- Retained clean focus on core metrics: "Daily Goal" and "Days Tracked".

16. Meal Scan Review Modal Scrolling & Keyboard Access
- Resolved the scrolling constraint on the "Review Scanned Nutrients" screen by expanding the scroll canvas with 260px of bottom padding and enabling nested vertical drag handling.
- The meal identification card, portion input, fiber breakdown fields, and the "Add to Today's Fiber" button can now be scrolled up into comfortable reach without being obstructed by the screen edge or keyboard.
- Applied matching scroll clearance to Custom Quick Log and Edit Entry modals.


================================================================================
SECTION 2: BUILD ARTIFACTS INCLUDED IN V4
================================================================================

- iOS Workspace: Updated CocoaPods dependencies (94 pods synced), verified in Xcode.
- Android Bundle: FiberSnap-release-v4.aab (55 MB release AAB ready for Google Play).
- Project Archive: FiberSnap_V4.zip (clean distribution archive).


================================================================================
SECTION 3: CLARIFICATION QUESTIONS FOR YOUR FEEDBACK
================================================================================

1. Membership & Access Tiers (Subscription Length):
In your earlier note, you mentioned removing "1 year". To ensure we align with your vision:
- If you were referring to the feature description mentioning "1-year longitudinal trends", we have focused that strictly on 30-day and monthly history.
- If you were referring to the Annual subscription plan ($49.99/year), standard mobile apps (such as Proteia) offer both Monthly ($6.99/mo) and Annual ($49.99/yr) options to provide a discounted option that increases long-term user retention.
- Which subscription model would you prefer:
  (a) Keep Monthly ($6.99/mo) + Annual ($49.99/yr) discount model, and keep history copy focused on 30 days.
  (b) Switch the longer plan to a 6-Month subscription.
  (c) Offer only a single Monthly subscription ($6.99/mo).

2. Header Typography:
Currently, the app uses Georgia serif for editorial headers (matching fibersnap.html) and San Francisco Pro for UI numbers and buttons. If you would like the app to have a more modern mobile look identical to Proteia (100% sans-serif with no serif headings), we can update all headers to San Francisco Pro. Please let us know your preference.
