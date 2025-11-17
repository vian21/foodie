// components.js - Reusable UI Components

const Components = {
  // Create a recipe card
  recipeCard(recipe) {
    const isBookmarked = Storage.isRecipeBookmarked(recipe.id);

    return `
      <div class="bg-white rounded-lg shadow-md p-4 fade-in cursor-pointer hover:shadow-lg transition-shadow h-full" 
           onclick="App.showRecipeDetail('${recipe.id}')">
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-bold text-gray-800 flex-1">${recipe.name}</h3>
          <button onclick="event.stopPropagation(); App.toggleBookmark('${recipe.id}')" 
                  class="ml-2 focus:outline-none">
            ${isBookmarked ? '<svg class="w-6 h-6 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>' : '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>'}
          </button>
        </div>
        
        <div class="flex items-center text-sm text-gray-600 space-x-4 mb-2">
          <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">
            ${recipe.mealType}
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.5 3 4.5 5 4.5 9 0 2.5-2 4.5-4.5 4.5S7.5 13.5 7.5 11c0-2 1-3.5 1.5-4.5C9.5 8 11 9 12 9c-1.5-2-1.5-4.5 0-7z"/><path d="M12 15.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/></svg>
            ${recipe.calories} cal
          </span>
          ${
            recipe.servings
              ? `<span class="flex items-center">
            <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            ${recipe.servings}
          </span>`
              : ""
          }
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
                  class="focus:outline-none">
            ${isBookmarked ? '<svg class="w-8 h-8 text-yellow-500 fill-current" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>' : '<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>'}
          </button>
        </div>
        
        <div class="flex items-center space-x-4 text-sm">
          <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
            ${recipe.mealType}
          </span>
          <span class="text-gray-600 flex items-center">
            <svg class="w-4 h-4 text-orange-500 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.5 3 4.5 5 4.5 9 0 2.5-2 4.5-4.5 4.5S7.5 13.5 7.5 11c0-2 1-3.5 1.5-4.5C9.5 8 11 9 12 9c-1.5-2-1.5-4.5 0-7z"/><path d="M12 15.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5z"/></svg>
            ${recipe.calories} calories
          </span>
          ${
            recipe.servings
              ? `<span class="text-gray-600 flex items-center">
            <svg class="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Serves ${recipe.servings}
          </span>`
              : ""
          }
          <span class="text-gray-600 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            ${recipe.dietType}
          </span>
        </div>
        
        <div class="border-t pt-4">
          <h3 class="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
          <ul class="space-y-2">
            ${recipe.ingredients
              .map((ingredient) => {
                // Handle both string format (from recipe generator) and object format (from recipe finder)
                if (typeof ingredient === "string") {
                  return `
                      <li class="flex items-start">
                        <span class="text-emerald-600 mr-2">•</span>
                        <span class="text-gray-700">${ingredient}</span>
                      </li>
                    `;
                } else {
                  // Object format with inFridge and alternative properties
                  return `
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
                    `;
                }
              })
              .join("")}
          </ul>
          ${recipe.ingredients.some((i) => typeof i === "object" && i.inFridge !== undefined) && Storage.getFridgeItems().length > 0 ? '<p class="text-sm text-gray-500 mt-3"><svg class="w-4 h-4 inline text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> = Available in your fridge</p>' : ""}
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
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `;
  },
};
