// gemini.js - Gemini AI Integration

const Gemini = {
  // Available Gemini models
  MODELS: {
    "gemini-2.5-flash-lite": "Gemini 2.5 Flash-Lite (Ultra Fast, Recommended)",
    "gemini-2.5-flash": "Gemini 2.5 Flash (Fast & Intelligent)",
    "gemini-2.5-pro": "Gemini 2.5 Pro (Most Advanced)",
    "gemini-2.0-flash": "Gemini 2.0 Flash (Second Generation)",
    "gemini-2.0-flash-exp": "Gemini 2.0 Flash Experimental",
  },

  // Get API endpoint for selected model
  getApiEndpoint() {
    const model = Storage.getModel() || "gemini-2.5-flash-lite";
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  },

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

  // Define JSON schema for specific recipe with alternatives
  getSpecificRecipeSchema() {
    return {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the recipe",
        },
        mealType: {
          type: "string",
          description: "Type of meal (breakfast, lunch, dinner, snack)",
        },
        calories: {
          type: "integer",
          description: "Estimated calories per serving",
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: {
                type: "string",
                description: "Ingredient with amount",
              },
              inFridge: {
                type: "boolean",
                description:
                  "Whether this ingredient is available in the user's fridge",
              },
              alternative: {
                type: "string",
                description:
                  "Alternative ingredient suggestion if not in fridge (optional)",
              },
            },
            required: ["item", "inFridge"],
          },
          description: "List of ingredients with fridge availability",
        },
        instructions: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Step-by-step cooking instructions with timing",
        },
      },
      required: ["name", "mealType", "calories", "ingredients", "instructions"],
    };
  },

  // Common API call method
  async callGeminiAPI(prompt, schema, temperature = 0.9) {
    const apiKey = Storage.getApiKey();

    if (!apiKey) {
      throw new Error("Please set your Gemini API key in the BYOK page");
    }

    if (!navigator.onLine) {
      throw new Error(
        "You are offline. Recipe generation requires internet connection.",
      );
    }

    try {
      const response = await fetch(`${this.getApiEndpoint()}?key=${apiKey}`, {
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
            temperature,
            maxOutputTokens: 8000,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to generate content");
      }

      const data = await response.json();

      // With structured output, the response is already valid JSON
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  // Generate recipes using Gemini API
  async generateRecipes(mealType, count = 10, servings = 2) {
    const fridgeItems = Storage.getFridgeItems();
    const dietType = Storage.getDietType();

    const prompt = this.buildPrompt(
      mealType,
      fridgeItems,
      dietType,
      count,
      servings,
    );

    const jsonResponse = await this.callGeminiAPI(
      prompt,
      this.getRecipeSchema(),
      0.9,
    );

    // Extract recipes array from structured response
    return this.parseRecipes(jsonResponse.recipes, mealType, servings);
  },

  // Generate a specific recipe by name with fridge comparison
  async generateSpecificRecipe(recipeName, servings = 2) {
    const fridgeItems = Storage.getFridgeItems();
    const dietType = Storage.getDietType();

    const prompt = this.buildSpecificRecipePrompt(
      recipeName,
      fridgeItems,
      dietType,
      servings,
    );

    const jsonResponse = await this.callGeminiAPI(
      prompt,
      this.getSpecificRecipeSchema(),
      0.7,
    );

    // Parse the specific recipe
    return this.parseSpecificRecipe(jsonResponse, servings);
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

  // Build the prompt for a specific recipe
  buildSpecificRecipePrompt(recipeName, fridgeItems, dietType, servings) {
    const fridgeList =
      fridgeItems.length > 0
        ? `Available ingredients in user's fridge: ${fridgeItems.join(", ")}`
        : "No ingredients in fridge";

    return `You are a professional chef and nutritionist. Generate a detailed recipe for "${recipeName}" for ${servings} servings.

Requirements:
- Recipe name: ${recipeName}
- Diet type: ${dietType}
- Servings: ${servings} people
- ${fridgeList}
- Include calorie estimate per serving
- Provide detailed step-by-step instructions with timing

IMPORTANT - Ingredient Analysis:
For each ingredient in the recipe, you must:
1. Check if the ingredient (or a close variant) is available in the user's fridge
2. Set "inFridge" to true if available, false if not
3. If the ingredient is NOT in the fridge, provide a reasonable alternative in the "alternative" field
4. If the ingredient IS in the fridge, you can leave "alternative" empty or null

Example:
- If recipe needs "chicken breast" and fridge has "chicken", mark inFridge: true
- If recipe needs "olive oil" and it's not in fridge, suggest alternative: "vegetable oil or butter"
- If recipe needs "tomatoes" and fridge has "tomatoes", mark inFridge: true

Make the recipe delicious and appropriate for the ${dietType} diet. All ingredient quantities should be adjusted for ${servings} servings. Include specific amounts for ingredients (e.g., "2 cups flour", "1 tbsp olive oil") and detailed cooking instructions with timing and visual cues.`;
  },

  // Parse recipes from AI response
  parseRecipes(recipesArray, mealType, servings) {
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
        servings: servings || 1,
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

  // Parse specific recipe from AI response
  parseSpecificRecipe(recipeData, servings) {
    try {
      if (!recipeData || !recipeData.name) {
        throw new Error("Invalid recipe format received from API");
      }

      // Convert ingredients array to the format expected by the UI
      const ingredientsWithAlternatives = recipeData.ingredients || [];

      return {
        id: `recipe-${Date.now()}`,
        name: recipeData.name,
        mealType: recipeData.mealType || "dinner",
        servings: servings || 1,
        calories: recipeData.calories || 0,
        ingredients: ingredientsWithAlternatives,
        instructions: recipeData.instructions || [],
        dietType: Storage.getDietType(),
        bookmarked: false,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error parsing specific recipe:", error);
      throw new Error(
        "Failed to parse recipe from AI response. Please try again.",
      );
    }
  },

  // Check if API key is set
  hasApiKey() {
    return !!Storage.getApiKey();
  },
};
