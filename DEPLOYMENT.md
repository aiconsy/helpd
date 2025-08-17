# 🚀 Deployment Guide

This guide covers deploying the HelpD app to various hosting platforms.

## 📋 Pre-Deployment Checklist

- [ ] All tests pass (`npm run build` successful)
- [ ] No console errors in development
- [ ] PWA features working correctly
- [ ] All language files present
- [ ] Environment variables configured (if needed)

## 🌐 Hostinger Deployment

### ⚠️ **IMPORTANT LIMITATIONS**
Hostinger shared hosting has significant limitations:
- **No Node.js runtime support**
- **No server-side rendering (SSR)**
- **Limited to static files only**

### 🔧 **Required Changes for Hostinger**

Since Hostinger doesn't support Node.js, you'll need to:

1. **Convert to Static Export**
   ```bash
   # Add to next.config.js
   output: 'export'
   trailingSlash: true
   ```

2. **Create PHP Backend** (for database operations)
   - Replace Supabase with MySQL
   - Create PHP API endpoints
   - Update frontend to use PHP API

3. **Alternative: Use Different Hosting**
   - **Vercel** (recommended for Next.js)
   - **Netlify**
   - **Railway**
   - **DigitalOcean App Platform**

## 🚀 **Recommended: Vercel Deployment**

### **Step 1: Prepare for Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

### **Step 2: Deploy**
```bash
# Deploy to Vercel
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set project name
# - Set build command: npm run build
# - Set output directory: .next
```

### **Step 3: Configure Domain**
- Connect custom domain in Vercel dashboard
- Configure DNS settings
- Enable HTTPS automatically

## 🌍 **Netlify Deployment**

### **Step 1: Build Configuration**
```bash
# Build command
npm run build

# Publish directory
.next
```

### **Step 2: Deploy**
1. Connect GitHub repository
2. Set build settings
3. Deploy automatically

## 🐳 **Docker Deployment**

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **Build and Run**
```bash
# Build image
docker build -t helpd-app .

# Run container
docker run -p 3000:3000 helpd-app
```

## 🔧 **Environment Configuration**

### **Production Environment Variables**
```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### **PWA Configuration**
```json
// public/manifest.json
{
  "name": "HelpD Logistics",
  "short_name": "HelpD",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff"
}
```

## 📱 **PWA Deployment Checklist**

- [ ] Service worker generated (`public/sw.js`)
- [ ] Manifest file configured
- [ ] Icons in multiple sizes
- [ ] HTTPS enabled (required for PWA)
- [ ] Offline functionality tested

## 🧪 **Post-Deployment Testing**

### **Functionality Tests**
1. **Homepage**: Loads correctly
2. **Language Switching**: All languages work
3. **Role Navigation**: Worker, FLS, Admin pages
4. **PWA Installation**: Can install on mobile
5. **Offline Mode**: Works without internet

### **Performance Tests**
- **Page Load Speed**: < 3 seconds
- **Mobile Performance**: Optimized for mobile
- **PWA Features**: Service worker active

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **PWA Not Working**
   - Check HTTPS is enabled
   - Verify service worker is generated
   - Check browser console for errors

3. **Language Issues**
   - Verify all locale files exist
   - Check middleware configuration
   - Test language switching

### **Performance Issues**
- Enable Next.js analytics
- Check bundle size
- Optimize images and assets

## 🔒 **Security Considerations**

### **Production Security**
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] API endpoints protected
- [ ] Rate limiting implemented

### **Monitoring**
- Set up error tracking (Sentry)
- Configure performance monitoring
- Set up uptime monitoring

## 📊 **Analytics and Monitoring**

### **Recommended Tools**
- **Vercel Analytics** (if using Vercel)
- **Google Analytics**
- **Sentry** (error tracking)
- **Uptime Robot** (uptime monitoring)

## 🎯 **Next Steps After Deployment**

1. **Set up monitoring and analytics**
2. **Configure backup and recovery**
3. **Set up CI/CD pipeline**
4. **Plan scaling strategy**
5. **Document deployment procedures**

---

**Need Help?** Create an issue in the repository or contact the development team.
