import { USDASearchItem } from '../types';
import { classifyFiberType } from '../constants/keywords';
import { StorageService } from './storage';
import { RemoteConfigService } from './firebase';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const FIBER_NUTRIENT_ID = 1079; // "Fiber, total dietary"

// Fallback high-fiber staples for instant response or offline/rate-limited queries
const COMMON_HIGH_FIBER_FOODS: USDASearchItem[] = [
  {
    fdcId: 1001,
    description: 'Chia seeds, dried (1 tbsp / 12g)',
    fiberGrams: 4.1,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 4.1 }],
    servingSize: 12,
    servingSizeUnit: 'g',
    tag: 'soluble',
  },
  {
    fdcId: 1002,
    description: 'Black beans, cooked (1/2 cup / 86g)',
    fiberGrams: 7.5,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 7.5 }],
    servingSize: 86,
    servingSizeUnit: 'g',
    tag: 'soluble',
  },
  {
    fdcId: 1003,
    description: 'Oatmeal, rolled oats cooked (1 cup / 234g)',
    fiberGrams: 4.0,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 4.0 }],
    servingSize: 234,
    servingSizeUnit: 'g',
    tag: 'soluble',
  },
  {
    fdcId: 1004,
    description: 'Avocado, raw Hass (1 medium / 150g)',
    fiberGrams: 10.0,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 10.0 }],
    servingSize: 150,
    servingSizeUnit: 'g',
    tag: 'mixed',
  },
  {
    fdcId: 1005,
    description: 'Raspberries, fresh (1 cup / 123g)',
    fiberGrams: 8.0,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 8.0 }],
    servingSize: 123,
    servingSizeUnit: 'g',
    tag: 'mixed',
  },
  {
    fdcId: 1006,
    description: 'Lentils, boiled (1/2 cup / 99g)',
    fiberGrams: 7.8,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 7.8 }],
    servingSize: 99,
    servingSizeUnit: 'g',
    tag: 'soluble',
  },
  {
    fdcId: 1007,
    description: 'Almonds, whole raw (1 oz / 28g / 23 nuts)',
    fiberGrams: 3.5,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 3.5 }],
    servingSize: 28,
    servingSizeUnit: 'g',
    tag: 'insoluble',
  },
  {
    fdcId: 1008,
    description: 'Broccoli, chopped cooked (1 cup / 156g)',
    fiberGrams: 5.1,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 5.1 }],
    servingSize: 156,
    servingSizeUnit: 'g',
    tag: 'insoluble',
  },
  {
    fdcId: 1009,
    description: 'Apple with skin, medium (182g)',
    fiberGrams: 4.4,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 4.4 }],
    servingSize: 182,
    servingSizeUnit: 'g',
    tag: 'mixed',
  },
  {
    fdcId: 1010,
    description: 'Whole wheat bread (1 slice / 38g)',
    fiberGrams: 2.1,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 2.1 }],
    servingSize: 38,
    servingSizeUnit: 'g',
    tag: 'insoluble',
  },
  {
    fdcId: 1011,
    description: 'Chickpeas / Garbanzo beans, cooked (1/2 cup / 82g)',
    fiberGrams: 6.2,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 6.2 }],
    servingSize: 82,
    servingSizeUnit: 'g',
    tag: 'soluble',
  },
  {
    fdcId: 1012,
    description: 'Quinoa, cooked (1 cup / 185g)',
    fiberGrams: 5.2,
    foodNutrients: [{ nutrientId: FIBER_NUTRIENT_ID, nutrientName: 'Fiber, total dietary', unitName: 'G', value: 5.2 }],
    servingSize: 185,
    servingSizeUnit: 'g',
    tag: 'insoluble',
  },
];

