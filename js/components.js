// components.js - Reusable UI Components

const Components = {
  // Create a recipe card
  recipeCard(recipe) {
    const isBookmarked = Storage.isRecipeBookmarked(recipe.id);

    return `
      <div class="bg-white rounded-lg shadow-md p-4 mb-4 fade-in cursor-pointer hover:shadow-lg transition-shadow" 
           onclick="App.showRecipeDetail('${recipe.id}')">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-bold text-gray-800 flex-1">${recipe.name}</h3>
          <button onclick="event.stopPropagation(); App.toggleBookmark('${recipe.id}')" 
                  class="ml-2 text-2xl focus:outline-none">
            ${isBookmarked ? "⭐" : "☆"}
          </button>
        </div>
        
        <div class="flex items-center text-sm text-gray-600 space-x-4 mb-2">
          <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">
            ${recipe.mealType}
          </span>
          <span class="flex items-center">
            🔥 ${recipe.calories} cal
          </span>
        </div>
        
        <p class="text-sm text-gray-600">
          ${recipe.ingredients.length} ingredients • ${recipe.instructions.length} steps
        </p>
      </div>
    `;
  },

  // Create recipe detail view
  recipeDetail(recipe) {
    const isBookmarked = Storage.isRecipeBookmarked(recipe.id);

    return `
      <div class="space-y-4">
        <div class="flex justify-between items-start">
          <h2 class="text-2xl font-bold text-gray-800">${recipe.name}</h2>
          <button onclick="App.toggleBookmark('${recipe.id}'); App.refreshRecipeDetail('${recipe.id}')" 
                  class="text-3xl focus:outline-none">
            ${isBookmarked ? "⭐" : "☆"}
          </button>
        </div>
        
        <div class="flex items-center space-x-4 text-sm">
          <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
            ${recipe.mealType}
          </span>
          <span class="text-gray-600">🔥 ${recipe.calories} calories</span>
          <span class="text-gray-600 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            ${recipe.dietType}
          </span>
        </div>
        
        <div class="border-t pt-4">
          <h3 class="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
          <ul class="space-y-2">
            ${recipe.ingredients
              .map(
                (ingredient) => `
              <li class="flex items-start">
                <span class="text-emerald-600 mr-2">•</span>
                <span class="text-gray-700">${ingredient}</span>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
        
        <div class="border-t pt-4">
          <h3 class="text-xl font-bold text-gray-800 mb-3">Instructions</h3>
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

  // Loading spinner
  loadingSpinner(message = "Loading...") {
    return `
      <div class="flex flex-col items-center justify-center py-12">
        <div class="spinner mb-4"></div>
        <p class="text-gray-600">${message}</p>
      </div>
    `;
  },

  // Empty state
  emptyState(icon, title, message, actionButton = null) {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="text-6xl mb-4">${icon}</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
        <p class="text-gray-600 mb-6">${message}</p>
        ${actionButton || ""}
      </div>
    `;
  },

  // Alert/notification
  alert(message, type = "info") {
    const colors = {
      success: "bg-green-100 text-green-800 border-green-300",
      error: "bg-red-100 text-red-800 border-red-300",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
      info: "bg-blue-100 text-blue-800 border-blue-300",
    };

    return `
      <div class="${colors[type]} border-l-4 p-4 mb-4 rounded fade-in" role="alert">
        <p>${message}</p>
      </div>
    `;
  },

  // Fridge item
  fridgeItem(item) {
    return `
      <div class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm mb-2">
        <span class="text-gray-800">${item}</span>
        <button onclick="App.removeFridgeItem('${item}')" 
                class="text-red-600 hover:text-red-800 focus:outline-none">
          ✕
        </button>
      </div>
    `;
  },
};
