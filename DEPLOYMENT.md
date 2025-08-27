# FreelanceTrack - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Vercel Project Setup
- Go to [vercel.com](https://vercel.com) and sign in with GitHub
- Click "New Project" and import your `FreelanceTrack` repository
- Vercel will auto-detect Next.js configuration

### 2. Environment Variables Configuration
In your Vercel project settings, add these environment variables:

**Initial Deployment (Required):**
```env
DATABASE_URL=postgresql://neondb_owner:npg_Vp1lbsqAfCc4@ep-spring-night-a1qukzl4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET=aaron-freelancetrack-super-secure-production-secret-2025-make-this-very-long-and-random

NODE_ENV=production
```

**After First Deployment (Add this):**
```env
NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
```

> **Note**: Vercel will give you the URL after the first deployment. Then add NEXTAUTH_URL and redeploy.

### 3. Database Setup
Your Neon PostgreSQL database is already configured. The deployment will automatically:
- Generate Prisma client
- Push database schema
- Create all necessary tables

### 4. Custom Domain (Optional)
- In Vercel project settings > Domains
- Add your custom domain if you have one
- Vercel provides free `.vercel.app` subdomain

## 📋 Pre-Deployment Checklist

✅ GitHub repository is up to date
✅ Environment variables are configured in Vercel
✅ Database connection string is valid
✅ All dependencies are in package.json
✅ Prisma schema is set to PostgreSQL

## 🔧 Build Configuration

Vercel will use these commands:
- **Build Command**: `next build && prisma db push`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 🎯 Expected Result

Your app will be available at:
- `https://freelancetrack-aaron.vercel.app` (or similar)
- All features working with PostgreSQL backend
- Automatic SSL certificate
- Global CDN distribution

## 🐛 Troubleshooting

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables are correct
3. Ensure DATABASE_URL includes `?sslmode=require`
4. Check that all dependencies are in package.json

## 📊 Post-Deployment

After successful deployment:
1. Test user registration/login
2. Create a sample client/project
3. Test invoice generation
4. Verify database persistence

---

**Created by**: Aaron George Abraham  
**Location**: Bengaluru, India  
**Email**: aarongeo1211@gmail.com