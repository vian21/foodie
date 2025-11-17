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
      case "recipe-finder":
        this.renderRecipeFinder(contentArea);
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
        
        ${!hasApiKey ? Components.alert('Please set your Gemini API key in the <a href="#byok" class="font-semibold underline hover:text-yellow-900">BYOK page</a> to generate recipes.', "warning") : ""}
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
          <select id="meal-type" class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          
          <label class="block text-sm font-semibold text-gray-700 mb-2">Servings</label>
          <div class="flex items-center space-x-3 mb-4">
            <button type="button" id="servings-decrease" 
                    class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            <input type="number" id="servings" value="1" min="1" max="10" 
                   class="w-20 text-center p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
            <button type="button" id="servings-increase" 
                    class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          
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

    // Setup servings controls
    this.setupServingsControls();

    // Setup generate button
    if (hasApiKey) {
      document.getElementById("generate-btn").addEventListener("click", () => {
        this.generateRecipes(false);
      });
    }
  },

  // Setup servings increment/decrement controls
  setupServingsControls() {
    const servingsInput = document.getElementById("servings");
    const decreaseBtn = document.getElementById("servings-decrease");
    const increaseBtn = document.getElementById("servings-increase");

    decreaseBtn.addEventListener("click", () => {
      const current = parseInt(servingsInput.value);
      if (current > 1) {
        servingsInput.value = current - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      const current = parseInt(servingsInput.value);
      if (current < 10) {
        servingsInput.value = current + 1;
      }
    });
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
        <h3 class="text-xl font-bold text-gray-800">${recipes.length} Recipes Generated</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${recipes.map((recipe) => Components.recipeCard(recipe)).join("")}
        </div>
        <div class="flex justify-center pt-4">
          <button onclick="App.generateRecipes(true)" 
                  class="bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors">
            Generate More
          </button>
        </div>
      </div>
    `;
  },

  // Generate recipes
  async generateRecipes(addMore = false) {
    const mealType = document.getElementById("meal-type").value;
    const servings = parseInt(document.getElementById("servings").value) || 1;
    const container = document.getElementById("recipes-container");

    container.innerHTML = Components.loadingSpinner(
      "Generating delicious recipes...",
    );

    try {
      const newRecipes = await Gemini.generateRecipes(mealType, 10, servings);

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
            : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${bookmarked.map((recipe) => Components.recipeCard(recipe)).join("")}
              </div>`
        }
      </div>
    `;
  },

  // Recipe Finder Page
  renderRecipeFinder(container) {
    const hasApiKey = Gemini.hasApiKey();
    const foundRecipe = this.foundRecipe || null;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Recipe Finder</h2>
          <p class="text-gray-600">Tell us what recipe you want to make</p>
        </div>
        
        ${!hasApiKey ? Components.alert('Please set your Gemini API key in the <a href="#byok" class="font-semibold underline hover:text-yellow-900">BYOK page</a> to find recipes.', "warning") : ""}
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <form id="recipe-finder-form">
            <label class="block text-sm font-semibold text-gray-700 mb-2">What recipe do you want to make?</label>
            <input type="text" 
                   id="recipe-name-input" 
                   placeholder="e.g., Spaghetti Carbonara, Chicken Tikka Masala"
                   class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                   required>
            
            <label class="block text-sm font-semibold text-gray-700 mb-2">Servings</label>
            <div class="flex items-center space-x-3 mb-4">
              <button type="button" id="finder-servings-decrease" 
                      class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <input type="number" id="finder-servings" value="2" min="1" max="10" 
                     class="w-20 text-center p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              <button type="button" id="finder-servings-increase" 
                      class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            
            <button type="submit" 
                    class="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors ${!hasApiKey ? "opacity-50 cursor-not-allowed" : ""}"
                    ${!hasApiKey ? "disabled" : ""}>
              Find Recipe
            </button>
          </form>
        </div>
        
        <div id="recipe-result">
          ${foundRecipe ? this.renderFoundRecipe(foundRecipe) : ""}
        </div>
      </div>
    `;

    // Setup servings controls
    this.setupFinderServingsControls();

    // Setup form submission
    if (hasApiKey) {
      document
        .getElementById("recipe-finder-form")
        .addEventListener("submit", (e) => {
          e.preventDefault();
          this.findSpecificRecipe();
        });
    }
  },

  // Setup servings controls for recipe finder
  setupFinderServingsControls() {
    const servingsInput = document.getElementById("finder-servings");
    const decreaseBtn = document.getElementById("finder-servings-decrease");
    const increaseBtn = document.getElementById("finder-servings-increase");

    if (decreaseBtn && increaseBtn && servingsInput) {
      decreaseBtn.addEventListener("click", () => {
        const current = parseInt(servingsInput.value);
        if (current > 1) {
          servingsInput.value = current - 1;
        }
      });

      increaseBtn.addEventListener("click", () => {
        const current = parseInt(servingsInput.value);
        if (current < 10) {
          servingsInput.value = current + 1;
        }
      });
    }
  },

  // Find specific recipe
  async findSpecificRecipe() {
    const recipeName = document
      .getElementById("recipe-name-input")
      .value.trim();
    const servings =
      parseInt(document.getElementById("finder-servings").value) || 2;
    const container = document.getElementById("recipe-result");

    container.innerHTML = Components.loadingSpinner("Finding your recipe...");

    try {
      const recipe = await Gemini.generateSpecificRecipe(recipeName, servings);
      this.foundRecipe = recipe;
      container.innerHTML = this.renderFoundRecipe(recipe);
    } catch (error) {
      container.innerHTML = Components.alert(error.message, "error");
    }
  },

  // Render found recipe with ingredient alternatives
  renderFoundRecipe(recipe) {
    // Ingredients are already processed by AI with inFridge and alternative fields
    const ingredientsData = recipe.ingredients || [];

    return `
      <div class="bg-white rounded-lg shadow-md p-6 fade-in">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-2xl font-bold text-gray-800">${recipe.name}</h3>
          <button onclick="App.bookmarkFoundRecipe()" 
                  class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            Save Recipe
          </button>
        </div>
        
        <div class="flex items-center space-x-4 text-sm mb-4">
          <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
            ${recipe.mealType}
          </span>
          <span class="text-gray-600 flex items-center">
            <svg class="w-4 h-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.5 3 4.5 5 4.5 9 0 2.5-2 4.5-4.5 4.5S7.5 13.5 7.5 11c0-2 1-3.5 1.5-4.5C9.5 8 11 9 12 9c-1.5-2-1.5-4.5 0-7z"/><path d="M12 15.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/></svg>
            ${recipe.calories} calories
          </span>
          <span class="text-gray-600 flex items-center">
            <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Serves ${recipe.servings}
          </span>
        </div>
        
        <div class="border-t pt-4 mb-4">
          <h4 class="text-xl font-bold text-gray-800 mb-3">Ingredients</h4>
          <ul class="space-y-2">
            ${ingredientsData
              .map(
                (ingredient) => `
              <li class="flex items-start">
                ${
                  ingredient.inFridge
                    ? '<svg class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
                    : '<svg class="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none"/></svg>'
                }
                <div class="flex-1">
                  <span class="text-gray-700 ${!ingredient.inFridge ? "text-gray-500" : ""}">${ingredient.item}</span>
                  ${ingredient.alternative ? `<div class="text-sm text-blue-600 mt-1">💡 Alternative: ${ingredient.alternative}</div>` : ""}
                </div>
              </li>
            `,
              )
              .join("")}
          </ul>
          ${Storage.getFridgeItems().length > 0 ? '<p class="text-sm text-gray-500 mt-3"><svg class="w-4 h-4 inline text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> = Available in your fridge</p>' : ""}
        </div>
        
        <div class="border-t pt-4">
          <h4 class="text-xl font-bold text-gray-800 mb-3">Instructions</h4>
          <ol class="space-y-3">
            ${recipe.instructions
              .map(
                (instruction, index) => `
              <li class="flex items-start">
                <span class="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  ${index + 1}
                </span>
                <span class="text-gray-700 pt-0.5">${instruction}</span>
              </li>
            `,
              )
              .join("")}
          </ol>
        </div>
      </div>
    `;
  },

  // Bookmark found recipe
  bookmarkFoundRecipe() {
    if (this.foundRecipe) {
      Storage.bookmarkRecipe(this.foundRecipe);
      alert("Recipe saved to My Recipes!");
    }
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
        // Refocus the input field after re-rendering
        setTimeout(() => {
          const newInput = document.getElementById("fridge-item-input");
          if (newInput) {
            newInput.focus();
          }
        }, 0);
      } else {
        alert("This item is already in your fridge!");
        input.focus();
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
    const currentModel = Storage.getModel() || "gemini-2.5-flash-lite";

    container.innerHTML = `
      <div class="space-y-6">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Bring Your Own Key</h2>
          <p class="text-gray-600">Configure your Gemini API settings</p>
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
            
            <label class="block text-sm font-semibold text-gray-700 mb-2">Model Selection</label>
            <select id="model-select" 
                    class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              ${Object.entries(Gemini.MODELS)
                .map(
                  ([value, label]) => `
                <option value="${value}" ${currentModel === value ? "selected" : ""}>${label}</option>
              `,
                )
                .join("")}
            </select>
            <p class="text-xs text-gray-500 mb-4">Different models have different capabilities and pricing. Flash Lite is recommended for most users.</p>
            
            <div class="flex space-x-3">
              <button type="submit" 
                      class="flex-1 bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700">
                Save Settings
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
    const modelSelect = document.getElementById("model-select");
    const apiKey = input.value.trim();
    const model = modelSelect.value;

    if (apiKey) {
      Storage.setApiKey(apiKey);
      Storage.setModel(model);
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
