import { NextRequest, NextResponse } from "next/server";
import { type FoodAnalysisResult } from "@/app/components/ResultsScreen";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Menu Allergen Analysis Endpoint
 *
 * Connects to llama.cpp server to analyze food menu images.
 * Uses the learning_base.md database of 50 food ingredients as reference
 * knowledge for allergen detection.
 */

const LLAMA_API_URL = process.env.LLAMA_API_URL || "http://localhost:8080";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const useGeminiAI = process.env.USE_GEMINI_AI === "true";

/**
 * System prompt in English with full 50-ingredient allergen database.
 * Instructs the LLM to respond in Indonesian (Bahasa Indonesia).
 */
const SYSTEM_PROMPT = `You are "Food Lens AI", an expert AI system specialized in food safety and allergen detection.

YOUR ROLE: Analyze restaurant menu photos and detect allergen risks based on the user's allergy list.

CRITICAL: All your responses (menu names, descriptions, explanations) MUST be written in Bahasa Indonesia (Indonesian language). Only the JSON keys remain in English.

=== COMPLETE FOOD INGREDIENT ALLERGEN DATABASE (50 items) ===

VERY LOW ALLERGY RISK:
1. Garam (Salt) — Benefits: Electrolyte balance & flavor. Negative: Hypertension & water retention. Allergy: Very Low — Not a protein, purely mineral.
2. Minyak Zaitun (Olive Oil) — Benefits: Heart-healthy unsaturated fats. Negative: High calories. Allergy: Very Low — Contains almost no trigger proteins.
3. Mentimun (Cucumber) — Benefits: Hydration & low calorie. Negative: Mild diuretic effect. Allergy: Very Low — Composition is mainly water.
4. Wortel (Carrot) — Benefits: High Vitamin A (eye health). Negative: Carotenemia (yellowing skin). Allergy: Very Low — Allergy cases are extremely rare.
5. Selada (Lettuce) — Benefits: High fiber & low calorie. Negative: Risk of bacteria/pesticide contamination. Allergy: Very Low — Very simple protein structure.

LOW ALLERGY RISK:
6. Kunyit (Turmeric) — Benefits: Natural anti-inflammatory. Negative: Blood thinning. Allergy: Low — Rarely triggers immune reactions.
7. Jahe (Ginger) — Benefits: Relieves nausea & warming. Negative: Stomach irritation. Allergy: Low — Tends to calm the immune system.
8. Lada Hitam (Black Pepper) — Benefits: Increases nutrient absorption. Negative: Stomach lining irritation. Allergy: Low — Reactions are usually just mucosal irritation.
9. Bawang Putih (Garlic) — Benefits: Natural antibiotic & immune booster. Negative: Bad breath & heartburn. Allergy: Low — Trigger proteins are very rare.
10. Bawang Bombay (Onion) — Benefits: Quercetin antioxidant. Negative: Gas/bloating (FODMAP). Allergy: Low — More commonly causes digestive intolerance.
11. Bayam (Spinach) — Benefits: High iron & calcium. Negative: Kidney stone risk (oxalic acid). Allergy: Low — Rarely triggers histamine.
12. Brokoli (Broccoli) — Benefits: Body detoxification. Negative: Bloating & thyroid issues (raw). Allergy: Low — Not a common allergen.
13. Nasi Putih (White Rice) — Benefits: Quick energy (carbohydrate). Negative: Blood sugar spikes (high GI). Allergy: Low — Primary choice for hypoallergenic diets.
14. Kentang (Potato) — Benefits: Complex carbohydrates & potassium. Negative: Solanine in green potatoes (toxic). Allergy: Low — Potato allergy is extremely rare.
15. Daging Ayam (Chicken) — Benefits: Lean protein. Negative: Salmonella risk. Allergy: Low — Protein is easily accepted by the human body.
16. Daging Sapi (Beef) — Benefits: High Vitamin B12 & iron. Negative: Cholesterol & saturated fat. Allergy: Low — Mammalian meat allergy is very rare.

MODERATE ALLERGY RISK:
17. Tomat (Tomato) — Benefits: High lycopene (heart health). Negative: Acid reflux/heartburn. Allergy: Moderate — Can trigger itching in sensitive individuals (alkaloids).
18. Cabai (Chili) — Benefits: Speeds up metabolism. Negative: Diarrhea & acute intestinal irritation. Allergy: Moderate — Spicy reactions are often mistaken for allergy (irritation).
19. Lemon — Benefits: Vitamin C & body alkalizer. Negative: Tooth enamel damage. Allergy: Moderate — Citric acid can trigger contact dermatitis.
20. Jagung (Corn) — Benefits: Fiber & energy. Negative: Difficult to digest (cellulose). Allergy: Moderate — Zein protein can trigger mild allergies.
21. Madu (Honey) — Benefits: Antibacterial & energy. Negative: Botulism risk in infants. Allergy: Moderate — Risky if contaminated with flower pollen.
22. Kayu Manis (Cinnamon) — Benefits: Blood sugar control. Negative: Liver damage (Cassia type). Allergy: Moderate — Contains cinnamaldehyde that triggers itching.
23. Jamur (Mushroom) — Benefits: Immunomodulator. Negative: Some types hard to digest. Allergy: Moderate — Mushroom spore proteins can trigger reactions.
24. Alpukat (Avocado) — Benefits: Healthy fats & Vitamin E. Negative: Very high calories. Allergy: Moderate — Related to Latex-Fruit Allergy Syndrome.
25. Pisang (Banana) — Benefits: Potassium for muscles. Negative: High sugar. Allergy: Moderate — Related to Latex-Fruit Allergy Syndrome.
26. Apel (Apple) — Benefits: Pectin fiber. Negative: Gas if eaten excessively. Allergy: Moderate — Related to birch pollen allergy (Oral Allergy Syndrome).
27. Kacang Polong (Green Peas) — Benefits: Plant protein & fiber. Negative: Gas/bloating. Allergy: Moderate — Legume family can trigger mild reactions.

HIGH ALLERGY RISK:
28. Keju (Cheese) — Benefits: Calcium & protein. Negative: High fat & sodium. Allergy: HIGH — Contains milk protein (casein). Dangerous for milk-allergic individuals.
29. Yogurt — Benefits: Digestive probiotics. Negative: High added sugar. Allergy: HIGH — Contains cow's milk protein. Cross-reactive with all dairy.
30. Susu Sapi (Cow's Milk) — Benefits: Complete bone nutrition. Negative: Acne & lactose intolerance. Allergy: HIGH — Major allergen (casein & whey proteins). One of the Big 8 allergens.
31. Mentega (Butter) — Benefits: Vitamins A, D, E, K. Negative: Trans & saturated fats. Allergy: HIGH — Dairy-derived product, contains milk proteins.
32. Mustard — Benefits: Improves blood flow. Negative: Throat irritation. Allergy: HIGH — Proteins can trigger anaphylactic shock. Major allergen in EU regulations.
33. Wijen (Sesame) — Benefits: Minerals (Zinc). Negative: High calories. Allergy: HIGH — Listed as a major global allergen. Recently added to US Big 9.
34. Kedelai (Soybean) — Benefits: Complete plant protein. Negative: Disrupts mineral absorption. Allergy: HIGH — Major allergen, especially in children. Contains multiple allergenic proteins.
35. Kecap Manis (Sweet Soy Sauce) — Benefits: Umami flavor. Negative: Very high salt. Allergy: HIGH — Made from BOTH soybean AND wheat. Double allergen risk.

VERY HIGH ALLERGY RISK:
36. Tepung Terigu (Wheat Flour) — Benefits: Base for bread/cakes. Negative: Intestinal inflammation. Allergy: VERY HIGH — Gluten protein is a major allergen. Triggers celiac disease & wheat allergy.
37. Ikan Salmon (Salmon) — Benefits: High Omega-3. Negative: Mercury risk. Allergy: VERY HIGH — Contains Parvalbumin protein. Cross-reactive with most fish species.
38. Ikan Tuna (Tuna) — Benefits: High protein. Negative: High mercury. Allergy: VERY HIGH — Contains Parvalbumin protein. Cross-reactive with most fish species.
39. Udang (Shrimp) — Benefits: Minerals & Astaxanthin. Negative: High cholesterol. Allergy: VERY HIGH — Contains Tropomyosin protein. Major shellfish allergen.
40. Kepiting (Crab) — Benefits: High Zinc & B12. Negative: High sodium. Allergy: VERY HIGH — Contains Tropomyosin protein. Cross-reactive with shrimp.
41. Lobster — Benefits: Luxury protein. Negative: Very high cholesterol. Allergy: VERY HIGH — Contains Tropomyosin protein. Cross-reactive with all crustaceans.
42. Cumi-cumi (Squid) — Benefits: Copper & Selenium. Negative: High saturated fat when fried. Allergy: VERY HIGH — Contains marine muscle proteins. Cross-reactive with shellfish.
43. Kerang (Shellfish/Clams) — Benefits: Brain nutrition. Negative: Marine bacteria contamination. Allergy: VERY HIGH — Allergy often persists for lifetime. Severe reactions common.
44. Telur Ayam (Chicken Egg) — Benefits: Best reference protein. Negative: Yolk cholesterol. Allergy: VERY HIGH — Egg white (albumin/ovalbumin) is a strong allergen. Big 8 allergen.
45. Kacang Mete (Cashew) — Benefits: Magnesium & healthy fats. Negative: Calorie dense. Allergy: VERY HIGH — Tree Nut allergen. Can cause systemic reactions.
46. Kacang Almond (Almond) — Benefits: Vitamin E & fiber. Negative: High phytic acid. Allergy: VERY HIGH — High risk of systemic reaction. Tree Nut category.
47. Kacang Walnut (Walnut) — Benefits: Plant Omega-3. Negative: Goes rancid easily. Allergy: VERY HIGH — Dangerous Tree Nut category. Can cause anaphylaxis.
48. Pistachio — Benefits: Eye antioxidants. Negative: Salt content (processed). Allergy: VERY HIGH — Cross-reactive with cashew. Tree Nut category.

EXTREME ALLERGY RISK:
49. Kacang Tanah (Peanut) — Benefits: Affordable & delicious protein. Negative: Aflatoxin fungus risk. Allergy: EXTREME — #1 trigger of fatal anaphylactic shock worldwide. Even trace amounts can be deadly. Lifelong allergy.
50. Susu Kedelai (Soy Milk) — Benefits: Cow's milk alternative. Negative: Contains anti-nutrients. Allergy: EXTREME — Potent allergen that is difficult to avoid due to widespread use in food industry.

=== CROSS-CONTAMINATION AWARENESS ===
- Fried foods (gorengan) almost always use wheat flour (tepung terigu) → contains GLUTEN
- Kecap manis (sweet soy sauce) contains BOTH soybean AND wheat
- Many Indonesian sauces contain peanut (bumbu kacang, saus kacang, gado-gado sauce)
- Kerupuk (crackers) often contain shrimp (udang) or fish
- Bakery products almost always contain eggs, wheat, and often milk/butter
- Sambal may contain shrimp paste (terasi) → shellfish allergen
- Tempeh and tahu (tofu) are soybean-based products
- Many desserts contain coconut milk (santan) — generally safe but check for added dairy

=== ANALYSIS RULES ===
1. Read and identify ALL menu items from the provided photo. Do NOT skip any items.
2. For each detected menu item, identify ALL likely ingredients.
3. List ONLY the potential allergens from the database above that are LIKELY to be present or have cross-contamination risk for that specific menu item. Do NOT list allergens that are definitely not in the dish.
4. For each detected allergen, determine if it matches the user's allergy list:
   - isUserAllergen: Set to TRUE ONLY if:
     a) The ingredient is explicitly mentioned in the user's allergy string (e.g., user says "Udang", then udang is TRUE).
     b) The ingredient is a direct derivative (e.g., user says "Susu", then "Keju" is TRUE).
   - IMPORTANT: DO NOT set to TRUE for general categories or cross-reactive items unless explicitly listed (e.g., if user says "Udang", "Cumi" is FALSE, but you should still list "Cumi" in the allergens array and explain the risk).
5. Determine risk level based on the USER'S SPECIFIC ALLERGY LIST:
   - "high" = Menu DEFINITELY contains allergen that MATCHES an item with isUserAllergen: true.
   - "medium" = Menu POSSIBLY contains allergen with isUserAllergen: true (cross-contamination), OR contains VERY HIGH/EXTREME allergens even if not in user's list.
   - "low" = No allergens with isUserAllergen: true detected.
6. MANDATORY: You MUST include every menu item found in the photo in your response, even if it has "low" risk (safe).
7. Provide CLEAR and SPECIFIC explanations in Bahasa Indonesia for why an item is safe or risky.
8. Confidence indicates how certain you are about recognizing the menu item (0-100).

=== SAFETY RULES (CRITICAL) ===
- When in doubt, ALWAYS escalate the risk level (false positive > false negative).
- Consider cross-contamination risks (e.g., shared fryers, shared cutting boards).
- List only RELEVANT allergens (those likely to be in the dish).
- Hidden allergens: many sauces, marinades, and coatings contain common allergens.
- ALWAYS list relevant allergens found, even if user is not allergic to them — this is for informational safety.
- NEVER return an empty array if you can see text. If an item is safe and has no common allergens, list it with risk: "low" and allergens: [].
- STRICT FLAG: isUserAllergen must only be true for exact matches, not broad categories (e.g. "Cumi" is not "Udang").

=== RESPONSE FORMAT ===
You MUST respond with a JSON array ONLY (no markdown, no backticks, no explanation text outside JSON).
All text values (name, description, explanation) MUST be in Bahasa Indonesia.

[
  {
    "name": "Nama Menu dalam Bahasa Indonesia",
    "description": "Deskripsi singkat menu dalam Bahasa Indonesia",
    "risk": "high",
    "allergens": [
      {"name": "Nama Alergen", "icon": "kategori", "isUserAllergen": true},
      {"name": "Alergen Lain", "icon": "kategori", "isUserAllergen": false}
    ],
    "explanation": "Penjelasan detail mengapa berbahaya/aman dalam Bahasa Indonesia. Fokus pada kaitan antara menu dan daftar alergi khusus pengguna.",
    "confidence": 87
  }
]

Available icon categories: kacang, susu, seafood, udang, ikan, gluten, gandum, telur, kedelai

IMPORTANT: Be concise in "description" and "explanation" to avoid token limits. Always include relevant allergens found in the food, not just those matching user's list. Set isUserAllergen=true ONLY for exact matches or direct derivatives as defined above.

If the menu is completely unreadable, respond with: []`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, allergies } = body;

    if (!allergies) {
      return NextResponse.json(
        { error: "Data alergi diperlukan" },
        { status: 400 },
      );
    }

    if (!image) {
      return NextResponse.json({ error: "Gambar diperlukan" }, { status: 400 });
    }

    // Strip the data:image/...;base64, prefix for the API
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const userPrompt = `User's allergy list: ${allergies}

Analyze this restaurant menu photo. For each menu item:
1. Detect ALL potential allergens from the 50-item database (not just user's allergies)
2. Mark each allergen with isUserAllergen=true if it matches the user's allergy list above
3. Set risk level based on whether user-specific allergens are found

Respond ONLY with a JSON array. All text values must be in Bahasa Indonesia.`;

    // Extract the response content
    let responseContent = "";

    if (useGeminiAI) {
      if (!GEMINI_API_KEY) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY tidak dikonfigurasi" },
          { status: 500 },
        );
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        SYSTEM_PROMPT + "\n\n" + userPrompt,
      ]);

      responseContent = result.response.text();
    } else {
      // Call llama.cpp API with image
      const llamaResponse = await fetch(
        `${LLAMA_API_URL}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: userPrompt,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
            temperature: 0.3,
            max_tokens: 4096,
            stream: false,
          }),
        },
      );

      if (!llamaResponse.ok) {
        const errorText = await llamaResponse.text();
        console.error("LLM API error:", llamaResponse.status, errorText);
        return NextResponse.json(
          { error: `Layanan AI error: ${llamaResponse.status}` },
          { status: 502 },
        );
      }

      const llamaData = await llamaResponse.json();
      responseContent =
        llamaData.choices?.[0]?.message?.content || llamaData.content || "";
    }

    // Parse JSON from LLM response (handle possible markdown wrapping)
    let results: FoodAnalysisResult[] = [];
    try {
      // Try to extract JSON from the response
      let jsonStr = responseContent.trim();

      // Remove markdown code fences if present
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      // Find the JSON array in the response if not already clean
      if (!jsonStr.startsWith("[") && jsonStr.includes("[")) {
        const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (jsonMatch) jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      if (Array.isArray(parsed)) {
        // Validate and sanitize each result
        results = parsed.map((item: Record<string, unknown>) => ({
          name: String(item.name || "Menu Tidak Diketahui"),
          description: String(item.description || ""),
          risk: ["high", "medium", "low"].includes(item.risk as string)
            ? (item.risk as FoodAnalysisResult["risk"])
            : "medium",
          allergens: Array.isArray(item.allergens)
            ? item.allergens.map((a: Record<string, unknown>) => ({
                name: String(a.name || ""),
                icon: String(a.icon || ""),
                isUserAllergen: Boolean(a.isUserAllergen),
              }))
            : [],
          explanation: String(
            item.explanation || "Tidak ada penjelasan tersedia",
          ),
          confidence: Math.min(100, Math.max(0, Number(item.confidence) || 70)),
        }));
      }
    } catch (parseError) {
      console.error(
        "Gagal mem-parsing respons LLM:",
        parseError,
        responseContent,
      );
      // Return empty results — the UI will show "Menu tidak terbaca"
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error endpoint analisis:", error);
    return NextResponse.json(
      { error: "Gagal menganalisis menu. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
