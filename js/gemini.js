// gemini.js - Gemini AI Integration

const Gemini = {
  API_ENDPOINT:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

  // Define JSON schema for structured output
  getRecipeSchema() {
    return {
      type: "object",
      properties: {
        recipes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the recipe",
              },
              calories: {
                type: "integer",
                description: "Estimated calories for the recipe",
              },
              ingredients: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "List of ingredients with amounts",
              },
              instructions: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "Step-by-step cooking instructions with timing and observations",
              },
            },
            required: ["name", "calories", "ingredients", "instructions"],
          },
        },
      },
      required: ["recipes"],
    };
  },

  // Generate recipes using Gemini API
  async generateRecipes(mealType, count = 10, servings = 2) {
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

    const prompt = this.buildPrompt(
      mealType,
      fridgeItems,
      dietType,
      count,
      servings,
    );

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
            responseMimeType: "application/json",
            responseSchema: this.getRecipeSchema(),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to generate recipes");
      }

      const data = await response.json();

      // With structured output, the response is already valid JSON
      const text = data.candidates[0].content.parts[0].text;
      const jsonResponse = JSON.parse(text);

      // Extract recipes array from structured response
      const recipes = this.parseRecipes(jsonResponse.recipes, mealType);

      return recipes;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  // Build the prompt for Gemini
  buildPrompt(mealType, fridgeItems, dietType, count, servings) {
    const fridgeList =
      fridgeItems.length > 0
        ? `Available ingredients in fridge: ${fridgeItems.join(", ")}`
        : "No specific ingredients available (suggest common ingredients)";

    return `You are a professional chef and nutritionist. Generate ${count} unique ${mealType} recipes for ${servings} servings.

Requirements:
- Meal type: ${mealType}
- Diet type: ${dietType}
- Servings: ${servings} people
- ${fridgeList}
- Include calorie estimates per serving
- Provide detailed step-by-step instructions
- Include cooking times and important observations (e.g., "wait until potatoes are soft")

Make the recipes creative, delicious, and appropriate for the ${dietType} diet. All ingredient quantities should be adjusted for ${servings} servings. Include specific amounts for ingredients (e.g., "2 cups flour", "1 tbsp olive oil") and detailed cooking instructions with timing and visual cues (e.g., "Cook for 5 minutes until golden brown").`;
  },

  // Parse recipes from AI response
  parseRecipes(recipesArray, mealType) {
    try {
      // With structured output, we receive a clean array of recipes
      if (!Array.isArray(recipesArray)) {
        throw new Error("Invalid recipes format received from API");
      }

      // Add metadata to each recipe
      return recipesArray.map((recipe, index) => ({
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
