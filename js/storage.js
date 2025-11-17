// storage.js - LocalStorage Management

const Storage = {
  // Keys
  KEYS: {
    API_KEY: "geminiApiKey",
    FRIDGE_ITEMS: "fridgeItems",
    BOOKMARKED_RECIPES: "bookmarkedRecipes",
    DIET_TYPE: "dietType",
    GENERATED_RECIPES: "generatedRecipes",
  },

  // Initialize storage with defaults
  init() {
    if (!this.get(this.KEYS.FRIDGE_ITEMS)) {
      this.set(this.KEYS.FRIDGE_ITEMS, []);
    }
    if (!this.get(this.KEYS.BOOKMARKED_RECIPES)) {
      this.set(this.KEYS.BOOKMARKED_RECIPES, []);
    }
    if (!this.get(this.KEYS.DIET_TYPE)) {
      this.set(this.KEYS.DIET_TYPE, "Normal");
    }
    if (!this.get(this.KEYS.GENERATED_RECIPES)) {
      this.set(this.KEYS.GENERATED_RECIPES, []);
    }
  },

  // Generic get
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error("Error reading from localStorage:", e);
      return null;
    }
  },

  // Generic set
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Error writing to localStorage:", e);
      return false;
    }
  },

  // API Key methods
  getApiKey() {
    return this.get(this.KEYS.API_KEY);
  },

  setApiKey(key) {
    return this.set(this.KEYS.API_KEY, key);
  },

  // Fridge Items methods
  getFridgeItems() {
    return this.get(this.KEYS.FRIDGE_ITEMS) || [];
  },

  addFridgeItem(item) {
    const items = this.getFridgeItems();
    if (!items.includes(item.toLowerCase())) {
      items.push(item.toLowerCase());
      return this.set(this.KEYS.FRIDGE_ITEMS, items);
    }
    return false;
  },

  removeFridgeItem(item) {
    const items = this.getFridgeItems();
    const filtered = items.filter((i) => i !== item.toLowerCase());
    return this.set(this.KEYS.FRIDGE_ITEMS, filtered);
  },

  clearFridgeItems() {
    return this.set(this.KEYS.FRIDGE_ITEMS, []);
  },

  // Bookmarked Recipes methods
  getBookmarkedRecipes() {
    return this.get(this.KEYS.BOOKMARKED_RECIPES) || [];
  },

  bookmarkRecipe(recipe) {
    const recipes = this.getBookmarkedRecipes();
    // Check if already bookmarked
    if (!recipes.find((r) => r.id === recipe.id)) {
      recipe.bookmarked = true;
      recipe.bookmarkedAt = new Date().toISOString();
      recipes.unshift(recipe);
      return this.set(this.KEYS.BOOKMARKED_RECIPES, recipes);
    }
    return false;
  },

  unbookmarkRecipe(recipeId) {
    const recipes = this.getBookmarkedRecipes();
    const filtered = recipes.filter((r) => r.id !== recipeId);
    return this.set(this.KEYS.BOOKMARKED_RECIPES, filtered);
  },

  isRecipeBookmarked(recipeId) {
    const recipes = this.getBookmarkedRecipes();
    return recipes.some((r) => r.id === recipeId);
  },

  // Diet Type methods
  getDietType() {
    return this.get(this.KEYS.DIET_TYPE) || "Normal";
  },

  setDietType(type) {
    const validTypes = ["Keto", "Vegan", "Weightloss", "Bulking", "Normal"];
    if (validTypes.includes(type)) {
      return this.set(this.KEYS.DIET_TYPE, type);
    }
    return false;
  },

  // Generated Recipes (temporary storage)
  getGeneratedRecipes() {
    return this.get(this.KEYS.GENERATED_RECIPES) || [];
  },

  setGeneratedRecipes(recipes) {
    return this.set(this.KEYS.GENERATED_RECIPES, recipes);
  },

  addGeneratedRecipes(recipes) {
    const existing = this.getGeneratedRecipes();
    const updated = [...existing, ...recipes];
    return this.set(this.KEYS.GENERATED_RECIPES, updated);
  },

  clearGeneratedRecipes() {
    return this.set(this.KEYS.GENERATED_RECIPES, []);
  },
};

// Initialize on load
Storage.init();
