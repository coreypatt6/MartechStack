# Deployment Guide

## 🚀 Deploy Your MarTech Stack Dashboard

This guide covers multiple deployment options for your MarTech Stack Dashboard.

## Option 1: Netlify (Recommended)

### Automatic Deployment from GitHub

1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select `coreypatt6/MartechStack`

2. **Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Deploy**:
   - Click "Deploy site"
   - Your site will be live in minutes
   - Auto-deploys on every push to main branch

### Manual Deployment

```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Option 2: Vercel

### Automatic Deployment

1. **Import Project**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `coreypatt6/MartechStack`

2. **Configuration**:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Deploy**:
   - Click "Deploy"
   - Live in seconds with automatic HTTPS

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Option 3: GitHub Pages

### Setup GitHub Actions

1. **Create Workflow File**:
   - File already exists: `.github/workflows/ci.yml`
   - Includes deployment to GitHub Pages

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Pages section
   - Source: GitHub Actions

3. **Deploy**:
   - Push to main branch
   - Action runs automatically
   - Site available at: `https://coreypatt6.github.io/MartechStack`

### Manual GitHub Pages Setup

```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

## Option 4: Custom Server

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Build the project
npm run build

# Serve with PM2
pm2 serve dist 3000 --name "martech-dashboard"
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t martech-dashboard .
docker run -p 80:80 martech-dashboard
```

## Environment Variables

### For Production Deployment

Create `.env.production`:
```env
VITE_APP_NAME=MarTech Stack Dashboard
VITE_APP_VERSION=2.0.0
VITE_APP_ENV=production
```

### For Different Environments

```env
# Development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# Staging
VITE_API_URL=https://staging-api.example.com
VITE_DEBUG=false

# Production
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

## Performance Optimization

### Build Optimization

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
});
```

### CDN Integration

For faster loading, consider using a CDN:

```html
<!-- In index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## SSL/HTTPS Setup

### Automatic (Recommended)
- **Netlify**: Automatic HTTPS with Let's Encrypt
- **Vercel**: Automatic HTTPS included
- **GitHub Pages**: Automatic HTTPS for custom domains

### Manual SSL Setup
```bash
# Using Certbot for custom server
sudo certbot --nginx -d yourdomain.com
```

## Custom Domain Setup

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

### Vercel
1. Go to Project settings → Domains
2. Add domain
3. Configure DNS

### GitHub Pages
1. Repository Settings → Pages
2. Custom domain field
3. Add CNAME record in DNS

## Monitoring & Analytics

### Add Google Analytics

```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Hotjar** for user behavior

## Backup & Recovery

### Database Backup (if using external DB)
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
```

### Code Backup
- Repository is already backed up on GitHub
- Consider additional backup to different service

## Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Routing Issues**:
   - Add `_redirects` file for Netlify:
   ```
   /*    /index.html   200
   ```

3. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Check deployment platform settings

### Performance Issues
- Enable gzip compression
- Optimize images
- Use lazy loading
- Implement caching headers

Your MarTech Stack Dashboard is now ready for production deployment! 🚀