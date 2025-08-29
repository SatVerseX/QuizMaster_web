# Build Instructions for QuizMaster

## Environment Setup

### Development
```bash
npm run dev
```
- Debug logging enabled
- Source maps enabled
- Hot reload enabled

### Production Build

#### Option 1: Direct Build
```bash
npm run build:prod
```

#### Option 2: Windows Script
```bash
npm run build:prod:win
```

#### Option 3: Unix/Linux/Mac Script
```bash
npm run build:prod:unix
```

### Development Build
```bash
npm run build:dev
```

## What Happens in Production

✅ **Debug logging disabled** - Users won't see console.log statements  
✅ **Source maps removed** - Code is minified and obfuscated  
✅ **Environment detection** - Automatically detects production environment  
✅ **Performance optimized** - Vendor chunks and tree shaking enabled  

## Environment Detection

The app automatically detects the environment:
- **Development**: Shows all debug logs
- **Production**: Hides debug logs, shows only errors
- **Staging**: Configurable logging level

## Build Output

After building, your production files will be in the `dist/` folder:
- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, and other assets
- `dist/` - Ready to deploy to any static hosting service

## Deployment

### Netlify
1. Build the project: `npm run build:prod`
2. Upload `dist/` folder to Netlify
3. Set build command: `npm run build:prod`
4. Set publish directory: `dist`

### Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build:prod`
3. Set output directory: `dist`
4. Deploy automatically

### Firebase Hosting
1. Build: `npm run build:prod`
2. Initialize Firebase: `firebase init hosting`
3. Set public directory: `dist`
4. Deploy: `firebase deploy`

## Troubleshooting

### Debug Logs Still Showing
- Ensure you're using `npm run build:prod`
- Check that `NODE_ENV=production` is set
- Verify the build output doesn't contain console.log statements

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 16+)
- Verify all dependencies are installed: `npm install`

## Security Notes

- Production builds automatically remove debug information
- Environment variables are embedded at build time
- Source code is minified and obfuscated
- Only essential error logging remains for production debugging 