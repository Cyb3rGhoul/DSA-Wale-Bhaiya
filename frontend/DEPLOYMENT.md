# Frontend Deployment Guide

## Vercel Deployment

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### 2. Configure Build Settings
Vercel should auto-detect these settings, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
- `VITE_GEMINI_API_KEY` = `your-gemini-api-key`

**Optional:**
- `VITE_NODE_ENV` = `production`
- `VITE_APP_NAME` = `DSA Brother Bot`
- `VITE_APP_VERSION` = `1.0.0`

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

### 5. Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Development (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
VITE_GEMINI_API_KEY=your-key-here
```

### Production (Vercel Dashboard)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_NODE_ENV=production
VITE_GEMINI_API_KEY=your-key-here
```

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Ensure no console.log statements in production code
- Verify all imports are correct

### API Calls Fail
- Check VITE_API_URL is correct
- Verify backend is deployed and accessible
- Check CORS settings on backend

### Routing Issues
- Vercel should handle SPA routing automatically
- Check vercel.json configuration
- Ensure _redirects file is in public folder