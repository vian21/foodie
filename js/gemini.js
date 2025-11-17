// gemini.js - Gemini AI Integration

const Gemini = {
  API_ENDPOINT:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",

  // Generate recipes using Gemini API
  async generateRecipes(mealType, count = 10) {
    const apiKey = Storage.getApiKey();

    if (!apiKey) {
      throw new Error("Please set your Gemini API key in the BYOK page");
    }

    if (!navigator.onLine) {
      throw new Error(
        "You are offline. Recipe generation requires internet connection.",
      );
    }

    const fridgeItems = Storage.getFridgeItems();
    const dietType = Storage.getDietType();

    const prompt = this.buildPrompt(mealType, fridgeItems, dietType, count);

    try {
      const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 8000,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to generate recipes");
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Parse the JSON response
      const recipes = this.parseRecipes(text, mealType);

      return recipes;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  // Build the prompt for Gemini
  buildPrompt(mealType, fridgeItems, dietType, count) {
    const fridgeList =
      fridgeItems.length > 0
        ? `Available ingredients in fridge: ${fridgeItems.join(", ")}`
        : "No specific ingredients available (suggest common ingredients)";

    return `You are a professional chef and nutritionist. Generate ${count} unique ${mealType} recipes.

Requirements:
- Meal type: ${mealType}
- Diet type: ${dietType}
- ${fridgeList}
- Include calorie estimates for each recipe
- Provide detailed step-by-step instructions
- Include cooking times and important observations (e.g., "wait until potatoes are soft")

Please respond with ONLY a valid JSON array in this exact format:
[
  {
    "name": "Recipe Name",
    "calories": 450,
    "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
    "instructions": ["Step 1 with details, timing and observations", "Step 2"]
  }
]

Make the recipes creative, delicious, and appropriate for the ${dietType} diet. Include specific amounts for ingredients and detailed cooking instructions with timing and visual cues.`;
  },

  // Parse recipes from AI response
  parseRecipes(text, mealType) {
    try {
      // Try to extract JSON from the response
      let jsonText = text;

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

      // Find JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const recipes = JSON.parse(jsonText);

      // Add metadata to each recipe
      return recipes.map((recipe, index) => ({
        id: `recipe-${Date.now()}-${index}`,
        name: recipe.name,
        mealType: mealType,
        calories: recipe.calories || 0,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        dietType: Storage.getDietType(),
        bookmarked: false,
        generatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error parsing recipes:", error);
      console.log("Raw response:", text);
      throw new Error(
        "Failed to parse recipes from AI response. Please try again.",
      );
    }
  },

  // Check if API key is set
  hasApiKey() {
    return !!Storage.getApiKey();
  },
};
