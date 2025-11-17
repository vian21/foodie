// app.js - Main Application Logic and Routing

const App = {
  currentRecipes: [],

  // Initialize app
  init() {
    this.setupNavigation();
    this.setupHamburgerMenu();
    this.route();

    // Listen for hash changes
    window.addEventListener("hashchange", () => this.route());
  },

  // Setup navigation
  setupNavigation() {
    document.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        document.getElementById("mobile-menu").classList.add("hidden");
      });
    });
  },

  // Setup hamburger menu
  setupHamburgerMenu() {
    document.getElementById("hamburger").addEventListener("click", () => {
      const menu = document.getElementById("mobile-menu");
      menu.classList.toggle("hidden");
    });
  },

  // Router
  route() {
    const hash = window.location.hash.slice(1) || "home";
    const contentArea = document.getElementById("app-content");

    // Close mobile menu
    document.getElementById("mobile-menu").classList.add("hidden");

    // Update active navigation link
    this.updateActiveNav(hash);

    // Route to appropriate page
    switch (hash) {
      case "home":
        this.renderHome(contentArea);
        break;
      case "recipes":
        this.renderRecipes(contentArea);
        break;
      case "fridge":
        this.renderFridge(contentArea);
        break;
      case "byok":
        this.renderBYOK(contentArea);
        break;
      case "settings":
        this.renderSettings(contentArea);
        break;
      case "about":
        this.renderAbout(contentArea);
        break;
      default:
        this.renderHome(contentArea);
    }
  },

  // Update active navigation link
  updateActiveNav(currentPage) {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current page link
    const activeLink = document.querySelector(
      `.nav-link[data-page="${currentPage}"]`,
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  },

  // Home Page
  renderHome(container) {
    const hasApiKey = Gemini.hasApiKey();
    const recipes = Storage.getGeneratedRecipes();
    this.currentRecipes = recipes;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Generate Recipes</h2>
          <p class="text-gray-600">Choose a meal type and let AI create recipes for you</p>
        </div>
        
        ${!hasApiKey ? Components.alert("Please set your Gemini API key in the BYOK page to generate recipes.", "warning") : ""}
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
          <select id="meal-type" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          
          <button id="generate-btn" 
                  class="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors ${!hasApiKey ? "opacity-50 cursor-not-allowed" : ""}"
                  ${!hasApiKey ? "disabled" : ""}>
            Generate 10 Recipes
          </button>
        </div>
        
        <div id="recipes-container">
          ${recipes.length > 0 ? this.renderRecipesList(recipes) : ""}
        </div>
      </div>
    `;

    // Setup generate button
    if (hasApiKey) {
      document.getElementById("generate-btn").addEventListener("click", () => {
        this.generateRecipes(false);
      });
    }
  },

  // Render recipes list
  renderRecipesList(recipes) {
    if (recipes.length === 0) {
      return Components.emptyState(
        '<svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
        "No recipes yet",
        "Generate some recipes to get started!",
      );
    }

    return `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800">${recipes.length} Recipes Generated</h3>
          <button onclick="App.generateRecipes(true)" 
                  class="bg-emerald-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700">
            Generate More
          </button>
        </div>
        ${recipes.map((recipe) => Components.recipeCard(recipe)).join("")}
      </div>
    `;
  },

  // Generate recipes
  async generateRecipes(addMore = false) {
    const mealType = document.getElementById("meal-type").value;
    const container = document.getElementById("recipes-container");

    container.innerHTML = Components.loadingSpinner(
      "Generating delicious recipes...",
    );

    try {
      const newRecipes = await Gemini.generateRecipes(mealType, 10);

      if (addMore) {
        Storage.addGeneratedRecipes(newRecipes);
      } else {
        Storage.setGeneratedRecipes(newRecipes);
      }

      this.currentRecipes = Storage.getGeneratedRecipes();
      container.innerHTML = this.renderRecipesList(this.currentRecipes);
    } catch (error) {
      container.innerHTML = Components.alert(error.message, "error");
    }
  },

  // Recipes Page (Bookmarked)
  renderRecipes(container) {
    const bookmarked = Storage.getBookmarkedRecipes();

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">My Recipes</h2>
          <p class="text-gray-600">Your bookmarked recipes</p>
        </div>
        
        ${
          bookmarked.length === 0
            ? Components.emptyState(
                '<svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>',
                "No bookmarked recipes",
                "Star recipes from the home page to save them here!",
                '<a href="#home" class="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-700">Go to Home</a>',
              )
            : bookmarked.map((recipe) => Components.recipeCard(recipe)).join("")
        }
      </div>
    `;
  },

  // Fridge Page
  renderFridge(container) {
    const items = Storage.getFridgeItems();

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">My Fridge</h2>
          <p class="text-gray-600">Manage your available ingredients</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <form id="add-item-form" class="flex space-x-2">
            <input type="text" 
                   id="fridge-item-input" 
                   placeholder="Add ingredient (e.g., chicken breast)"
                   class="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                   required>
            <button type="submit" 
                    class="bg-emerald-600 text-white font-bold px-6 rounded-lg hover:bg-emerald-700">
              Add
            </button>
          </form>
        </div>
        
        <div id="fridge-items">
          ${
            items.length === 0
              ? Components.emptyState(
                  '<svg class="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
                  "Your fridge is empty",
                  "Add ingredients to help AI generate better recipes!",
                )
              : `<div class="space-y-2">${items.map((item) => Components.fridgeItem(item)).join("")}</div>`
          }
        </div>
      </div>
    `;

    // Setup form
    document.getElementById("add-item-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addFridgeItem();
    });
  },

  // Add fridge item
  addFridgeItem() {
    const input = document.getElementById("fridge-item-input");
    const item = input.value.trim();

    if (item) {
      const success = Storage.addFridgeItem(item);
      if (success) {
        input.value = "";
        this.renderFridge(document.getElementById("app-content"));
      } else {
        alert("This item is already in your fridge!");
      }
    }
  },

  // Remove fridge item
  removeFridgeItem(item) {
    Storage.removeFridgeItem(item);
    this.renderFridge(document.getElementById("app-content"));
  },

  // BYOK Page
  renderBYOK(container) {
    const apiKey = Storage.getApiKey() || "";

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Bring Your Own Key</h2>
          <p class="text-gray-600">Enter your Gemini API key</p>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p class="text-sm text-gray-700 mb-2">
            <strong>How to get your API key:</strong>
          </p>
          <ol class="text-sm text-gray-700 list-decimal list-inside space-y-1">
            <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" class="text-blue-600 underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Click "Create API Key"</li>
            <li>Copy and paste the key below</li>
          </ol>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <form id="api-key-form">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Gemini API Key</label>
            <input type="password" 
                   id="api-key-input" 
                   value="${apiKey}"
                   placeholder="Enter your Gemini API key"
                   class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                   required>
            
            <div class="flex space-x-3">
              <button type="submit" 
                      class="flex-1 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700">
                Save Key
              </button>
              ${
                apiKey
                  ? `
                <button type="button" 
                        onclick="App.clearApiKey()"
                        class="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700">
                  Clear
                </button>
              `
                  : ""
              }
            </div>
          </form>
        </div>
        
        ${apiKey ? Components.alert("API key is set and ready to use!", "success") : ""}
      </div>
    `;

    // Setup form
    document.getElementById("api-key-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveApiKey();
    });
  },

  // Save API key
  saveApiKey() {
    const input = document.getElementById("api-key-input");
    const apiKey = input.value.trim();

    if (apiKey) {
      Storage.setApiKey(apiKey);
      this.renderBYOK(document.getElementById("app-content"));
    }
  },

  // Clear API key
  clearApiKey() {
    if (confirm("Are you sure you want to clear your API key?")) {
      Storage.setApiKey("");
      this.renderBYOK(document.getElementById("app-content"));
    }
  },

  // Settings Page
  renderSettings(container) {
    const currentDiet = Storage.getDietType();
    const diets = [
      {
        name: "Normal",
        description: "Balanced meals with no restrictions",
      },
      {
        name: "Keto",
        description: "Low-carb, high-fat meals",
      },
      {
        name: "Vegan",
        description: "Plant-based, no animal products",
      },
      {
        name: "Weightloss",
        description: "Calorie-conscious, portion-controlled meals",
      },
      {
        name: "Bulking",
        description: "High-protein, high-calorie meals for muscle gain",
      },
    ];

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Settings</h2>
          <p class="text-gray-600">Customize your preferences</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Diet Type</h3>
          <p class="text-sm text-gray-600 mb-4">Select your dietary preference for recipe generation</p>
          
          <div class="space-y-3">
            ${diets
              .map(
                (diet) => `
              <label class="block p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${currentDiet === diet.name ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}">
                <div class="flex items-start">
                  <input type="radio" 
                         name="diet" 
                         value="${diet.name}" 
                         ${currentDiet === diet.name ? "checked" : ""}
                         onchange="App.changeDietType('${diet.name}')"
                         class="mr-3 mt-1">
                  <div class="flex-1">
                    <span class="font-semibold text-gray-800">${diet.name}</span>
                    <p class="text-xs text-gray-600 mt-1">${diet.description}</p>
                  </div>
                </div>
              </label>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
          <button onclick="App.clearAllData()" 
                  class="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700">
            Clear All Data
          </button>
          <p class="text-xs text-gray-500 mt-2">This will remove all recipes, fridge items, and settings</p>
        </div>
      </div>
    `;
  },

  // Change diet type
  changeDietType(type) {
    Storage.setDietType(type);
  },

  // Clear all data
  clearAllData() {
    if (
      confirm(
        "Are you sure? This will delete all your data including bookmarked recipes and fridge items.",
      )
    ) {
      localStorage.clear();
      Storage.init();
      alert("All data cleared!");
      window.location.hash = "home";
    }
  },

  // About Page
  renderAbout(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <div class="mb-4">
            <svg class="w-16 h-16 text-emerald-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Foodie</h2>
          <p class="text-gray-600">AI-Powered Recipe Generator</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">About</h3>
            <p class="text-gray-700">
              Foodie is a Progressive Web App that uses Google's Gemini AI to generate 
              personalized recipes based on your dietary preferences and available ingredients.
            </p>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Features</h3>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Generate custom recipes with AI</li>
              <li>Manage fridge inventory</li>
              <li>Bookmark favorite recipes</li>
              <li>Works offline (except generation)</li>
              <li>Dietary preferences support</li>
              <li>Calorie estimates</li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Privacy</h3>
            <p class="text-gray-700">
              All data is stored locally on your device. Your API key and recipes 
              never leave your device except when making requests to Gemini API.
            </p>
          </div>
          
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Version</h3>
            <p class="text-gray-700">1.0.0</p>
          </div>
        </div>
      </div>
    `;
  },

  // Show recipe detail modal
  showRecipeDetail(recipeId) {
    let recipe = this.currentRecipes.find((r) => r.id === recipeId);

    if (!recipe) {
      recipe = Storage.getBookmarkedRecipes().find((r) => r.id === recipeId);
    }

    if (!recipe) {
      recipe = Storage.getGeneratedRecipes().find((r) => r.id === recipeId);
    }

    if (!recipe) return;

    const modal = document.getElementById("recipe-modal");
    const modalContent = document.getElementById("modal-content");

    modalContent.innerHTML = Components.recipeDetail(recipe);
    modal.classList.remove("hidden");

    // Setup close button
    document.getElementById("close-modal").onclick = () => {
      modal.classList.add("hidden");
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    };
  },

  // Refresh recipe detail
  refreshRecipeDetail(recipeId) {
    this.showRecipeDetail(recipeId);
  },

  // Toggle bookmark
  toggleBookmark(recipeId) {
    const isBookmarked = Storage.isRecipeBookmarked(recipeId);

    if (isBookmarked) {
      Storage.unbookmarkRecipe(recipeId);
    } else {
      let recipe = this.currentRecipes.find((r) => r.id === recipeId);
      if (!recipe) {
        recipe = Storage.getGeneratedRecipes().find((r) => r.id === recipeId);
      }
      if (recipe) {
        Storage.bookmarkRecipe(recipe);
      }
    }

    // Refresh current view
    this.route();
  },
};

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
