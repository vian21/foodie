# Foodie - AI-Powered Recipe Generator PWA

A Progressive Web App that generates personalized recipes using Google's Gemini AI based on your dietary preferences and available ingredients.

## Features

- **AI Recipe Generation**: Generate 10 unique recipes at a time using Gemini AI
- **Meal Types**: Choose from Breakfast, Lunch, Dinner, or Snack
- **Fridge Management**: Track ingredients you have available
- **Bookmarked Recipes**: Save your favorite recipes for later
- **Dietary Preferences**: Support for Keto, Vegan, Weightloss, Bulking, and Normal diets
- **Offline Support**: App works offline (except recipe generation)
- **Recipe Details**: Full recipes with ingredients, step-by-step instructions, and calorie estimates
- **PWA Features**: Installable on mobile devices

## Getting Started

### Prerequisites

- A web server (can be a simple HTTP server)
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone or download this repository

2. Serve the files using any web server. For example:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server -p 8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

4. Set up your Gemini API key:
   - Click the hamburger menu
   - Go to "BYOK" (Bring Your Own Key)
   - Enter your Gemini API key
   - Click "Save Key"

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in the BYOK page of the app

## Usage

### Generating Recipes

1. Go to the Home page
2. Select a meal type (Breakfast, Lunch, Dinner, or Snack)
3. Click "Generate 10 Recipes"
4. Wait for AI to generate recipes
5. Click "Generate More" to add more recipes

### Managing Your Fridge

1. Go to the Fridge page
2. Add ingredients you have available
3. The AI will use these ingredients when generating recipes

### Bookmarking Recipes

1. Click the star icon on any recipe card
2. View all bookmarked recipes in the "Recipes" page

### Changing Settings

1. Go to Settings
2. Select your dietary preference
3. The AI will generate recipes matching your diet type

## Project Structure

```
foodie/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline functionality
├── js/
│   ├── app.js             # Main application logic & routing
│   ├── storage.js         # localStorage management
│   ├── gemini.js          # Gemini AI integration
│   └── components.js      # Reusable UI components
└── assets/
    └── icons/             # PWA icons
```

## Technologies Used

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Vanilla JavaScript**: No frameworks, pure JS
- **Google Gemini API**: AI recipe generation
- **Service Workers**: Offline functionality
- **LocalStorage**: Client-side data persistence
- **PWA**: Progressive Web App features

## Privacy & Data

- All data is stored locally in your browser using localStorage
- Your API key never leaves your device except when making requests to Gemini API
- No data is sent to any third-party servers
- Clear all data anytime from the Settings page

## Browser Support

Works on all modern browsers that support:

- ES6+ JavaScript
- Service Workers
- LocalStorage
- Fetch API

## Offline Functionality

The app works offline except for recipe generation, which requires an internet connection to communicate with the Gemini API.

## License

This project is open source and available for personal and educational use.

## Troubleshooting

**Recipes not generating?**

- Make sure you've set your API key in the BYOK page
- Check that you have an internet connection
- Verify your API key is valid

**PWA not installing?**

- Make sure you're accessing the app via HTTPS (or localhost)
- Check that your browser supports PWAs
- Try clearing cache and reloading

**Data disappeared?**

- Check if browser data was cleared
- LocalStorage data is browser-specific

## Future Enhancements

Potential features for future versions:

- Recipe images (if Gemini supports it)
- Recipe sharing
- Meal planning calendar
- Nutritional information beyond calories
- Shopping list generation
- Recipe search and filtering
