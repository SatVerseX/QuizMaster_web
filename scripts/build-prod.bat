@echo off
REM Production Build Script for Windows

echo 🚀 Building for production...

REM Set environment variables
set NODE_ENV=production

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Install dependencies if needed
echo 📦 Installing dependencies...
npm install

REM Build the application
echo 🔨 Building application...
npm run build:prod

echo ✅ Production build completed!
echo 📁 Build output: dist/
echo 🌍 Environment: production
echo 🔒 Debug logging: disabled

pause 