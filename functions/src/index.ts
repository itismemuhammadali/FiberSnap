/**
 * FiberSnap Cloud Functions (fibersnap-1)
 *
 * Secure server-side endpoints for:
 * 1. analyzeFiberWithGemini - Multimodal Gemini 1.5 Flash fiber computer vision
 * 2. searchUsdaFoods - USDA FoodData Central nutritional database search
 *
 * Keeps API keys hidden from client mobile builds and enforces request validation.
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

// Fallback keys if not set via environment / secrets
const FALLBACK_GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  "YOUR_GEMINI_API_KEY";

const FALLBACK_USDA_KEY =
  process.env.USDA_API_KEY ||
  "yRdYcGqzBA18KzJmyH7Et1VLW7B8H3VUkVIt7hH2";

const GEMINI_SYSTEM_INSTRUCTION = `
You are the world-class clinical AI nutrition vision engine for FiberSnap.
Analyze the meal photograph with extreme rigor, biochemical accuracy, and strict perspective invariance.

CRITICAL INCLUSION & EXCLUSION RULES:
1. PERSPECTIVE & ANGLE INVARIANCE:
   - Regardless of camera pitch, tilt, close-up, top-down angle, lighting, or plate depth, identify the actual physical 3D volume of each food item.
   - Do NOT alter food weight or fiber estimation based solely on angle or zoom.
2. EXCLUDE ALL NON-EDIBLES:
   - Completely ignore plates, bowls, utensils, napkins, tablecloths, table surfaces, and packaging.
3. FIBER BIOCHEMISTRY (USDA / IOM STANDARDS):
   - ONLY PLANT FOODS CONTAIN DIETARY FIBER.
   - Pure meats, poultry, fish, eggs, dairy oils, and animal fats contain EXACTLY 0.0g of dietary fiber.
   - Always ensure: total_fiber_g = soluble_fiber_g + insoluble_fiber_g.
4. ESTIMATE REALISTIC PORTIONS:
   - Estimate portion in grams based on visual reference size against standard cutlery/dinnerware.

OUTPUT FORMAT:
Respond with raw JSON only (no markdown fences, no surrounding commentary):
{
  "food_name": "Primary meal or dish name",
  "portion_description": "e.g., 1 cup cooked rolled oats with 1 tbsp chia seeds",
  "estimated_weight_g": 240,
  "confidence": 0.95,
  "total_fiber_g": 8.2,
  "soluble_fiber_g": 4.1,
  "insoluble_fiber_g": 4.1,
  "calories": 280,
  "carbohydrates_g": 48.0,
  "protein_g": 9.5,
  "fat_g": 6.0,
  "fiber_density_rating": "HIGH",
  "clinical_notes": "Rich in beta-glucan soluble fiber known to lower LDL cholesterol and stabilize postprandial glucose."
}
`;

/**
 * Cloud Function: analyzeFiberWithGemini
 * Analyzes meal photo for dietary fiber using Gemini 1.5 Flash.
 */
export const analyzeFiberWithGemini = onCall(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (request) => {
    const { imageBase64, mimeType = "image/jpeg" } = request.data || {};

    if (!imageBase64 || typeof imageBase64 !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a base64 encoded image string."
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || FALLBACK_GEMINI_KEY;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            parts: [
              { text: GEMINI_SYSTEM_INSTRUCTION },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Gemini API error from Cloud Function:", res.status, errorText);
        throw new HttpsError(
          "internal",
          `Gemini API upstream error: ${res.status} ${errorText}`
        );
      }

      const geminiResponse = await res.json();
      const rawText =
        geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new HttpsError(
          "internal",
          "Gemini returned an empty response candidate."
        );
      }

      const parsed = JSON.parse(rawText.trim());
      return { success: true, data: parsed };
    } catch (err: any) {
      console.error("analyzeFiberWithGemini failure:", err);
      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", err.message || "Unknown error occurred.");
    }
  }
);

/**
 * Cloud Function: searchUsdaFoods
 * Queries USDA FoodData Central API securely on the backend.
 */
export const searchUsdaFoods = onCall(
  {
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
  },
  async (request) => {
    const { query, pageSize = 15, pageNumber = 1 } = request.data || {};

    if (!query || typeof query !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "A search query string is required."
      );
    }

    let apiKey = process.env.USDA_API_KEY || FALLBACK_USDA_KEY;

    async function executeSearch(key: string) {
      const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
      url.searchParams.set("api_key", key);
      url.searchParams.set("query", query);
      url.searchParams.set("pageSize", String(Math.min(pageSize, 50)));
      url.searchParams.set("pageNumber", String(pageNumber));
      url.searchParams.set(
        "dataType",
        "Foundation,SR Legacy,Survey (FNDDS),Branded"
      );

      return fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
    }

    try {
      let res = await executeSearch(apiKey);

      // If the custom key was invalid (403), retry with DEMO_KEY
      if (res.status === 403 && apiKey !== "DEMO_KEY") {
        console.warn("Custom USDA key failed (403). Retrying with DEMO_KEY...");
        res = await executeSearch("DEMO_KEY");
      }

      if (!res.ok) {
        throw new HttpsError(
          "internal",
          `USDA FoodData Central returned HTTP ${res.status}`
        );
      }

      const data = await res.json();
      return {
        success: true,
        totalHits: data.totalHits || 0,
        foods: data.foods || [],
      };
    } catch (err: any) {
      console.error("searchUsdaFoods failure:", err);
      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", err.message || "Failed to search USDA database.");
    }
  }
);