export async function searchUSDAFoods(query: string): Promise<USDASearchItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return COMMON_HIGH_FIBER_FOODS.slice(0, 8);
  }

  // Check cache first
  const cached = await StorageService.getCachedUSDAResults(trimmed);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 1. Attempt Cloud Function execution first (server-side security)
  try {
    const { functions, httpsCallable } = await import('./firebase');
    const searchUsdaFn = httpsCallable<
      { query: string; pageSize: number },
      { success: boolean; foods: any[]; totalHits: number }
    >(functions, 'searchUsdaFoods');

    const cloudRes = await searchUsdaFn({
      query: trimmed,
      pageSize: 15,
    });

    if (cloudRes.data?.success && Array.isArray(cloudRes.data?.foods) && cloudRes.data.foods.length > 0) {
      const results: USDASearchItem[] = cloudRes.data.foods.map((food: any) => {
        let fiberValue = 0;
        if (Array.isArray(food.foodNutrients)) {
          const fiberNutrient = food.foodNutrients.find(
            (n: any) => n.nutrientId === FIBER_NUTRIENT_ID || n.nutrientNumber === '291'
          );
          if (fiberNutrient) {
            fiberValue = Number(fiberNutrient.value) || 0;
          }
        }
        return {
          fdcId: food.fdcId,
          description: food.description,
          fiberGrams: Math.round(fiberValue * 10) / 10,
          foodNutrients: food.foodNutrients || [],
          servingSize: food.servingSize || 100,
          servingSizeUnit: food.servingSizeUnit || 'g',
          tag: classifyFiberType(food.description),
        };
      });

      if (results.length > 0) {
        await StorageService.setCachedUSDAResults(trimmed, results);
        return results;
      }
    }
  } catch (cloudErr) {
    // Cloud function not yet deployed or error, fall through to direct USDA fetch
  }

  // 2. Direct client-side fetch with fallback to DEMO_KEY
  const apiKey =
    (await RemoteConfigService.getUsdaApiKey()) ||
    process.env.EXPO_PUBLIC_USDA_API_KEY ||
    'yRdYcGqzBA18KzJmyH7Et1VLW7B8H3VUkVIt7hH2';
  const url = `${USDA_API_BASE}/foods/search?api_key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: trimmed,
        pageSize: 15,
        dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'],
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      }),
    });

    let foodList: any[] = [];
    if (!response.ok) {
      if (response.status === 403 && apiKey !== 'DEMO_KEY') {
        try {
          const demoRes = await fetch(`${USDA_API_BASE}/foods/search?api_key=DEMO_KEY`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: trimmed,
              pageSize: 15,
              dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'],
              sortBy: 'dataType.keyword',
              sortOrder: 'asc',
            }),
          });
          if (demoRes.ok) {
            const demoData = await demoRes.json();
            if (Array.isArray(demoData.foods)) {
              foodList = demoData.foods;
            }
          }
        } catch {
          // ignore fallback error
        }
      }
      if (foodList.length === 0) {
        return filterOfflineFallbacks(trimmed);
      }
    } else {
      const data = await response.json();
      if (data.foods && Array.isArray(data.foods)) {
        foodList = data.foods;
      } else {
        return filterOfflineFallbacks(trimmed);
      }
    }

    const results: USDASearchItem[] = foodList.map((food: any) => {
      // Find Nutrient 1079
      let fiberValue = 0;
      if (Array.isArray(food.foodNutrients)) {
        const fiberNutrient = food.foodNutrients.find(
          (n: any) => n.nutrientId === FIBER_NUTRIENT_ID || n.nutrientNumber === '291'
        );
        if (fiberNutrient) {
          fiberValue = Number(fiberNutrient.value) || 0;
        }
      }

      const description = food.description || 'Unknown food';
      const tag = classifyFiberType(description);

      return {
        fdcId: food.fdcId,
        description,
        dataType: food.dataType,
        foodNutrients: food.foodNutrients || [],
        foodPortions: food.foodPortions || [],
        servingSize: food.servingSize,
        servingSizeUnit: food.servingSizeUnit,
        fiberGrams: Math.round(fiberValue * 10) / 10,
        tag,
      };
    });

    // Cache the successful results
    await StorageService.setCachedUSDAResults(trimmed, results);
    return results;
  } catch (error) {
    console.warn('Network error querying USDA API:', error);
    return filterOfflineFallbacks(trimmed);
  }
}

function filterOfflineFallbacks(query: string): USDASearchItem[] {
  const q = query.toLowerCase();
  const matched = COMMON_HIGH_FIBER_FOODS.filter((item) =>
    item.description.toLowerCase().includes(q)
  );
  if (matched.length > 0) return matched;
  return COMMON_HIGH_FIBER_FOODS.slice(0, 6);
}
