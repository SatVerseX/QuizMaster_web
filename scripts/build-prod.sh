#!/bin/bash

# Production Build Script
echo "🚀 Building for production..."

# Set environment variables
export NODE_ENV=production

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build:prod

# Update HTML meta tag for production
echo "🏷️  Updating environment meta tag..."
sed -i 's/content="development"/content="production"/g' dist/index.html

# Add environment to window object
echo "🌐 Adding environment to window object..."
sed -i 's/<script type="module" src="\/src\/main.jsx"><\/script>/<script>window.__ENV__="production";<\/script>\n    <script type="module" src="\/src\/main.jsx"><\/script>/g' dist/index.html

echo "✅ Production build completed!"
echo "📁 Build output: dist/"
echo "🌍 Environment: production"
echo "🔒 Debug logging: disabled" 